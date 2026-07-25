import { getAddress } from 'ethers';
import type { Address } from '../wallet/types';

export const MAX_DISCOUNT_BPS = 3_000;
export const MAX_CASHBACK_BPS = 1_000;
export const MAX_TOTAL_BENEFIT_BPS = 4_000;
const BPS_DENOMINATOR = 10_000n;

export type LocalIncentiveCampaign = {
  id: `0x${string}`;
  name: string;
  description: string;
  merchant: Address;
  sponsor: Address;
  discountBps: number;
  cashbackBps: number;
  minPurchaseCents: string;
  maxCashbackPerPurchaseCents: string;
  maxCashbackPerCustomerCents: string;
  remainingBudgetCents: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

export type LocalIncentiveQuote = {
  grossCents: bigint;
  discountCents: bigint;
  payableCents: bigint;
  cashbackCents: bigint;
  eligible: boolean;
  reason?: string;
};

function calculateBps(value: bigint, bps: number): bigint {
  return value * BigInt(bps) / BPS_DENOMINATOR;
}

function asNonNegativeInteger(value: string, field: string): bigint {
  if (!/^\d+$/.test(value)) throw new Error(`${field} inválido.`);
  return BigInt(value);
}

export function parseBrlCents(value: string): bigint {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Informe um valor em reais com até duas casas decimais.');
  }
  const [whole = '0', fraction = ''] = normalized.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0') || '0');
  if (cents <= 0n) throw new Error('O valor deve ser maior que zero.');
  return cents;
}

export function formatBrlCents(cents: bigint): string {
  if (cents < 0n) throw new Error('Valor negativo não permitido.');
  return `R$ ${cents / 100n},${(cents % 100n).toString().padStart(2, '0')}`;
}

export function brlCentsToTokenUnits(cents: bigint, tokenDecimals: number): bigint {
  if (cents < 0n) throw new Error('Valor negativo não permitido.');
  if (!Number.isInteger(tokenDecimals) || tokenDecimals < 2 || tokenDecimals > 36) {
    throw new Error('O Token Oficial deve ter entre 2 e 36 casas decimais.');
  }
  return cents * 10n ** BigInt(tokenDecimals - 2);
}

export function validateCampaign(campaign: LocalIncentiveCampaign): void {
  getAddress(campaign.merchant);
  getAddress(campaign.sponsor);
  if (!campaign.name.trim()) throw new Error('Campanha sem nome.');
  if (
    !Number.isInteger(campaign.discountBps)
    || campaign.discountBps < 0
    || campaign.discountBps > MAX_DISCOUNT_BPS
  ) {
    throw new Error('Desconto deve estar entre 0% e 30%.');
  }
  if (
    !Number.isInteger(campaign.cashbackBps)
    || campaign.cashbackBps < 0
    || campaign.cashbackBps > MAX_CASHBACK_BPS
  ) {
    throw new Error('Cashback deve estar entre 0% e 10%.');
  }
  if (
    campaign.discountBps + campaign.cashbackBps <= 0
    || campaign.discountBps + campaign.cashbackBps > MAX_TOTAL_BENEFIT_BPS
  ) {
    throw new Error('Benefício total deve ser maior que 0% e limitado a 40%.');
  }
  const startsAt = new Date(campaign.startsAt).getTime();
  const endsAt = new Date(campaign.endsAt).getTime();
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt <= startsAt) {
    throw new Error('Período da campanha inválido.');
  }
  asNonNegativeInteger(campaign.minPurchaseCents, 'Compra mínima');
  asNonNegativeInteger(
    campaign.maxCashbackPerPurchaseCents,
    'Limite de cashback por compra',
  );
  asNonNegativeInteger(
    campaign.maxCashbackPerCustomerCents,
    'Limite de cashback por cliente',
  );
  asNonNegativeInteger(campaign.remainingBudgetCents, 'Orçamento restante');
}

export function quoteLocalIncentive(input: {
  campaign: LocalIncentiveCampaign;
  grossCents: bigint;
  customerCashbackEarnedCents?: bigint;
  now?: Date;
}): LocalIncentiveQuote {
  const { campaign, grossCents } = input;
  validateCampaign(campaign);
  if (grossCents <= 0n) throw new Error('Compra deve ser maior que zero.');

  const now = (input.now ?? new Date()).getTime();
  const minPurchase = BigInt(campaign.minPurchaseCents);
  const remainingBudget = BigInt(campaign.remainingBudgetCents);
  const earned = input.customerCashbackEarnedCents ?? 0n;
  const customerLimit = BigInt(campaign.maxCashbackPerCustomerCents);

  const inPeriod = now >= new Date(campaign.startsAt).getTime()
    && now <= new Date(campaign.endsAt).getTime();
  if (!campaign.active || !inPeriod) {
    return noBenefit(grossCents, 'Campanha inativa ou fora do período.');
  }
  if (grossCents < minPurchase) {
    return noBenefit(grossCents, 'Valor abaixo da compra mínima.');
  }

  const discountCents = calculateBps(grossCents, campaign.discountBps);
  const payableCents = grossCents - discountCents;
  let cashbackCents = calculateBps(grossCents, campaign.cashbackBps);
  const perPurchaseLimit = BigInt(campaign.maxCashbackPerPurchaseCents);
  if (perPurchaseLimit > 0n && cashbackCents > perPurchaseLimit) {
    cashbackCents = perPurchaseLimit;
  }
  if (customerLimit > 0n) {
    const availableForCustomer = customerLimit > earned
      ? customerLimit - earned
      : 0n;
    if (cashbackCents > availableForCustomer) cashbackCents = availableForCustomer;
  }
  if (cashbackCents > remainingBudget) {
    return noBenefit(grossCents, 'Orçamento de cashback insuficiente.');
  }
  return {
    grossCents,
    discountCents,
    payableCents,
    cashbackCents,
    eligible: payableCents > 0n,
  };
}

function noBenefit(grossCents: bigint, reason: string): LocalIncentiveQuote {
  return {
    grossCents,
    discountCents: 0n,
    payableCents: grossCents,
    cashbackCents: 0n,
    eligible: false,
    reason,
  };
}
