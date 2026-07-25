import {
  Contract,
  getAddress,
  isAddress,
  isHexString,
} from 'ethers';
import type {
  PreparedSponsoredTransfer,
  SponsoredTransferIntent,
} from '../../domain/accountAbstraction/types';
import {
  validateCampaign,
  type LocalIncentiveCampaign,
} from '../../domain/incentives/localIncentive';
import type { Address } from '../../domain/wallet/types';
import { ENTRY_POINT_V07 } from '../accountAbstraction/erc4337Gateway';
import { provider } from '../blockchain/polygon';

const REQUEST_TIMEOUT_MS = 15_000;
const ENTRY_POINT_ABI = [
  'function getUserOpHash((address sender,uint256 nonce,bytes initCode,bytes callData,bytes32 accountGasLimits,uint256 preVerificationGas,bytes32 gasFees,bytes paymasterAndData,bytes signature) userOp) view returns (bytes32)',
] as const;

export type IncentivePaymentIntent = SponsoredTransferIntent & {
  campaignId: `0x${string}`;
  operationId: `0x${string}`;
  grossAmountInSmallestUnit: string;
  payableAmountInSmallestUnit: string;
  cashbackAmountInSmallestUnit: string;
};

export type PreparedIncentivePayment = PreparedSponsoredTransfer & {
  operation: {
    kind: 'local_incentive_payment';
    campaignId: `0x${string}`;
    operationId: `0x${string}`;
    merchant: Address;
    grossAmountInSmallestUnit: string;
    payableAmountInSmallestUnit: string;
    cashbackAmountInSmallestUnit: string;
  };
};

function gatewayUrl() {
  const value = process.env.EXPO_PUBLIC_INCENTIVE_GATEWAY_URL?.trim()
    ?? process.env.EXPO_PUBLIC_ERC4337_GATEWAY_URL?.trim();
  if (!value) throw new Error('Gateway de incentivos não configurado.');
  return value.replace(/\/+$/, '');
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${gatewayUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof body?.message === 'string'
          ? body.message
          : `Gateway respondeu HTTP ${response.status}.`,
      );
    }
    return body as T;
  } finally {
    clearTimeout(timeout);
  }
}

function validateCampaignResponse(campaign: LocalIncentiveCampaign) {
  if (!isHexString(campaign.id, 32)) {
    throw new Error('Identificador de campanha inválido.');
  }
  if (!isAddress(campaign.merchant) || !isAddress(campaign.sponsor)) {
    throw new Error('Campanha contém endereço inválido.');
  }
  validateCampaign(campaign);
}

function assertPreparedPayment(
  prepared: PreparedIncentivePayment,
  intent: IncentivePaymentIntent,
) {
  const operation = prepared.operation;
  if (
    prepared.chainId !== 137
    || prepared.smartAccountAddress.toLowerCase()
      !== intent.smartAccountAddress.toLowerCase()
    || prepared.entryPoint.toLowerCase() !== ENTRY_POINT_V07.toLowerCase()
    || prepared.sponsor.gasChargedToUser !== '0'
    || prepared.sponsor.gasCurrency !== 'POL'
    || operation.kind !== 'local_incentive_payment'
    || operation.campaignId.toLowerCase() !== intent.campaignId.toLowerCase()
    || operation.operationId.toLowerCase() !== intent.operationId.toLowerCase()
    || operation.grossAmountInSmallestUnit !== intent.grossAmountInSmallestUnit
    || operation.payableAmountInSmallestUnit !== intent.payableAmountInSmallestUnit
    || operation.cashbackAmountInSmallestUnit !== intent.cashbackAmountInSmallestUnit
    || !isAddress(operation.merchant)
    || !isHexString(prepared.userOperationHash, 32)
  ) {
    throw new Error('Pagamento patrocinado divergente da oferta revisada.');
  }
}

export const incentiveGateway = {
  async listCampaigns(input: {
    tokenAddress: Address;
    customerAddress?: Address;
  }): Promise<LocalIncentiveCampaign[]> {
    const query = new URLSearchParams({
      chainId: '137',
      tokenAddress: getAddress(input.tokenAddress),
    });
    if (input.customerAddress) {
      query.set('customerAddress', getAddress(input.customerAddress));
    }
    const response = await requestJson<{ campaigns: LocalIncentiveCampaign[] }>(
      `/v1/incentives/campaigns?${query.toString()}`,
    );
    if (!Array.isArray(response.campaigns)) {
      throw new Error('Lista de campanhas inválida.');
    }
    response.campaigns.forEach(validateCampaignResponse);
    return response.campaigns;
  },

  async prepareSponsoredPayment(
    intent: IncentivePaymentIntent,
  ): Promise<PreparedIncentivePayment> {
    if (
      !isHexString(intent.campaignId, 32)
      || !isHexString(intent.operationId, 32)
    ) {
      throw new Error('Campanha ou operação inválida.');
    }
    const prepared = await requestJson<PreparedIncentivePayment>(
      '/v1/incentives/payments/prepare',
      { method: 'POST', body: JSON.stringify(intent) },
    );
    assertPreparedPayment(prepared, intent);

    const entryPoint = new Contract(ENTRY_POINT_V07, ENTRY_POINT_ABI, provider);
    const onChainHash = String(
      await entryPoint.getFunction('getUserOpHash')(prepared.userOperation),
    );
    if (onChainHash.toLowerCase() !== prepared.userOperationHash.toLowerCase()) {
      throw new Error('O hash preparado não corresponde à operação revisada.');
    }
    return prepared;
  },
};
