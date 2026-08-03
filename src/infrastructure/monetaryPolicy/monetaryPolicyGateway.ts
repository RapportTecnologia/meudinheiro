import { getAddress } from 'ethers';
import type { RegionalMonetaryPolicy } from '../../domain/monetaryPolicy/types';
import type { Address } from '../../domain/wallet/types';

const REQUEST_TIMEOUT_MS = 15_000;

function gatewayUrl() {
  const value = process.env.EXPO_PUBLIC_FIAT_GATEWAY_URL?.trim();
  if (!value) throw new Error('Gateway regional não configurado.');
  return value.replace(/\/+$/, '');
}

export const monetaryPolicyGateway = {
  async getPolicy(): Promise<RegionalMonetaryPolicy> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${gatewayUrl()}/v1/region`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('Não foi possível validar a região.');
      const policy = body?.monetaryPolicy;
      if (
        typeof body?.tokenAddress !== 'string'
        || typeof policy?.referenceCurrency !== 'string'
        || !['fiat_pegged', 'independent'].includes(policy?.mode)
        || typeof policy?.manager !== 'string'
        || typeof policy?.changedAt !== 'string'
        || !Number.isInteger(policy?.fiatDecimals)
      ) throw new Error('Resposta monetária regional inválida.');
      return {
        tokenAddress: getAddress(body.tokenAddress) as Address,
        referenceCurrency: policy.referenceCurrency,
        fiatDecimals: policy.fiatDecimals,
        mode: policy.mode,
        manager: getAddress(policy.manager) as Address,
        ...(typeof policy.activeAssessmentId === 'string'
          ? { activeAssessmentId: policy.activeAssessmentId }
          : {}),
        ...(typeof policy.pricingSigner === 'string'
          ? { pricingSigner: getAddress(policy.pricingSigner) as Address }
          : {}),
        changedAt: policy.changedAt,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
