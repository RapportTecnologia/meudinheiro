import { getAddress } from 'ethers';
import type { Address, WalletAccount } from './types';

export const MAX_ACCOUNTS = 2;

export function normalizeAddress(value: string): Address {
  return getAddress(value) as Address;
}

export function addAccountRule(accounts: WalletAccount[], account: WalletAccount) {
  if (accounts.length >= MAX_ACCOUNTS) throw new Error('Limite de duas contas atingido.');
  if (accounts.some((item) => item.address === account.address)) throw new Error('Conta já cadastrada.');
  return [...accounts, account];
}
