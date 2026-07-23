import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useAuthorizedSigner } from '../../application/hooks/useAuthorizedSigner';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import { erc20, provider } from '../../infrastructure/blockchain/polygon';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function SendReviewScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SendReview'>) {
  const [busy, setBusy] = useState(false);
  const { pendingPayment, clearPendingPayment, recordContactUse } = useWalletStore();
  const authorizeSigner = useAuthorizedSigner();

  if (!pendingPayment) {
    return <View style={styles.container}><Text>Nenhum pagamento aguardando revisão.</Text></View>;
  }

  const pay = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const wallet = await authorizeSigner(
        `Autorizar pagamento de ${pendingPayment.amount} ${pendingPayment.asset.symbol}`,
      );
      const sender = await wallet.getAddress();
      if (sender.toLowerCase() === pendingPayment.recipient.toLowerCase()) {
        throw new Error('A conta de origem e o destinatário são iguais.');
      }
      const units = BigInt(pendingPayment.amountInSmallestUnit);
      let transaction;

      if (pendingPayment.asset.kind === 'native') {
        const request = { to: pendingPayment.recipient, value: units };
        const [balance, gas, fee] = await Promise.all([
          provider.getBalance(sender),
          wallet.estimateGas(request),
          provider.getFeeData(),
        ]);
        const gasPrice = fee.maxFeePerGas ?? fee.gasPrice;
        if (!gasPrice) throw new Error('Não foi possível estimar a taxa da rede.');
        if (balance < units + gas * gasPrice) throw new Error('Saldo de POL insuficiente para valor e gás.');
        transaction = await wallet.sendTransaction(request);
      } else {
        const token = erc20(pendingPayment.asset.address, wallet);
        const balance: bigint = await token.getFunction('balanceOf')(sender);
        if (balance < units) throw new Error(`Saldo de ${pendingPayment.asset.symbol} insuficiente.`);
        const transfer = token.getFunction('transfer');
        await transfer.estimateGas(pendingPayment.recipient, units);
        transaction = await transfer(pendingPayment.recipient, units);
      }

      const receipt = await transaction.wait(1);
      if (!receipt || receipt.status !== 1) throw new Error('A transação não foi confirmada.');
      recordContactUse(pendingPayment.recipient);
      clearPendingPayment();
      Alert.alert('Pagamento confirmado', `Hash: ${transaction.hash}`, [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (error) {
      Alert.alert('Pagamento não realizado', (error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confira antes de autorizar</Text>
      <View style={styles.card}>
        <Text>Rede: Polygon (137)</Text>
        <Text>Ativo: {pendingPayment.asset.symbol}</Text>
        <Text style={styles.amount}>
          {pendingPayment.asset.kind === 'erc20'
            && pendingPayment.asset.referenceCurrency === 'BRL' ? 'R$ ' : ''}
          {pendingPayment.amount}
        </Text>
        <Text selectable>Destino: {pendingPayment.recipient}</Text>
      </View>
      <Text style={styles.warning}>
        Confirme o valor e o endereço. A transação blockchain não pode ser desfeita
        pelo aplicativo após a confirmação.
      </Text>
      <Button
        title={busy ? 'Processando…' : 'Autorizar com biometria, PIN ou padrão'}
        onPress={pay}
        disabled={busy}
      />
      <Button title="Cancelar" color="#B91C1C" onPress={() => {
        clearPendingPayment();
        navigation.popToTop();
      }} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 18 },
  title: { fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: '#F3F4F6', padding: 18, borderRadius: 14, gap: 10 },
  amount: { color: '#C2410C', fontSize: 28, fontWeight: '800' },
  warning: { backgroundColor: '#FEF3C7', padding: 14, borderRadius: 10 },
});
