export const geofencedOperations = [
  'TRANSFER',
  'INCENTIVE_PAYMENT',
  'SWAP',
  'PIX_DEPOSIT',
  'PIX_REDEMPTION',
  'OFFLINE_ISSUE',
  'OFFLINE_PAYMENT',
  'OFFLINE_REDEEM',
] as const;

export type GeofencedOperation = (typeof geofencedOperations)[number];

export type GeofenceDecision = {
  decisionId: string;
  allowed: boolean;
  reason: string;
  policyVersion: string;
  matchedGeofenceIds: string[];
  evaluatedAt: string;
  expiresAt: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertGeofenceDecision(
  value: GeofenceDecision,
  now = new Date(),
): GeofenceDecision {
  if (
    !value
    || !UUID.test(value.decisionId)
    || typeof value.allowed !== 'boolean'
    || !value.reason
    || !value.policyVersion
    || !Array.isArray(value.matchedGeofenceIds)
  ) {
    throw new Error('Resposta de geofencing inválida.');
  }
  const evaluatedAt = new Date(value.evaluatedAt).getTime();
  const expiresAt = new Date(value.expiresAt).getTime();
  if (
    !Number.isFinite(evaluatedAt)
    || !Number.isFinite(expiresAt)
    || evaluatedAt > now.getTime() + 60_000
    || expiresAt <= now.getTime()
    || expiresAt - evaluatedAt > 15 * 60_000
  ) {
    throw new Error('Autorização geográfica vencida ou com prazo inválido.');
  }
  return value;
}

export function geofenceDenialMessage(reason: string): string {
  switch (reason) {
    case 'DENIED_AREA':
      return 'A transação está bloqueada nesta área geográfica.';
    case 'OUTSIDE_ALLOWED_AREA':
    case 'NO_ACTIVE_ALLOW_GEOFENCE':
      return 'A transação está fora da área regional autorizada.';
    case 'LOCATION_ACCURACY_TOO_LOW':
      return 'A localização está imprecisa. Vá para uma área aberta e tente novamente.';
    default:
      return 'A política regional não autorizou esta transação.';
  }
}
