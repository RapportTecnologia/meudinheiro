import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import {
  DEFAULT_REDEMPTION_FEE_BPS,
  formatBrl,
  parseBrlToCents,
  quoteRedemption,
} from '../../domain/fiat/fiatOperations';
import { fiatGateway, type PixDeposit } from '../../infrastructure/fiat/fiatGateway';
import { requireDeviceAuth } from '../../infrastructure/security/deviceAuth';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function CashOperationsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'CashOperations'>) {
  const { homeAmount, accounts, activeAccountId, baseToken } = useWalletStore();
  const [busy, setBusy] = useState(false);
  const [deposit, setDeposit] = useState<PixDeposit>();
  const account = accounts.find(({ id }) => id === activeAccountId);
  const quote = useMemo(() => {
    try {
      return quoteRedemption(
        parseBrlToCents(homeAmount),
        DEFAULT_REDEMPTION_FEE_BPS,
      );
    } catch {
      return undefined;
    }
  }, [homeAmount]);

  const validate = () => {
    if (!quote) throw new Error('Digite um valor válido na calculadora.');
    if (!account) throw new Error('Selecione uma conta.');
    if (!baseToken || baseToken.referenceCurrency !== 'BRL') {
      throw new Error('Configure o Token Oficial regional vinculado ao BRL.');
    }
    return { quote, account };
  };

  const createDeposit = async () => {
    setBusy(true);
    try {
      const validated = validate();
      await requireDeviceAuth(
        `Autorizar solicitação de carga de ${formatBrl(validated.quote.grossCents)}`,
      );
      const created = await fiatGateway.createDeposit({
        walletAddress:
          validated.account.smartAccountAddress ?? validated.account.address,
        grossBrlCents: validated.quote.grossCents.toString(),
      });
      setDeposit(created);
    } catch (error) {
      Alert.alert('Carga não iniciada', (error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const prepareRedemption = async () => {
    setBusy(true);
    try {
      const validated = validate();
      if (!validated.account.smartAccountAddress) {
        throw new Error('Ative a Smart Account de custo zero nas Configurações.');
      }
      await requireDeviceAuth(
        `Autorizar resgate líquido de ${formatBrl(validated.quote.netPixCents)}`,
      );
      const prepared = await fiatGateway.prepareRedemption({
        smartAccountAddress: validated.account.smartAccountAddress,
        grossBrlCents: validated.quote.grossCents.toString(),
      });
      if (
        prepared.feeBps < 0
        || prepared.feeBps > 100
        || BigInt(prepared.grossBrlCents) !== validated.quote.grossCents
      ) {
        throw new Error('A cotação devolvida pelo gateway é incompatível.');
      }
      Alert.alert(
        'Resgate preparado',
        'A próxima etapa bloqueará os tokens via ERC-4337. O burn só ocorrerá após o banco confirmar o Pix; em falha, os tokens serão estornados.',
      );
    } catch (error) {
      Alert.alert('Resgate não iniciado', (error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Carga e resgate via Pix</Text>
      <Text style={styles.parity}>1 Token Oficial = R$ 1,00 bruto</Text>
      <View style={styles.card}>
        <Text>Valor bruto</Text>
        <Text style={styles.amount}>
          {quote ? formatBrl(quote.grossCents) : 'Valor inválido'}
        </Text>
        <Text>Taxa de resgate: 0,5% (configurável até 1%)</Text>
        <Text>
          Pix líquido estimado: {quote ? formatBrl(quote.netPixCents) : '—'}
        </Text>
      </View>
      <Text style={styles.note}>
        A carga só emite tokens após a liquidação do Pix. No resgate, os tokens
        ficam bloqueados; são queimados somente depois da confirmação do Pix.
      </Text>
      <Button
        title={busy ? 'Processando…' : 'Carregar carteira via Pix'}
        onPress={createDeposit}
        disabled={busy}
      />
      <Button
        title={busy ? 'Processando…' : 'Resgatar para Pix'}
        onPress={prepareRedemption}
        disabled={busy}
      />
      {deposit && (
        <View style={styles.pixCard}>
          <Text style={styles.pixTitle}>Pix aguardando pagamento</Text>
          <Text selectable>{deposit.pixCopyAndPaste}</Text>
          <Text>Após a liquidação, a emissão é automática e idempotente.</Text>
        </View>
      )}
      <Button title="Voltar à calculadora" onPress={() => navigation.popToTop()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 18, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  parity: { fontSize: 17, fontWeight: '700', color: '#166534' },
  card: { padding: 18, borderRadius: 14, gap: 10, backgroundColor: '#fff' },
  amount: { fontSize: 30, fontWeight: '800', color: '#C2410C' },
  note: { padding: 14, borderRadius: 10, backgroundColor: '#FEF3C7' },
  pixCard: { padding: 14, borderRadius: 10, gap: 10, backgroundColor: '#DCFCE7' },
  pixTitle: { fontSize: 17, fontWeight: '800', color: '#166534' },
});
