import {
  assertGeofenceDecision,
  geofenceDenialMessage,
} from '../src/domain/geofencing/geofenceDecision';

const decision = {
  decisionId: '00000000-0000-4000-8000-000000000001',
  allowed: true,
  reason: 'ALLOWED_BY_POLICY',
  policyVersion: 'aquiraz:1',
  matchedGeofenceIds: ['00000000-0000-4000-8000-000000000002'],
  evaluatedAt: '2026-08-01T12:00:00.000Z',
  expiresAt: '2026-08-01T12:05:00.000Z',
};

describe('decisão de geofencing', () => {
  it('aceita autorização curta, íntegra e ainda válida', () => {
    expect(assertGeofenceDecision(
      decision,
      new Date('2026-08-01T12:01:00.000Z'),
    )).toEqual(decision);
  });

  it('rejeita decisão vencida ou com identificador inválido', () => {
    expect(() => assertGeofenceDecision(
      decision,
      new Date('2026-08-01T12:06:00.000Z'),
    )).toThrow('vencida');
    expect(() => assertGeofenceDecision(
      { ...decision, decisionId: 'inseguro' },
      new Date('2026-08-01T12:01:00.000Z'),
    )).toThrow('inválida');
  });

  it('traduz recusas sem expor detalhes internos da política', () => {
    expect(geofenceDenialMessage('DENIED_AREA')).toContain('bloqueada');
    expect(geofenceDenialMessage('OUTSIDE_ALLOWED_AREA')).toContain('fora');
    expect(geofenceDenialMessage('LOCATION_ACCURACY_TOO_LOW')).toContain('imprecisa');
  });
});
