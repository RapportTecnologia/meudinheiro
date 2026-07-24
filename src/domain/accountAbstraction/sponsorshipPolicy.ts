import { Interface, ZeroAddress, getAddress, isHexString } from 'ethers';
import type {
  PackedUserOperationV07,
  PreparedSponsoredTransfer,
  SponsoredTransferIntent,
} from './types';
import type { Address } from '../wallet/types';

const SIMPLE_ACCOUNT_INTERFACE = new Interface([
  'function execute(address dest,uint256 value,bytes func)',
]);
const ERC20_INTERFACE = new Interface([
  'function transfer(address recipient,uint256 amount) returns (bool)',
]);
const SIMPLE_ACCOUNT_FACTORY_INTERFACE = new Interface([
  'function createAccount(address owner,uint256 salt) returns (address)',
]);

const UINT128_MASK = (1n << 128n) - 1n;
const MAX_CALL_GAS = 1_000_000n;
const MAX_VERIFICATION_GAS = 1_500_000n;
const MAX_PRE_VERIFICATION_GAS = 500_000n;
const MAX_SPONSORSHIP_TTL_MS = 10 * 60 * 1000;
const MIN_SPONSORSHIP_TTL_MS = 15 * 1000;

function sameAddress(left: string, right: string) {
  return getAddress(left) === getAddress(right);
}

function assertPositiveInteger(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error('A quantidade patrocinada deve ser um inteiro positivo.');
  }
}

function unpackAccountGasLimits(value: string) {
  if (!isHexString(value, 32)) {
    throw new Error('Limites de gás da UserOperation são inválidos.');
  }
  const packed = BigInt(value);
  return {
    verificationGasLimit: packed >> 128n,
    callGasLimit: packed & UINT128_MASK,
  };
}

function extractPaymasterAddress(paymasterAndData: string): Address {
  // v0.7: paymaster(20) + verificationGas(16) + postOpGas(16) + data.
  if (!isHexString(paymasterAndData) || (paymasterAndData.length - 2) / 2 < 52) {
    throw new Error('Patrocínio do Paymaster ausente ou incompleto.');
  }
  const address = getAddress(`0x${paymasterAndData.slice(2, 42)}`) as Address;
  if (address === ZeroAddress) throw new Error('Endereço do Paymaster inválido.');
  return address;
}

function assertTransferCall(
  operation: PackedUserOperationV07,
  intent: SponsoredTransferIntent,
) {
  let accountCall;
  try {
    accountCall = SIMPLE_ACCOUNT_INTERFACE.parseTransaction({
      data: operation.callData,
    });
  } catch {
    throw new Error('A Smart Account recebeu uma chamada não reconhecida.');
  }
  if (!accountCall || accountCall.name !== 'execute') {
    throw new Error('Somente uma execução simples pode ser patrocinada.');
  }

  const [target, nativeValue, tokenCallData] = accountCall.args;
  if (!sameAddress(String(target), intent.tokenAddress)) {
    throw new Error('A operação patrocinada aponta para outro contrato.');
  }
  if (BigInt(nativeValue) !== 0n) {
    throw new Error('O Paymaster não patrocina transferência de ativo nativo.');
  }

  let tokenCall;
  try {
    tokenCall = ERC20_INTERFACE.parseTransaction({ data: String(tokenCallData) });
  } catch {
    throw new Error('A chamada do Token Oficial não é reconhecida.');
  }
  if (!tokenCall || tokenCall.name !== 'transfer') {
    throw new Error('Somente transfer do Token Oficial pode ser patrocinado.');
  }
  if (!sameAddress(String(tokenCall.args[0]), intent.recipient)) {
    throw new Error('O destinatário preparado difere do destinatário revisado.');
  }
  if (BigInt(tokenCall.args[1]).toString() !== intent.amountInSmallestUnit) {
    throw new Error('O valor preparado difere do valor revisado.');
  }
}

