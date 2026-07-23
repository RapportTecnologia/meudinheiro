import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from 'ethers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addAccountRule, normalizeAddress } from '../../domain/wallet/rules';
import type { Address, BalanceMap, BaseToken, WalletAccount } from '../../domain/wallet/types';
import type { PaymentRequest } from '../../domain/payment/paymentRequest';
import { validateErc20 } from '../../infrastructure/blockchain/polygon';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';

type WalletState = {
  accounts: WalletAccount[];
  activeAccountId?: string;
  baseToken?: BaseToken;
  balances: BalanceMap;
  homeAmount: string;
  selectedAsset: 'BRL' | 'POL';
  scannedAddress?: Address;
  pendingPayment?: PaymentRequest;
  importAccount(name: string, privateKey: string): Promise<void>;
  removeAccount(id: string): Promise<void>;
  configureBaseToken(address: string, useAsBrl: boolean): Promise<void>;
  removeBaseToken(): void;
  setHomeAmount(value: string): void;
  setSelectedAsset(value: 'BRL' | 'POL'): void;
  setScannedAddress(value: string): void;
  setPendingPayment(value: PaymentRequest): void;
  clearPendingPayment(): void;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      accounts: [],
      balances: {},
      homeAmount: '0',
      selectedAsset: 'BRL',
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
      async configureBaseToken(rawAddress, useAsBrl) {
        if (get().baseToken) throw new Error('Remova a Moeda Base antes de cadastrar outra.');
        const address = normalizeAddress(rawAddress);
        const metadata = await validateErc20(address);
        set({
          baseToken: {
            address,
            ...metadata,
            chainId: 137,
            referenceCurrency: useAsBrl ? 'BRL' : undefined,
            configuredAt: new Date().toISOString(),
          },
        });
      },
      removeBaseToken() { set({ baseToken: undefined }); },
      setHomeAmount(homeAmount) { set({ homeAmount }); },
      setSelectedAsset(selectedAsset) { set({ selectedAsset }); },
      setScannedAddress(value) { set({ scannedAddress: normalizeAddress(value) }); },
      setPendingPayment(pendingPayment) { set({ pendingPayment }); },
      clearPendingPayment() { set({ pendingPayment: undefined }); },
    }),
    {
      name: 'meu-dinheiro.public-state.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ accounts, activeAccountId, baseToken, homeAmount, selectedAsset }) =>
        ({ accounts, activeAccountId, baseToken, homeAmount, selectedAsset }),
    },
  ),
);
