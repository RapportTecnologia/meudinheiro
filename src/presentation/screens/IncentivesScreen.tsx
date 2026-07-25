import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalIncentivePayment } from '../../application/hooks/useLocalIncentivePayment';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import {
  formatBrlCents,
  parseBrlCents,
  quoteLocalIncentive,
  type LocalIncentiveCampaign,
} from '../../domain/incentives/localIncentive';
import { incentiveGateway } from '../../infrastructure/incentives/incentiveGateway';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function IncentivesScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Incentives'>) {
  const { baseToken, accounts, activeAccountId, homeAmount } = useWalletStore();
  const [campaigns, setCampaigns] = useState<LocalIncentiveCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [payingCampaignId, setPayingCampaignId] = useState<string>();
  const payWithIncentive = useLocalIncentivePayment();
  const activeAccount = accounts.find(({ id }) => id === activeAccountId);
  const grossCents = useMemo(() => {
    try {
      return parseBrlCents(homeAmount);
    } catch {
      return undefined;
    }
  }, [homeAmount]);

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      if (!baseToken) throw new Error('Configure o Token Oficial regional.');
      const result = await incentiveGateway.listCampaigns({
        tokenAddress: baseToken.address,
        customerAddress:
          activeAccount?.smartAccountAddress ?? activeAccount?.address,
      });
      setCampaigns(result);
    } catch (cause) {
      setCampaigns([]);
      setError((cause as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [baseToken?.address, activeAccount?.smartAccountAddress]);

  const pay = async (
    campaign: LocalIncentiveCampaign,
    quote: ReturnType<typeof quoteLocalIncentive>,
  ) => {
    if (!grossCents || !quote.eligible || payingCampaignId) return;
    setPayingCampaignId(campaign.id);
    try {
      const result = await payWithIncentive(campaign, grossCents);
      if (result.status !== 'included') {
        throw new Error(
          result.status === 'reverted'
            ? result.reason
            : 'A confirmação da operação permanece pendente.',
        );
      }
      Alert.alert(
        'Compra confirmada',
        `Pagamento, desconto e cashback foram liquidados de forma atômica.\nGás do usuário: 0 POL\nTransação: ${result.transactionHash}`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }],
      );
      await load();
    } catch (cause) {
      Alert.alert('Pagamento não realizado', (cause as Error).message);
    } finally {
      setPayingCampaignId(undefined);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Benefícios da região</Text>
      <Text style={styles.subtitle}>
        Descontos e cashback determinísticos em compras locais. Não há sorteio,
        aposta ou emissão de tokens sem lastro.
      </Text>
      <View style={styles.amountCard}>
        <Text>Valor atual da calculadora</Text>
        <Text style={styles.amount}>
          {grossCents ? formatBrlCents(grossCents) : 'Digite um valor válido'}
        </Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#C2410C" />}
      {error && (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Benefícios indisponíveis</Text>
          <Text>{error}</Text>
          <Button title="Tentar novamente" onPress={load} />
        </View>
      )}
      {!loading && !error && campaigns.length === 0 && (
        <Text>Nenhuma campanha ativa para esta região.</Text>
      )}
      {campaigns.map((campaign) => {
        const quote = grossCents
          ? quoteLocalIncentive({ campaign, grossCents })
          : undefined;
        return (
          <View key={campaign.id} style={styles.campaign}>
            <Text style={styles.campaignTitle}>{campaign.name}</Text>
            <Text>{campaign.description}</Text>
            <Text>Desconto: {(campaign.discountBps / 100).toFixed(2)}%</Text>
            <Text>Cashback: {(campaign.cashbackBps / 100).toFixed(2)}%</Text>
            {quote?.eligible ? (
              <View style={styles.quote}>
                <Text>Desconto: {formatBrlCents(quote.discountCents)}</Text>
                <Text>Pagamento: {formatBrlCents(quote.payableCents)}</Text>
                <Text>Cashback: {formatBrlCents(quote.cashbackCents)}</Text>
                <Button
                  title={
                    payingCampaignId === campaign.id
                      ? 'Processando…'
                      : 'Revisar e autorizar compra'
                  }
                  onPress={() => pay(campaign, quote)}
                  disabled={Boolean(payingCampaignId)}
                />
              </View>
            ) : (
              <Text style={styles.ineligible}>
                {quote?.reason ?? 'Informe um valor para simular.'}
              </Text>
            )}
            <Text style={styles.hint}>
              Cashback pago pelo orçamento pré-financiado da campanha.
            </Text>
          </View>
        );
      })}
      <Button title="Voltar à calculadora" onPress={() => navigation.popToTop()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 16, backgroundColor: '#F9FAFB' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#374151', lineHeight: 21 },
  amountCard: { padding: 16, borderRadius: 12, backgroundColor: '#FFF7ED' },
  amount: { fontSize: 26, fontWeight: '800', color: '#C2410C', marginTop: 6 },
  campaign: { padding: 18, borderRadius: 14, gap: 8, backgroundColor: '#fff' },
  campaignTitle: { fontSize: 19, fontWeight: '800', color: '#166534' },
  quote: { padding: 12, borderRadius: 10, gap: 5, backgroundColor: '#DCFCE7' },
  warning: { padding: 14, borderRadius: 10, gap: 8, backgroundColor: '#FEF3C7' },
  warningTitle: { fontWeight: '800' },
  ineligible: { color: '#B45309' },
  hint: { color: '#6B7280', fontSize: 12 },
});
