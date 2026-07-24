import { Interface, toBeHex, zeroPadValue } from 'ethers';
import {
  assertPreparedSponsoredTransfer,
} from '../src/domain/accountAbstraction/sponsorshipPolicy';
import type {
  PackedUserOperationV07,
  PreparedSponsoredTransfer,
  SponsoredTransferIntent,
} from '../src/domain/accountAbstraction/types';

const owner = '0x0000000000000000000000000000000000000001';
const smartAccount = '0x0000000000000000000000000000000000000002';
const token = '0x0000000000000000000000000000000000000003';
const recipient = '0x0000000000000000000000000000000000000004';
const entryPoint = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
const paymaster = '0x0000000000000000000000000000000000000005';
const factory = '0x0000000000000000000000000000000000000006';
const accountInterface = new Interface([
  'function execute(address dest,uint256 value,bytes func)',
]);
const tokenInterface = new Interface([
  'function transfer(address recipient,uint256 amount)',
]);
const factoryInterface = new Interface([
  'function createAccount(address owner,uint256 salt) returns (address)',
]);

const packUint128Pair = (high: bigint, low: bigint) =>
  zeroPadValue(toBeHex((high << 128n) | low), 32) as `0x${string}`;

const intent: SponsoredTransferIntent = {
  chainId: 137,
  ownerAddress: owner,
  smartAccountAddress: smartAccount,
  tokenAddress: token,
  recipient,
  amountInSmallestUnit: '1000000',
};

const userOperation = (): PackedUserOperationV07 => ({
  sender: smartAccount,
  nonce: '0x0',
  initCode: '0x',
  callData: accountInterface.encodeFunctionData('execute', [
    token,
    0,
    tokenInterface.encodeFunctionData('transfer', [recipient, 1_000_000n]),
  ]) as `0x${string}`,
  accountGasLimits: packUint128Pair(300_000n, 100_000n),
  preVerificationGas: '0xc350',
  gasFees: packUint128Pair(30_000_000_000n, 50_000_000_000n),
  paymasterAndData: (
    `${paymaster}${'0'.repeat(64)}${'ab'.repeat(32)}`
  ) as `0x${string}`,
  signature: '0x',
});

const prepared = (): PreparedSponsoredTransfer => ({
  requestId: 'req-1',
  chainId: 137,
  entryPoint,
  smartAccountAddress: smartAccount,
  userOperationHash: `0x${'12'.repeat(32)}`,
  userOperation: userOperation(),
  signatureScheme: 'personal_sign',
  validUntil: '2026-07-23T12:05:00.000Z',
  sponsor: {
    name: 'Meu Dinheiro',
    gasChargedToUser: '0',
    gasCurrency: 'POL',
  },
});

describe('política local de patrocínio ERC-4337', () => {
  it('aceita apenas a transferência revisada do Token Oficial', () => {
    expect(() => assertPreparedSponsoredTransfer({
      intent,
      prepared: prepared(),
      expectedEntryPoint: entryPoint,
      now: new Date('2026-07-23T12:00:00.000Z'),
    })).not.toThrow();
  });

  it('rejeita troca de destinatário feita pelo gateway', () => {
    const changed = prepared();
    changed.userOperation.callData = accountInterface.encodeFunctionData('execute', [
      token,
      0,
      tokenInterface.encodeFunctionData('transfer', [owner, 1_000_000n]),
    ]) as `0x${string}`;

    expect(() => assertPreparedSponsoredTransfer({
      intent,
      prepared: changed,
      expectedEntryPoint: entryPoint,
      now: new Date('2026-07-23T12:00:00.000Z'),
    })).toThrow('destinatário preparado');
  });

  it('rejeita chamada com valor nativo', () => {
    const changed = prepared();
    changed.userOperation.callData = accountInterface.encodeFunctionData('execute', [
      token,
      1,
      tokenInterface.encodeFunctionData('transfer', [recipient, 1_000_000n]),
    ]) as `0x${string}`;

    expect(() => assertPreparedSponsoredTransfer({
      intent,
      prepared: changed,
      expectedEntryPoint: entryPoint,
      now: new Date('2026-07-23T12:00:00.000Z'),
    })).toThrow('ativo nativo');
  });

  it('rejeita patrocínio vencido', () => {
    const expired = prepared();
    expired.validUntil = '2026-07-23T11:59:59.000Z';
    expect(() => assertPreparedSponsoredTransfer({
      intent,
      prepared: expired,
      expectedEntryPoint: entryPoint,
      now: new Date('2026-07-23T12:00:00.000Z'),
    })).toThrow('vencida');
  });

  it('rejeita factory diferente ao implantar a conta', () => {
    const changed = prepared();
    changed.userOperation.initCode = (
      `${factory}${factoryInterface.encodeFunctionData('createAccount', [owner, 0]).slice(2)}`
    ) as `0x${string}`;
    expect(() => assertPreparedSponsoredTransfer({
      intent,
      prepared: changed,
      expectedEntryPoint: entryPoint,
      expectedFactory: paymaster,
      now: new Date('2026-07-23T12:00:00.000Z'),
    })).toThrow('outra factory');
  });
});
