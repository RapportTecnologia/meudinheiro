import * as LocalAuthentication from 'expo-local-authentication';

export async function requireDeviceAuth(reason: string): Promise<void> {
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) throw new Error('Configure biometria ou bloqueio seguro no dispositivo.');
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });
  if (!result.success) throw new Error('Autorização cancelada ou recusada.');
}
