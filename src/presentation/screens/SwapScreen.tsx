import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useWalletStore } from '../../application/hooks/useWalletStore';

export function SwapScreen() {
  const { baseToken, homeAmount } = useWalletStore();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swap seguro</Text>
      <Text>Valor vindo da calculadora: {homeAmount}</Text>
      <Text>Moeda Base: {baseToken?.symbol ?? 'não configurada'}</Text>
      <Text style={styles.note}>A execução está desativada até configurar endereços verificados, cotador, pool, fee tier, slippage e roteador por ambiente.</Text>
      <Button title="Simular cotação" onPress={() => Alert.alert('Esboço', 'Implemente QuoteProvider → valide slippage → autentique → aprove → execute exactInputSingle.')} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 18 },
  title: { fontSize: 24, fontWeight: '700' },
  note: { backgroundColor: '#FEF3C7', padding: 14, borderRadius: 10 },
});
