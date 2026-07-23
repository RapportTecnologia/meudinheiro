import * as LocalAuthentication from 'expo-local-authentication';

export async function requireDeviceAuth(reason: string): Promise<void> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    promptSubtitle: 'Use biometria, PIN ou padrão do dispositivo',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });
  if (!result.success) {
    throw new Error('Autorização cancelada ou recusada. Configure um bloqueio seguro no dispositivo.');
  }
}
