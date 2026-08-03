import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { getAddress } from 'ethers';
import {
  assertGeofenceDecision,
  geofenceDenialMessage,
  type GeofencedOperation,
  type GeofenceDecision,
} from '../../domain/geofencing/geofenceDecision';
import type { Address } from '../../domain/wallet/types';

const REQUEST_TIMEOUT_MS = 12_000;
const CACHE_PREFIX = 'geofence-permit-v1';

function gatewayUrl(): string {
  const value = process.env.EXPO_PUBLIC_GEOFENCING_GATEWAY_URL?.trim()
    ?? process.env.EXPO_PUBLIC_ERC4337_GATEWAY_URL?.trim();
  if (!value) throw new Error('Gateway regional de geofencing não configurado.');
  return value.replace(/\/+$/, '');
}

function cacheKey(operation: GeofencedOperation, walletAddress: Address): string {
  return `${CACHE_PREFIX}:${operation}:${walletAddress.toLowerCase()}`;
}

async function currentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    throw new Error(
      'A localização em primeiro plano é obrigatória para validar a região da transação.',
    );
  }
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('Ative a localização do dispositivo para continuar.');
  }
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
    mayShowUserSettingsDialog: true,
  });
  if (location.coords.accuracy === null) {
    throw new Error('O dispositivo não informou a precisão da localização.');
  }
  return location;
}

async function cachedOfflineDecision(
  operation: GeofencedOperation,
  walletAddress: Address,
): Promise<GeofenceDecision | undefined> {
  if (operation !== 'OFFLINE_PAYMENT') return undefined;
  const raw = await SecureStore.getItemAsync(cacheKey(operation, walletAddress));
  if (!raw) return undefined;
  try {
    const decision = assertGeofenceDecision(JSON.parse(raw) as GeofenceDecision);
    await SecureStore.deleteItemAsync(cacheKey(operation, walletAddress));
    return decision;
  } catch {
    await SecureStore.deleteItemAsync(cacheKey(operation, walletAddress));
    return undefined;
  }
}

export const geofencingGateway = {
  async authorize(input: {
    operation: GeofencedOperation;
    walletAddress: Address;
    counterpartyAddresses?: Address[];
  }): Promise<GeofenceDecision & { source: 'online' | 'cached-offline' }> {
    const walletAddress = getAddress(input.walletAddress) as Address;
    const counterpartyAddresses = (input.counterpartyAddresses ?? [])
      .map((address) => getAddress(address) as Address);
    const location = await currentLocation();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${gatewayUrl()}/v1/geofencing/evaluate`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: input.operation,
          walletAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracyMeters: location.coords.accuracy,
          deviceTimestamp: new Date(location.timestamp).toISOString(),
          counterpartyAddresses,
        }),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({})) as GeofenceDecision & {
        message?: string;
      };
      if (!response.ok) {
        if (typeof body.allowed === 'boolean' && !body.allowed) {
          throw new Error(geofenceDenialMessage(body.reason));
        }
        throw new Error(body.message ?? `Geofencing respondeu HTTP ${response.status}.`);
      }
      const decision = assertGeofenceDecision(body);
      if (!decision.allowed) throw new Error(geofenceDenialMessage(decision.reason));
      return { ...decision, source: 'online' };
    } catch (error) {
      const networkFailure = error instanceof TypeError
        || (error as Error).name === 'AbortError'
        || /network request failed/i.test((error as Error).message);
      if (!networkFailure) throw error;
      const cached = await cachedOfflineDecision(input.operation, walletAddress);
      if (cached) return { ...cached, source: 'cached-offline' };
      if ((error as Error).name === 'AbortError') {
        throw new Error('A validação geográfica demorou demais para responder.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },

  async preauthorizeOfflinePayment(walletAddress: Address): Promise<GeofenceDecision> {
    const normalized = getAddress(walletAddress) as Address;
    const decision = await this.authorize({
      operation: 'OFFLINE_PAYMENT',
      walletAddress: normalized,
    });
    await SecureStore.setItemAsync(
      cacheKey('OFFLINE_PAYMENT', normalized),
      JSON.stringify(decision),
    );
    return decision;
  },
};
