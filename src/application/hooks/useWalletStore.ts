import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from 'ethers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addContact,
  markContactAddressUsed,
  removeContact,
  toggleContactFavorite,
  updateContact,
  type Contact,
} from '../../domain/contacts/contact';
import { addAccountRule, normalizeAddress } from '../../domain/wallet/rules';
import type { Address, BalanceMap, BaseToken, WalletAccount } from '../../domain/wallet/types';
import type { PaymentRequest } from '../../domain/payment/paymentRequest';
import { erc4337Gateway } from '../../infrastructure/accountAbstraction/erc4337Gateway';
import { validateErc20 } from '../../infrastructure/blockchain/polygon';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';

type WalletState = {
  accounts: WalletAccount[];
  activeAccountId?: string;
  baseToken?: BaseToken;
  balances: BalanceMap;
  homeAmount: string;
  selectedAsset: 'BRL' | 'TOKEN';
  scannedAddress?: Address;
  pendingPayment?: PaymentRequest;
  contacts: Contact[];
  importAccount(name: string, privateKey: string): Promise<void>;
  activateGaslessAccount(id: string): Promise<void>;
  removeAccount(id: string): Promise<void>;
  configureBaseToken(address: string, useAsBrl: boolean): Promise<void>;
  removeBaseToken(): void;
  setHomeAmount(value: string): void;
  setSelectedAsset(value: 'BRL' | 'TOKEN'): void;
  setScannedAddress(value: string): void;
  setPendingPayment(value: PaymentRequest): void;
  clearPendingPayment(): void;
  addContact(name: string, address: string): void;
  updateContact(id: string, name: string, address: string): void;
  removeContact(id: string): void;
  toggleContactFavorite(id: string): void;
  recordContactUse(address: string): void;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      accounts: [],
      balances: {},
      homeAmount: '0',
      selectedAsset: 'BRL',
      contacts: [],
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
      async activateGaslessAccount(id) {
        const account = get().accounts.find((item) => item.id === id);
        if (!account) throw new Error('Conta não encontrada.');
        const smartAccountAddress = await erc4337Gateway.resolveSmartAccountAddress(
          account.address,
        );
        set({
          accounts: get().accounts.map((item) => item.id === id
            ? {
                ...item,
                smartAccountAddress,
                accountAbstractionActivatedAt: new Date().toISOString(),
              }
            : item),
        });
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
      addContact(name, address) {
        set({
          contacts: addContact(get().contacts, {
            id: globalThis.crypto.randomUUID(),
            name,
            address,
            now: new Date().toISOString(),
          }),
        });
      },
      updateContact(id, name, address) {
        set({ contacts: updateContact(get().contacts, { id, name, address }) });
      },
      removeContact(id) { set({ contacts: removeContact(get().contacts, id) }); },
      toggleContactFavorite(id) {
        set({ contacts: toggleContactFavorite(get().contacts, id) });
      },
      recordContactUse(address) {
        set({
          contacts: markContactAddressUsed(
            get().contacts,
            address,
            new Date().toISOString(),
          ),
        });
      },
    }),
    {
      name: 'meu-dinheiro.public-state.v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<WalletState> & {
          selectedAsset?: 'BRL' | 'POL' | 'TOKEN';
        };
        return {
          ...state,
          selectedAsset: state.selectedAsset === 'BRL' ? 'BRL' : 'TOKEN',
        } as WalletState;
      },
      partialize: ({
        accounts, activeAccountId, baseToken, homeAmount, selectedAsset, contacts,
      }) => ({
        accounts, activeAccountId, baseToken, homeAmount, selectedAsset, contacts,
      }),
    },
  ),
);
