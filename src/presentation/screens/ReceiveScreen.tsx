import * as Clipboard from 'expo-clipboard';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import { createPaymentRequestUri, type PaymentAsset } from '../../domain/payment/paymentRequest';

export function ReceiveScreen() {
  const { accounts, activeAccountId, baseToken, homeAmount, selectedAsset } = useWalletStore();
  const account = accounts.find((item) => item.id === activeAccountId);
  const asset: PaymentAsset | undefined = selectedAsset === 'POL'
    ? { kind: 'native', symbol: 'POL', decimals: 18 }
    : baseToken?.referenceCurrency === 'BRL'
      ? {
          kind: 'erc20',
          address: baseToken.address,
          symbol: baseToken.symbol,
          decimals: baseToken.decimals,
          referenceCurrency: baseToken.referenceCurrency,
        }
      : undefined;
  const uri = account && asset
    ? createPaymentRequestUri({ recipient: account.address, amount: homeAmount, asset })
    : undefined;
  const copyRequest = async () => {
    if (!uri) return;
    await Clipboard.setStringAsync(uri);
    Alert.alert(
      'Solicitação copiada',
      'O código contém o destino e o valor proposto. Ele não movimenta fundos sem revisão e autenticação do pagador.',
    );
  };
  return (
    <View style={styles.container}>
      {account && uri && asset ? <>
        <Text style={styles.title}>Solicitação de pagamento</Text>
        <Text style={styles.amount}>
          {selectedAsset === 'BRL' ? 'R$ ' : ''}{homeAmount} {asset.symbol}
        </Text>
        <QRCode value={uri} size={240} />
        <Button title="Copiar solicitação" onPress={copyRequest} />
        <Button
          title="Limpar área de transferência"
          color="#6B7280"
          onPress={() => Clipboard.setStringAsync('')}
        />
        <Text>Polygon • chainId 137</Text>
        <Text selectable style={styles.address}>{account.address}</Text>
        {selectedAsset === 'BRL' && (
          <Text style={styles.warning}>
            O pedido usa {asset.symbol} como Moeda Base em proporção nominal 1:1.
            O recebimento de dinheiro físico deve ser conferido pelo caixa.
          </Text>
        )}
      </> : <Text>Cadastre uma conta e configure a Moeda Base quando usar BRL.</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  amount: { fontSize: 28, fontWeight: '800', color: '#C2410C' },
  address: { textAlign: 'center' },
  warning: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12 },
});
