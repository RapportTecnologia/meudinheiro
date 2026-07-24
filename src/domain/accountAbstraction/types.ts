import type { Address } from '../wallet/types';

export type Hex = `0x${string}`;

/**
 * Formato empacotado usado pelo EntryPoint v0.7.
 * Quantidades chegam como strings hexadecimais para não perder precisão no JSON.
 */
export type PackedUserOperationV07 = {
  sender: Address;
  nonce: Hex;
  initCode: Hex;
  callData: Hex;
  accountGasLimits: Hex;
  preVerificationGas: Hex;
  gasFees: Hex;
  paymasterAndData: Hex;
  signature: Hex;
};

export type SponsoredTransferIntent = {
  chainId: 137;
  ownerAddress: Address;
  smartAccountAddress: Address;
  tokenAddress: Address;
  recipient: Address;
  amountInSmallestUnit: string;
};

export type PreparedSponsoredTransfer = {
  requestId: string;
  chainId: 137;
  entryPoint: Address;
  smartAccountAddress: Address;
  userOperationHash: Hex;
  userOperation: PackedUserOperationV07;
  signatureScheme: 'personal_sign';
  validUntil: string;
  sponsor: {
    name: string;
    gasChargedToUser: '0';
    gasCurrency: 'POL';
  };
};

export type SponsoredOperationStatus =
  | { status: 'pending'; userOperationHash: Hex }
  | {
      status: 'included';
      userOperationHash: Hex;
      transactionHash: Hex;
      blockNumber: string;
    }
  | {
      status: 'reverted';
      userOperationHash: Hex;
      transactionHash?: Hex;
      reason: string;
    };

export type SmartAccountResolution = {
  chainId: 137;
  ownerAddress: Address;
  smartAccountAddress: Address;
  entryPoint: Address;
  entryPointVersion: '0.7';
  factoryAddress: Address;
};
