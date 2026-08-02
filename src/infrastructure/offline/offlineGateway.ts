import { getAddress } from 'ethers';
import type {
  OfflineMintInfo,
  OfflinePaymentEnvelope,
} from '../../domain/offline/offlinePayment';
import type { Address } from '../../domain/wallet/types';
import { offlineVault } from './offlineVault';

const TIMEOUT_MS = 15_000;

function gatewayUrl() {
  const value = process.env.EXPO_PUBLIC_OFFLINE_GATEWAY_URL?.trim();
  if (!value) throw new Error('Gateway regional off-line não configurado.');
  return value.replace(/\/+$/, '');
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${gatewayUrl()}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof body?.message === 'string'
          ? body.message
          : `Serviço regional respondeu HTTP ${response.status}.`,
      );
    }
    return body as T;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('O serviço regional demorou demais para responder.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function validateMintInfo(value: OfflineMintInfo): OfflineMintInfo {
  if (
    value.version !== 1
    || value.scheme !== 'evm-personal-sign-commitment-v1'
    || value.chainId !== 137
    || value.risk !== 'offline-double-spend-until-sync'
    || value.maxPaymentBrlCents <= 0
  ) throw new Error('Configuração regional off-line inválida.');
  return {
    ...value,
    tokenAddress: getAddress(value.tokenAddress) as Address,
    diamondAddress: getAddress(value.diamondAddress) as Address,
    mintAddress: getAddress(value.mintAddress) as Address,
  };
}

export const offlineGateway = {
  async refreshMintInfo() {
    const info = validateMintInfo(
      await requestJson<OfflineMintInfo>('/v1/offline/mint-info'),
    );
    await offlineVault.cacheMintInfo(info);
    return info;
  },

  async issueNotes(input: {
    reserveId: string;
    ownerAddress: string;
    signerAddress: string;
    nonce: string;
    commitments: Array<{ commitment: string; amountSmallest: string }>;
    ownerSignature: string;
    geofenceDecisionId: string;
  }) {
    return requestJson<{ notes: Array<{
      reserveId: string;
      commitment: string;
      amountSmallest: string;
      expiresAt: string;
      mintSignature: string;
    }> }>('/v1/offline/notes/issue', {
      method: 'POST',
      headers: { 'X-Geofence-Decision-Id': input.geofenceDecisionId },
      body: JSON.stringify({
        reserveId: input.reserveId,
        ownerAddress: input.ownerAddress,
        signerAddress: input.signerAddress,
        nonce: input.nonce,
        commitments: input.commitments,
        ownerSignature: input.ownerSignature,
      }),
    });
  },

  async redeem(envelope: OfflinePaymentEnvelope) {
    return requestJson<{
      redemptionId: string;
      paymentId: string;
      amountSmallest: string;
      notesRoot: string;
      status: 'settlement_pending';
    }>('/v1/offline/payments/redeem', {
      method: 'POST',
      body: JSON.stringify(envelope),
    });
  },
};
