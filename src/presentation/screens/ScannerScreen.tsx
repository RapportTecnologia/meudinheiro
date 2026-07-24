import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
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
  const selectedPaymentAsset: PaymentAsset | undefined = basePaymentAsset
    ? {
        ...basePaymentAsset,
        referenceCurrency: selectedAsset === 'BRL'
          ? basePaymentAsset.referenceCurrency
          : undefined,
      }
    : undefined;

  const processRequest = (data: string, source: 'QR' | 'Área de transferência') => {
    if (locked) return;
    setLocked(true);
    try {
      if (!selectedPaymentAsset) throw new Error('Configure a Moeda Base antes de pagar em BRL.');
      let request = parsePaymentRequestUri(data.trim(), basePaymentAsset);
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
      Alert.alert(`${source} inválido`, (error as Error).message, [
        { text: 'Tentar novamente', onPress: () => setLocked(false) },
      ]);
    }
  };

  const pasteRequest = async () => {
    const data = await Clipboard.getStringAsync();
    processRequest(data, 'Área de transferência');
  };

  if (!permission) return (
    <View style={styles.center}>
      <Text>Carregando permissões…</Text>
      <Button title="Colar solicitação" onPress={pasteRequest} disabled={locked} />
    </View>
  );
  if (!permission.granted) return (
    <View style={styles.center}>
      <Text>Autorize a câmera para ler o QR Code ou cole uma solicitação recebida.</Text>
      <Button title="Autorizar câmera" onPress={requestPermission} />
      <Button title="Colar solicitação" onPress={pasteRequest} disabled={locked} />
    </View>
  );
  return (
    <CameraView
      style={StyleSheet.absoluteFill}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={locked ? undefined : ({ data }) => processRequest(data, 'QR')}
    >
      <View style={styles.overlay}>
        <Text style={styles.text}>Posicione o QR Code no centro</Text>
        <Button title="Colar solicitação" onPress={pasteRequest} disabled={locked} />
      </View>
    </CameraView>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 32, gap: 12, backgroundColor: 'rgba(0,0,0,.2)' },
  text: { color: '#fff', textAlign: 'center', fontSize: 18 },
});
