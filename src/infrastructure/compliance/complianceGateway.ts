import type { Address } from '../../domain/wallet/types';
import {
  validateRegulatoryDisclosure,
  type RegulatoryDisclosure,
} from '../../domain/compliance/regulatedPartner';

const REQUEST_TIMEOUT_MS = 15_000;

function gatewayUrl() {
  const value = process.env.EXPO_PUBLIC_COMPLIANCE_GATEWAY_URL?.trim()
    ?? process.env.EXPO_PUBLIC_FIAT_GATEWAY_URL?.trim();
  if (!value) throw new Error('Gateway de conformidade não configurado.');
  return value.replace(/\/+$/, '');
}

export const complianceGateway = {
  async getDisclosure(tokenAddress?: Address): Promise<RegulatoryDisclosure> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const query = new URLSearchParams({ chainId: '137' });
      if (tokenAddress) query.set('tokenAddress', tokenAddress);
      const response = await fetch(
        `${gatewayUrl()}/v1/compliance/partner-disclosure?${query.toString()}`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof body?.message === 'string'
            ? body.message
            : `Gateway de conformidade respondeu HTTP ${response.status}.`,
        );
      }
      validateRegulatoryDisclosure(body as RegulatoryDisclosure);
      return body as RegulatoryDisclosure;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('A consulta de parceiros regulados expirou.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },
};

