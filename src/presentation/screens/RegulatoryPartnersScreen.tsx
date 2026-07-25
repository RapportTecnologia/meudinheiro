import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRegulatoryDisclosure } from '../../application/hooks/useRegulatoryDisclosure';
import type { RootStackParamList } from '../navigation/AppNavigator';

const ROLE_LABELS = {
  PIX: 'Liquidação Pix',
  PAYMENT_ACCOUNT: 'Conta de pagamento',
  RESERVE_CUSTODY: 'Custódia da reserva em BRL',
  KYC_AML: 'Identificação e prevenção a ilícitos',
  VIRTUAL_ASSET_SERVICE: 'Serviços de ativos virtuais',
  COMMUNITY_GOVERNANCE: 'Governança comunitária',
} as const;

export function RegulatoryPartnersScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'RegulatoryPartners'>) {
  const { disclosure, loading, error, refresh } = useRegulatoryDisclosure();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Parceiros e responsabilidades</Text>
      <Text style={styles.intro}>
        O Meu Dinheiro não se apresenta como banco. Serviços financeiros, Pix,
        conta, reserva ou ativos virtuais devem identificar a instituição que
        efetivamente os presta e a situação declarada de sua autorização.
      </Text>
      {loading && <ActivityIndicator size="large" color="#C2410C" />}
      {error && (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Operação regulada indisponível</Text>
          <Text>{error}</Text>
          <Button title="Consultar novamente" onPress={refresh} />
        </View>
      )}
      {disclosure && (
        <>
          <Text>Política: {disclosure.policyVersion}</Text>
          <Text>Válida até: {new Date(disclosure.expiresAt).toLocaleDateString('pt-BR')}</Text>
          {disclosure.partners.map((partner) => (
            <View key={partner.id} style={styles.card}>
              <Text style={styles.partnerName}>{partner.legalName}</Text>
              <Text>CNPJ: {partner.cnpj}</Text>
              <Text>
                Autoridade declarada: {partner.authorization.authority}
                {' • '}
                {partner.authorization.reference}
              </Text>
              <Text>
                Situação: {partner.authorization.status === 'active'
                  ? 'ativa'
                  : partner.authorization.status}
              </Text>
              {partner.roles.map((role) => (
                <Text key={role}>• {ROLE_LABELS[role]}</Text>
              ))}
              <Button
                title="Abrir site institucional"
                onPress={() => Linking.openURL(partner.websiteUrl)}
              />
            </View>
          ))}
          <Button title="Termos do serviço" onPress={() => Linking.openURL(disclosure.termsUrl)} />
          <Button
            title="Política de privacidade"
            onPress={() => Linking.openURL(disclosure.privacyUrl)}
          />
        </>
      )}
      <Text style={styles.note}>
        Projetos de lei sobre moedas sociais e bancos comunitários ainda podem
        alterar o enquadramento. A versão regulatória deve ser revalidada antes
        de habilitar cada região.
      </Text>
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 14, backgroundColor: '#F9FAFB' },
  title: { fontSize: 25, fontWeight: '800', color: '#111827' },
  intro: { lineHeight: 21, color: '#374151' },
  card: { padding: 16, gap: 7, borderRadius: 12, backgroundColor: '#fff' },
  partnerName: { fontSize: 18, fontWeight: '800', color: '#166534' },
  warning: { padding: 14, gap: 8, borderRadius: 10, backgroundColor: '#FEE2E2' },
  warningTitle: { fontWeight: '800', color: '#991B1B' },
  note: { padding: 14, borderRadius: 10, backgroundColor: '#FEF3C7' },
});

