jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted' },
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  hasServicesEnabledAsync: jest.fn(async () => true),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -3.9, longitude: -38.39, accuracy: 10 },
    timestamp: Date.now(),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';
import { geofencingGateway } from '../src/infrastructure/geofencing/geofencingGateway';

const walletAddress = '0x0000000000000000000000000000000000000003';

function cachedDecision() {
  const now = Date.now();
  return JSON.stringify({
    decisionId: '00000000-0000-4000-8000-000000000001',
    allowed: true,
    reason: 'ALLOWED_BY_POLICY',
    policyVersion: 'aquiraz:1',
    matchedGeofenceIds: [],
    evaluatedAt: new Date(now - 1_000).toISOString(),
    expiresAt: new Date(now + 60_000).toISOString(),
  });
}

describe('gateway de geofencing e bloqueio administrativo', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_GEOFENCING_GATEWAY_URL = 'https://regional.example';
    jest.clearAllMocks();
  });

  it('não usa autorização offline quando o backend bloqueia a conta', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(cachedDecision());
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ code: 'ACCOUNT_BLOCKED', message: 'A conta está bloqueada.' }),
    })) as jest.Mock;

    await expect(geofencingGateway.authorize({
      operation: 'OFFLINE_PAYMENT',
      walletAddress,
    })).rejects.toThrow('A conta está bloqueada.');
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('usa uma autorização offline somente quando há falha de rede', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(cachedDecision());
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as jest.Mock;

    const result = await geofencingGateway.authorize({
      operation: 'OFFLINE_PAYMENT',
      walletAddress,
    });
    expect(result.source).toBe('cached-offline');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });
});
