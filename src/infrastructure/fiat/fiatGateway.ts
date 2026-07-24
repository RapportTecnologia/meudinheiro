import { getAddress } from 'ethers';
import type { Address } from '../../domain/wallet/types';

export type PixDeposit = {
  operationId: string;
  pixCopyAndPaste: string;
  grossBrlCents: string;
  tokenAmountSmallest: string;
  status: 'awaiting_pix' | 'settled' | 'minted' | 'expired';
  expiresAt: string;
};

export type RedemptionPreparation = {
  operationId: string;
  grossBrlCents: string;
  feeBps: number;
  feeBrlCents: string;
  netPixBrlCents: string;
  status: 'awaiting_onchain_lock';
};

const REQUEST_TIMEOUT_MS = 15_000;

function gatewayUrl() {
  const value = process.env.EXPO_PUBLIC_FIAT_GATEWAY_URL?.trim();
  if (!value) throw new Error('Gateway Pix não configurado.');
  return value.replace(/\/+$/, '');
}

async function requestJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${gatewayUrl()}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof result?.message === 'string'
          ? result.message
          : `Gateway Pix respondeu HTTP ${response.status}.`,
      );
    }
    return result as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const fiatGateway = {
  createDeposit(input: {
    walletAddress: Address;
    grossBrlCents: string;
  }) {
    return requestJson<PixDeposit>('/v1/fiat/deposits', {
      chainId: 137,
      walletAddress: getAddress(input.walletAddress),
      grossBrlCents: input.grossBrlCents,
    });
  },

  prepareRedemption(input: {
    smartAccountAddress: Address;
    grossBrlCents: string;
  }) {
    return requestJson<RedemptionPreparation>('/v1/fiat/redemptions/prepare', {
      chainId: 137,
      smartAccountAddress: getAddress(input.smartAccountAddress),
      grossBrlCents: input.grossBrlCents,
    });
  },
};
