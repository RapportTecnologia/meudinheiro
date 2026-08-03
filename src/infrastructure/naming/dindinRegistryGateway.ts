import { Contract, ZeroAddress, getAddress, hexlify, isAddress, randomBytes, type Signer } from 'ethers';
import { dindinLabelHash, formatDindinName, GLOBAL_NAMING_SCOPE } from '../../domain/naming/dindinName';
import type { Address } from '../../domain/wallet/types';
import { provider } from '../blockchain/polygon';
import { secureSecrets } from '../storage/secureSecrets';

const ABI = [
  'function resolve(bytes32 labelHash) view returns (address)',
  'function commitments(bytes32 commitment) view returns (uint64)',
  'function minimumCommitmentAge() view returns (uint64)',
  'function makeCommitment(bytes32 labelHash,address owner,bytes32 scope,bytes32 secret) view returns (bytes32)',
  'function effectiveFee(bytes32 scope) view returns (address token,uint256 amount,address treasury,bytes32 appliedScope)',
  'function commit(bytes32 commitment)',
  'function register(bytes32 labelHash,address owner,bytes32 scope,bytes32 secret) payable',
] as const;

const ERC20_ABI = [
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
] as const;

function registryAddress(): Address {
  const value = process.env.EXPO_PUBLIC_DINDIN_REGISTRY_ADDRESS?.trim() ?? '';
  if (!isAddress(value) || getAddress(value) === ZeroAddress) throw new Error('Registro .dindin não configurado para esta versão.');
  return getAddress(value) as Address;
}

function contract(signerOrProvider: Signer | typeof provider = provider) {
  return new Contract(registryAddress(), ABI, signerOrProvider);
}

function secretRef(owner: string, label: string) {
  return `dindin.commit.${owner.toLowerCase()}.${dindinLabelHash(label).slice(2)}`;
}

export const dindinRegistryGateway = {
  async resolve(rawName: string): Promise<Address> {
    const address = String(await contract().getFunction('resolve')(dindinLabelHash(rawName)));
    if (!isAddress(address) || getAddress(address) === ZeroAddress) throw new Error(`${formatDindinName(rawName)} não está registrado.`);
    return getAddress(address) as Address;
  },

  async quote() {
    const [token, amount, treasury, appliedScope] = await contract().getFunction('effectiveFee')(GLOBAL_NAMING_SCOPE);
    return { token: getAddress(String(token)) as Address, amount: BigInt(amount), treasury: String(treasury), appliedScope: String(appliedScope) };
  },

  async begin(rawName: string, owner: Address, signer: Signer) {
    const labelHash = dindinLabelHash(rawName);
    const current = String(await contract().getFunction('resolve')(labelHash));
    if (current !== ZeroAddress) throw new Error('Este nome já está registrado.');
    const secret = hexlify(randomBytes(32));
    await secureSecrets.save(secretRef(owner, rawName), secret);
    const writable = contract(signer);
    const commitment = await writable.getFunction('makeCommitment')(labelHash, owner, GLOBAL_NAMING_SCOPE, secret);
    const transaction = await writable.getFunction('commit')(commitment);
    await transaction.wait();
    return formatDindinName(rawName);
  },

  async complete(rawName: string, owner: Address, signer: Signer) {
    const ref = secretRef(owner, rawName);
    const secret = await secureSecrets.get(ref);
    if (!secret) throw new Error('Compromisso local não encontrado; não revele outro segredo.');
    const writable = contract(signer);
    const commitment = await writable.getFunction('makeCommitment')(dindinLabelHash(rawName), owner, GLOBAL_NAMING_SCOPE, secret);
    const [committedAt, minimumAge] = await Promise.all([
      writable.getFunction('commitments')(commitment),
      writable.getFunction('minimumCommitmentAge')(),
    ]);
    if (BigInt(committedAt) === 0n) throw new Error('Commitment ainda não foi confirmado na Polygon.');
    const readyAt = Number(committedAt) + Number(minimumAge);
    if (Date.now() < readyAt * 1000) throw new Error(`Aguarde ${Math.ceil((readyAt * 1000 - Date.now()) / 1000)} segundo(s) para revelar.`);

    const fee = await this.quote();
    if (fee.token !== ZeroAddress && fee.amount > 0n) {
      const feeToken = new Contract(fee.token, ERC20_ABI, signer);
      const signerAddress = await signer.getAddress();
      const allowance = BigInt(await feeToken.getFunction('allowance')(signerAddress, registryAddress()));
      if (allowance < fee.amount) await (await feeToken.getFunction('approve')(registryAddress(), fee.amount)).wait();
    }
    const transaction = await writable.getFunction('register')(
      dindinLabelHash(rawName), owner, GLOBAL_NAMING_SCOPE, secret,
      fee.token === ZeroAddress ? { value: fee.amount } : {},
    );
    await transaction.wait();
    await secureSecrets.remove(ref);
    return formatDindinName(rawName);
  },

  async hasPendingCommit(rawName: string, owner: Address) {
    return Boolean(await secureSecrets.get(secretRef(owner, rawName)));
  },
};
