import { Wallet, hexlify, randomBytes } from 'ethers';
import {
  createOfflinePaymentUri,
  noteCommitment,
  offlineNoteMessage,
  offlinePaymentMessage,
  parseOfflinePaymentUri,
  verifyOfflinePayment,
  type OfflineMintInfo,
  type OfflinePaymentEnvelope,
} from '../src/domain/offline/offlinePayment';

const now = new Date('2026-07-25T12:00:00.000Z');

async function fixture() {
  const mint = Wallet.createRandom();
  const sender = Wallet.createRandom();
  const recipient = Wallet.createRandom();
  const secret = hexlify(randomBytes(32));
  const reserveId = hexlify(randomBytes(32));
  const expiresAt = new Date(now.getTime() + 3_600_000).toISOString();
  const note = {
    reserveId,
    secret,
    amountSmallest: '10000000000000000000',
    expiresAt,
    mintSignature: await mint.signMessage(offlineNoteMessage({
      regionId: 'fortaleza-centro',
      reserveId,
      commitment: noteCommitment(secret),
      amountSmallest: '10000000000000000000',
      expiresAt,
    })),
  };
  const unsigned: Omit<OfflinePaymentEnvelope, 'senderSignature'> = {
    version: 2,
    paymentId: 'pagamento-offline-app-0001',
    regionId: 'fortaleza-centro',
    reserveId,
    senderAddress: sender.address as `0x${string}`,
    recipientAddress: recipient.address as `0x${string}`,
    createdAt: now.toISOString(),
    expiresAt,
    geofenceDecisionId: '00000000-0000-4000-8000-000000000001',
    notes: [note],
  };
  const envelope: OfflinePaymentEnvelope = {
    ...unsigned,
    senderSignature: await sender.signMessage(offlinePaymentMessage(unsigned)),
  };
  const mintInfo: OfflineMintInfo = {
    version: 1,
    scheme: 'evm-personal-sign-commitment-v1',
    regionId: 'fortaleza-centro',
    chainId: 137,
    tokenAddress: Wallet.createRandom().address as `0x${string}`,
    diamondAddress: Wallet.createRandom().address as `0x${string}`,
    mintAddress: mint.address as `0x${string}`,
    maxPaymentBrlCents: 20_000,
    noteTtlSeconds: 3_600,
    risk: 'offline-double-spend-until-sync',
  };
  return { envelope, mintInfo, recipient, mint };
}

describe('pagamento Layer 3 off-line', () => {
  it('valida assinaturas, destinatário, região, prazo e limite', async () => {
    const { envelope, mintInfo, recipient } = await fixture();
    expect(verifyOfflinePayment({
      envelope,
      mintInfo,
      expectedRecipient: recipient.address,
      tokenDecimals: 18,
      now,
    })).toBe(10n * 10n ** 18n);
  });

  it('transporta o pacote por URI sem perder a assinatura', async () => {
    const { envelope } = await fixture();
    expect(parseOfflinePaymentUri(createOfflinePaymentUri(envelope))).toEqual(envelope);
  });

  it('rejeita destinatário diferente e assinatura regional falsa', async () => {
    const { envelope, mintInfo, mint } = await fixture();
    expect(() => verifyOfflinePayment({
      envelope,
      mintInfo,
      expectedRecipient: Wallet.createRandom().address,
      tokenDecimals: 18,
      now,
    })).toThrow('outra conta');

    const forged = {
      ...envelope,
      notes: [{ ...envelope.notes[0]!, mintSignature: await mint.signMessage('outro') }],
    };
    expect(() => verifyOfflinePayment({
      envelope: forged,
      mintInfo,
      expectedRecipient: envelope.recipientAddress,
      tokenDecimals: 18,
      now,
    })).toThrow('emissor regional');
  });

  it('rejeita pacote expirado', async () => {
    const { envelope, mintInfo } = await fixture();
    expect(() => verifyOfflinePayment({
      envelope,
      mintInfo,
      expectedRecipient: envelope.recipientAddress,
      tokenDecimals: 18,
      now: new Date(now.getTime() + 7_200_000),
    })).toThrow('expirado');
  });

  it('rejeita token sem precisão de centavos', async () => {
    const { envelope, mintInfo } = await fixture();
    expect(() => verifyOfflinePayment({
      envelope,
      mintInfo,
      expectedRecipient: envelope.recipientAddress,
      tokenDecimals: 1,
      now,
    })).toThrow('centavos');
  });
});
