import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { isAddress } from 'ethers';
import { useWalletStore } from '../../application/hooks/useWalletStore';

export function ScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const setScannedAddress = useWalletStore((state) => state.setScannedAddress);
  if (!permission) return <View />;
  if (!permission.granted) return <View style={styles.center}><Text>Autorize a câmera para ler o QR Code.</Text><Button title="Autorizar" onPress={requestPermission} /></View>;
  return (
    <CameraView
      style={StyleSheet.absoluteFill}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={locked ? undefined : ({ data }) => {
        setLocked(true);
        const raw = data.startsWith('ethereum:') ? data.slice(9).split(/[@?]/)[0] : data;
        if (!raw || !isAddress(raw)) {
          Alert.alert('QR inválido', 'Use um endereço EVM 0x... ou URI ethereum:.', [{ text: 'Tentar novamente', onPress: () => setLocked(false) }]);
          return;
        }
        setScannedAddress(raw);
        Alert.alert('Endereço lido', raw, [{ text: 'Continuar', onPress: () => navigation.navigate('Home') }]);
      }}
    >
      <View style={styles.overlay}><Text style={styles.text}>Posicione o QR Code no centro</Text></View>
    </CameraView>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 32, backgroundColor: 'rgba(0,0,0,.2)' },
  text: { color: '#fff', textAlign: 'center', fontSize: 18 },
});
