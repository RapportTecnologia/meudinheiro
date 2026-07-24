export type Address = `0x${string}`;

export type WalletAccount = {
  id: string;
  name: string;
  /** EOA proprietária: apenas assina UserOperations e não precisa manter POL. */
  address: Address;
  /** Endereço operacional ERC-4337 que recebe e movimenta o Token Oficial. */
  smartAccountAddress?: Address;
  accountAbstractionActivatedAt?: string;
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
