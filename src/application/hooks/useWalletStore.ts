import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from 'ethers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addAccountRule, normalizeAddress } from '../../domain/wallet/rules';
import type { Address, BalanceMap, BaseToken, WalletAccount } from '../../domain/wallet/types';
import { validateErc20 } from '../../infrastructure/blockchain/polygon';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';

type WalletState = {
  accounts: WalletAccount[];
  activeAccountId?: string;
  baseToken?: BaseToken;
  balances: BalanceMap;
  homeAmount: string;
  scannedAddress?: Address;
  importAccount(name: string, privateKey: string): Promise<void>;
  removeAccount(id: string): Promise<void>;
  configureBaseToken(address: string): Promise<void>;
  removeBaseToken(): void;
  setHomeAmount(value: string): void;
  setScannedAddress(value: string): void;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      accounts: [],
      balances: {},
      homeAmount: '0',
      async importAccount(name, privateKey) {
        const wallet = new Wallet(privateKey);
        const id = globalThis.crypto.randomUUID();
        const secretRef = `wallet.privateKey.${id}`;
        const account: WalletAccount = {
          id, name: name.trim() || `Conta ${get().accounts.length + 1}`,
          address: normalizeAddress(wallet.address), secretRef,
        };
        const next = addAccountRule(get().accounts, account);
        await secureSecrets.save(secretRef, privateKey);
        set({ accounts: next, activeAccountId: get().activeAccountId ?? id });
      },
      async removeAccount(id) {
        const found = get().accounts.find((account) => account.id === id);
        if (found) await secureSecrets.remove(found.secretRef);
        const accounts = get().accounts.filter((account) => account.id !== id);
        set({ accounts, activeAccountId: accounts[0]?.id });
      },
      async configureBaseToken(rawAddress) {
        if (get().baseToken) throw new Error('Remova a Moeda Base antes de cadastrar outra.');
        const address = normalizeAddress(rawAddress);
        const metadata = await validateErc20(address);
        set({ baseToken: { address, ...metadata, chainId: 137, configuredAt: new Date().toISOString() } });
      },
      removeBaseToken() { set({ baseToken: undefined }); },
      setHomeAmount(homeAmount) { set({ homeAmount }); },
      setScannedAddress(value) { set({ scannedAddress: normalizeAddress(value) }); },
    }),
    {
      name: 'meu-dinheiro.public-state.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ accounts, activeAccountId, baseToken, homeAmount }) =>
        ({ accounts, activeAccountId, baseToken, homeAmount }),
    },
  ),
);
