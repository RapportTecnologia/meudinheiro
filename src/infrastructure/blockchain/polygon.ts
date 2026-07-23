import { Contract, JsonRpcProvider, Wallet, type ContractRunner } from 'ethers';
import type { Address } from '../../domain/wallet/types';

export const CHAIN_ID = 137;
export const RPC_URL = process.env.EXPO_PUBLIC_POLYGON_RPC_URL ?? 'https://polygon-rpc.com';
export const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
  'function transfer(address,uint256) returns (bool)',
] as const;

export function erc20(address: Address, signerOrProvider: ContractRunner = provider) {
  return new Contract(address, ERC20_ABI, signerOrProvider);
}

export async function validateErc20(address: Address) {
  const token = erc20(address);
  const [name, symbol, decimals, code] = await Promise.all([
    token.getFunction('name')(), token.getFunction('symbol')(),
    token.getFunction('decimals')(), provider.getCode(address),
  ]);
  if (code === '0x') throw new Error('O endereço não contém um contrato.');
  return { name: String(name), symbol: String(symbol), decimals: Number(decimals) };
}

export function signer(privateKey: string) {
  return new Wallet(privateKey, provider);
}
