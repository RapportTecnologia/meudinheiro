import {
  concat,
  getAddress,
  hexlify,
  keccak256,
  randomBytes,
  sha256,
  verifyMessage,
} from 'ethers';
import type { Address } from '../wallet/types';

export const OFFLINE_URI_PREFIX = 'meudinheiro-offline:v1?payload=';

export type OfflineMintInfo = {
  version: 1;
  scheme: 'evm-personal-sign-commitment-v1';
  regionId: string;
  chainId: 137;
  tokenAddress: Address;
  diamondAddress: Address;
  mintAddress: Address;
  maxPaymentBrlCents: number;
  noteTtlSeconds: number;
  risk: 'offline-double-spend-until-sync';
};

export type OfflineNote = {
  reserveId: string;
  secret: string;
  amountSmallest: string;
  expiresAt: string;
  mintSignature: string;
};

export type OfflinePaymentEnvelope = {
  version: 1;
  paymentId: string;
  regionId: string;
  reserveId: string;
  senderAddress: Address;
  recipientAddress: Address;
  createdAt: string;
  expiresAt: string;
  notes: OfflineNote[];
  senderSignature: string;
};

export function assertBytes32(value: string, field: string): string {
  if (!/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error(`${field} deve ser bytes32 hexadecimal.`);
  }
  return value.toLowerCase();
}

export function createNoteDraft(amountSmallest: string) {
  if (!/^[1-9]\d*$/.test(amountSmallest)) {
    throw new Error('Valor da nota inválido.');
  }
  const secret = hexlify(randomBytes(32));
  return {
    secret,
    commitment: noteCommitment(secret),
    amountSmallest,
  };
}

export function noteCommitment(secret: string): string {
  return sha256(assertBytes32(secret, 'Segredo da nota'));
}

export function offlineNoteMessage(note: {
  regionId: string;
  reserveId: string;
  commitment: string;
  amountSmallest: string;
  expiresAt: string;
}): string {
  return [
    'MEU_DINHEIRO_OFFLINE_NOTE_V1',
    note.regionId,
    assertBytes32(note.reserveId, 'Reserve ID'),
    assertBytes32(note.commitment, 'Commitment'),
    note.amountSmallest,
    new Date(note.expiresAt).toISOString(),
  ].join('|');
}

export function issuanceAuthorizationMessage(input: {
  regionId: string;
  reserveId: string;
  ownerAddress: string;
  signerAddress: string;
  nonce: string;
  commitments: Array<{ commitment: string; amountSmallest: string }>;
}): string {
  const commitments = [...input.commitments]
    .map((note) => (
      `${assertBytes32(note.commitment, 'Commitment')}:${note.amountSmallest}`
    ))
    .sort()
    .join(',');
  return [
    'MEU_DINHEIRO_OFFLINE_ISSUANCE_V1',
    input.regionId,
    assertBytes32(input.reserveId, 'Reserve ID'),
    getAddress(input.ownerAddress),
    getAddress(input.signerAddress),
    input.nonce,
    commitments,
  ].join('|');
}

export function offlinePaymentMessage(
  envelope: Omit<OfflinePaymentEnvelope, 'senderSignature'>,
): string {
  const notes = [...envelope.notes]
    .map((note) => (
      `${noteCommitment(note.secret)}:${note.amountSmallest}:${new Date(note.expiresAt).toISOString()}`
    ))
    .sort()
    .join(',');
  return [
    'MEU_DINHEIRO_OFFLINE_PAYMENT_V1',
    envelope.paymentId,
    envelope.regionId,
    assertBytes32(envelope.reserveId, 'Reserve ID'),
    getAddress(envelope.senderAddress),
    getAddress(envelope.recipientAddress),
    new Date(envelope.createdAt).toISOString(),
    new Date(envelope.expiresAt).toISOString(),
    notes,
  ].join('|');
}

export function notesRoot(notes: OfflineNote[]): string {
  if (notes.length === 0) throw new Error('Pagamento sem notas.');
  return keccak256(concat(
    notes.map((note) => noteCommitment(note.secret)).sort(),
  ));
}

export function createOfflinePaymentUri(envelope: OfflinePaymentEnvelope): string {
  return `${OFFLINE_URI_PREFIX}${encodeURIComponent(JSON.stringify(envelope))}`;
}

export function parseOfflinePaymentUri(raw: string): OfflinePaymentEnvelope | undefined {
  if (!raw.startsWith(OFFLINE_URI_PREFIX)) return undefined;
  try {
    return JSON.parse(
      decodeURIComponent(raw.slice(OFFLINE_URI_PREFIX.length)),
    ) as OfflinePaymentEnvelope;
  } catch {
    throw new Error('Pacote off-line corrompido.');
  }
}

function signedBy(message: string, signature: string, expected: string): boolean {
  try {
    return getAddress(verifyMessage(message, signature)) === getAddress(expected);
  } catch {
    return false;
  }
}

export function verifyOfflinePayment(input: {
  envelope: OfflinePaymentEnvelope;
  mintInfo: OfflineMintInfo;
  expectedRecipient: string;
  tokenDecimals: number;
  now?: Date;
}): bigint {
  const { envelope, mintInfo } = input;
  const now = input.now ?? new Date();
  if (input.tokenDecimals < 2 || input.tokenDecimals > 18) {
    throw new Error('Token regional incompatível com valores em centavos.');
  }
  if (
    envelope.version !== 1
    || envelope.regionId !== mintInfo.regionId
    || envelope.notes.length === 0
    || envelope.notes.length > 64
    || getAddress(envelope.recipientAddress) !== getAddress(input.expectedRecipient)
    || new Date(envelope.expiresAt) <= now
    || new Date(envelope.createdAt).getTime() > now.getTime() + 300_000
  ) {
    throw new Error('Pacote off-line inválido, expirado ou destinado a outra conta.');
  }
  const unsigned: Omit<OfflinePaymentEnvelope, 'senderSignature'> = {
    ...envelope,
  };
  delete (unsigned as Partial<OfflinePaymentEnvelope>).senderSignature;
  if (!signedBy(
    offlinePaymentMessage(unsigned),
    envelope.senderSignature,
    envelope.senderAddress,
  )) {
    throw new Error('Assinatura do pagador inválida.');
  }

  let total = 0n;
  const commitments = new Set<string>();
  for (const note of envelope.notes) {
    if (assertBytes32(note.reserveId, 'Reserve ID') !==
      assertBytes32(envelope.reserveId, 'Reserve ID')) {
      throw new Error('O pacote mistura reservas.');
    }
    const amount = BigInt(note.amountSmallest);
    if (amount <= 0n || new Date(note.expiresAt) <= now) {
      throw new Error('Nota off-line inválida ou expirada.');
    }
    const commitment = noteCommitment(note.secret);
    if (commitments.has(commitment)) throw new Error('O pacote repete uma nota.');
    commitments.add(commitment);
    if (!signedBy(offlineNoteMessage({
      regionId: envelope.regionId,
      reserveId: envelope.reserveId,
      commitment,
      amountSmallest: note.amountSmallest,
      expiresAt: note.expiresAt,
    }), note.mintSignature, mintInfo.mintAddress)) {
      throw new Error('Assinatura do emissor regional inválida.');
    }
    total += amount;
  }
  const max = BigInt(mintInfo.maxPaymentBrlCents)
    * 10n ** BigInt(input.tokenDecimals - 2);
  if (total > max) throw new Error('Pagamento excede o limite off-line regional.');
  return total;
}
