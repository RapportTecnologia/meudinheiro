export type Address = `0x${string}`;

export type WalletAccount = {
  id: string;
  name: string;
  address: Address;
  /** Somente o identificador do segredo; nunca a chave. */
  secretRef: string;
};

export type BaseToken = {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  chainId: 137;
  referenceCurrency?: 'BRL';
  configuredAt: string;
};

export type BalanceMap = Record<string, string>;