function assertAccountDeployment(
  operation: PackedUserOperationV07,
  ownerAddress: Address,
  expectedFactory?: Address,
) {
  if (operation.initCode === '0x') return;
  if (!expectedFactory) {
    throw new Error('Factory da Smart Account não configurada.');
  }
  if (!isHexString(operation.initCode) || (operation.initCode.length - 2) / 2 <= 20) {
    throw new Error('initCode da Smart Account é inválido.');
  }

  const factory = getAddress(`0x${operation.initCode.slice(2, 42)}`);
  if (!sameAddress(factory, expectedFactory)) {
    throw new Error('A operação tenta usar outra factory de Smart Account.');
  }
  const factoryData = `0x${operation.initCode.slice(42)}`;
  let factoryCall;
  try {
    factoryCall = SIMPLE_ACCOUNT_FACTORY_INTERFACE.parseTransaction({
      data: factoryData,
    });
  } catch {
    throw new Error('A chamada de criação da Smart Account não é reconhecida.');
  }
  if (!factoryCall || factoryCall.name !== 'createAccount') {
    throw new Error('Factory recebeu uma função não permitida.');
  }
  if (!sameAddress(String(factoryCall.args[0]), ownerAddress)) {
    throw new Error('A Smart Account seria controlada por outro proprietário.');
  }
}

/**
 * Defesa local contra um gateway comprometido ou mal configurado.
 * A política definitiva também deve ser repetida no backend e no Paymaster.
 */
export function assertPreparedSponsoredTransfer(input: {
  intent: SponsoredTransferIntent;
  prepared: PreparedSponsoredTransfer;
  expectedEntryPoint: Address;
  expectedFactory?: Address;
  now?: Date;
}) {
  const { intent, prepared, expectedEntryPoint } = input;
  const now = input.now ?? new Date();
  assertPositiveInteger(intent.amountInSmallestUnit);

  if (prepared.chainId !== 137 || intent.chainId !== 137) {
    throw new Error('O patrocínio não pertence à Polygon.');
  }
  if (!sameAddress(prepared.entryPoint, expectedEntryPoint)) {
    throw new Error('EntryPoint diferente do configurado.');
  }
  if (
    !sameAddress(prepared.smartAccountAddress, intent.smartAccountAddress)
    || !sameAddress(prepared.userOperation.sender, intent.smartAccountAddress)
  ) {
    throw new Error('A UserOperation pertence a outra Smart Account.');
  }
  if (prepared.signatureScheme !== 'personal_sign') {
    throw new Error('Esquema de assinatura não suportado.');
  }
  if (!prepared.requestId || prepared.requestId.length > 128) {
    throw new Error('Identificador do patrocínio inválido.');
  }
  if (
    !prepared.sponsor
    || !prepared.sponsor.name.trim()
    || prepared.sponsor.gasChargedToUser !== '0'
    || prepared.sponsor.gasCurrency !== 'POL'
  ) {
    throw new Error('O Gateway não confirmou custo de gás zero para o usuário.');
  }
  if (prepared.userOperation.signature !== '0x') {
    throw new Error('A operação preparada já contém uma assinatura.');
  }
  if (!isHexString(prepared.userOperationHash, 32)) {
    throw new Error('Hash da UserOperation inválido.');
  }

  const validUntil = new Date(prepared.validUntil).getTime();
  const ttl = validUntil - now.getTime();
  if (!Number.isFinite(validUntil) || ttl < MIN_SPONSORSHIP_TTL_MS) {
    throw new Error('Autorização do Paymaster vencida ou curta demais.');
  }
  if (ttl > MAX_SPONSORSHIP_TTL_MS) {
    throw new Error('Autorização do Paymaster excede o prazo permitido.');
  }

  const { callGasLimit, verificationGasLimit } = unpackAccountGasLimits(
    prepared.userOperation.accountGasLimits,
  );
  if (callGasLimit <= 0n || callGasLimit > MAX_CALL_GAS) {
    throw new Error('Limite de gás de execução fora da política.');
  }
  if (verificationGasLimit <= 0n || verificationGasLimit > MAX_VERIFICATION_GAS) {
    throw new Error('Limite de gás de verificação fora da política.');
  }
  const preVerificationGas = BigInt(prepared.userOperation.preVerificationGas);
  if (preVerificationGas <= 0n || preVerificationGas > MAX_PRE_VERIFICATION_GAS) {
    throw new Error('Gás de pré-verificação fora da política.');
  }

  extractPaymasterAddress(prepared.userOperation.paymasterAndData);
  assertAccountDeployment(
    prepared.userOperation,
    intent.ownerAddress,
    input.expectedFactory,
  );
  assertTransferCall(prepared.userOperation, intent);
}
