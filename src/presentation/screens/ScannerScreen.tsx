import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import {
  createPaymentRequestUri,
  parsePaymentRequestUri,
  type PaymentAsset,
} from '../../domain/payment/paymentRequest';

export function ScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const {
    baseToken, homeAmount, selectedAsset, setPendingPayment,
  } = useWalletStore();
  const basePaymentAsset: PaymentAsset | undefined = baseToken
    ? {
        kind: 'erc20', address: baseToken.address, symbol: baseToken.symbol,
        decimals: baseToken.decimals, referenceCurrency: baseToken.referenceCurrency,
      }
    : undefined;
  const selectedPaymentAsset: PaymentAsset | undefined = selectedAsset === 'POL'
    ? { kind: 'native', symbol: 'POL', decimals: 18 }
    : baseToken?.referenceCurrency === 'BRL' ? basePaymentAsset : undefined;
  if (!permission) return <View />;
  if (!permission.granted) return <View style={styles.center}><Text>Autorize a câmera para ler o QR Code.</Text><Button title="Autorizar" onPress={requestPermission} /></View>;
  return (
    <CameraView
      style={StyleSheet.absoluteFill}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={locked ? undefined : ({ data }) => {
        setLocked(true);
        try {
          if (!selectedPaymentAsset) throw new Error('Configure a Moeda Base antes de pagar em BRL.');
          let request = parsePaymentRequestUri(data, basePaymentAsset);
          if (!request) throw new Error('Solicitação vazia.');
          if (request.amountInSmallestUnit === '0') {
            request = parsePaymentRequestUri(
              createPaymentRequestUri({
                recipient: request.recipient,
                amount: homeAmount,
                asset: selectedPaymentAsset,
              }),
              selectedPaymentAsset,
            );
          }
          if (!request) throw new Error('Não foi possível interpretar a cobrança.');
          setPendingPayment(request);
          navigation.replace('SendReview');
        } catch (error) {
          Alert.alert('QR inválido', (error as Error).message, [
            { text: 'Tentar novamente', onPress: () => setLocked(false) },
          ]);
        }
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
