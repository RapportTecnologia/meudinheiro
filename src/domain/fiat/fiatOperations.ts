export const MAX_REDEMPTION_FEE_BPS = 100;
export const DEFAULT_REDEMPTION_FEE_BPS = 50;
const BPS_DENOMINATOR = 10_000n;

export type RedemptionQuote = {
  grossCents: bigint;
  feeBps: number;
  feeCents: bigint;
  netPixCents: bigint;
};

export type ReserveSnapshot = {
  reserveBrlCents: bigint;
  circulatingTokenCents: bigint;
  lockedUnpaidRedemptionCents: bigint;
};

export function parseBrlToCents(value: string): bigint {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Informe um valor em reais com até duas casas decimais.');
  }
  const [whole = '0', fraction = ''] = normalized.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0') || '0');
  if (cents <= 0n) throw new Error('O valor deve ser maior que zero.');
  return cents;
}

export function formatBrl(cents: bigint): string {
  if (cents < 0n) throw new Error('Valor monetário negativo não é permitido.');
  const whole = cents / 100n;
  const fraction = (cents % 100n).toString().padStart(2, '0');
  return `R$ ${whole.toString()},${fraction}`;
}

export function quoteRedemption(
  grossCents: bigint,
  feeBps: number,
): RedemptionQuote {
  if (grossCents <= 0n) throw new Error('O resgate deve ser maior que zero.');
  if (
    !Number.isInteger(feeBps)
    || feeBps < 0
    || feeBps > MAX_REDEMPTION_FEE_BPS
  ) {
    throw new Error('A taxa de resgate deve estar entre 0% e 1%.');
  }
  const numerator = grossCents * BigInt(feeBps);
  const feeCents = numerator === 0n
    ? 0n
    : (numerator - 1n) / BPS_DENOMINATOR + 1n;
  if (feeCents >= grossCents) {
    throw new Error('O valor líquido do Pix deve ser maior que zero.');
  }
  return {
    grossCents,
    feeBps,
    feeCents,
    netPixCents: grossCents - feeCents,
  };
}

export function reserveCoverage(snapshot: ReserveSnapshot) {
  const requiredCents =
    snapshot.circulatingTokenCents + snapshot.lockedUnpaidRedemptionCents;
  return {
    requiredCents,
    surplusCents: snapshot.reserveBrlCents - requiredCents,
    isCovered: snapshot.reserveBrlCents >= requiredCents,
  };
}
