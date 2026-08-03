import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Wallet, formatUnits, getAddress, parseUnits } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import {
  createNoteDraft,
  createOfflinePaymentUri,
  issuanceAuthorizationMessage,
  offlinePaymentMessage,
  parseOfflinePaymentUri,
  verifyOfflinePayment,
  type OfflineMintInfo,
  type OfflinePaymentEnvelope,
} from '../../domain/offline/offlinePayment';
import { offlineGateway } from '../../infrastructure/offline/offlineGateway';
import { offlineVault } from '../../infrastructure/offline/offlineVault';
import { geofencingGateway } from '../../infrastructure/geofencing/geofencingGateway';
import { requireDeviceAuth } from '../../infrastructure/security/deviceAuth';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OfflineWallet'>;

export function OfflineWalletScreen({ route }: Props) {
  const { accounts, activeAccountId, baseToken, homeAmount } = useWalletStore();
  const account = accounts.find((item) => item.id === activeAccountId);
  const [reserveId, setReserveId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [mintInfo, setMintInfo] = useState<OfflineMintInfo>();
  const [qrValue, setQrValue] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState({
    available: 0n, sentPending: 0, receivedPending: 0, settlementPending: 0,
  });
  const incoming = useMemo(
    () => route.params?.incomingUri
      ? parseOfflinePaymentUri(route.params.incomingUri)
      : undefined,
    [route.params?.incomingUri],
  );
  const incomingAmount = useMemo(() => {
    if (!incoming || !baseToken) return undefined;
    try {
      return `${formatUnits(
        incoming.notes.reduce(
          (sum, note) => sum + BigInt(note.amountSmallest),
          0n,
        ),
        baseToken.decimals,
      )} ${baseToken.symbol}`;
    } catch {
      return 'valor inválido';
    }
  }, [baseToken, incoming]);
  const refreshSummary = useCallback(async () => {
    setSummary(await offlineVault.summary());
    setMintInfo(await offlineVault.getMintInfo());
  }, []);
  useEffect(() => { void refreshSummary(); }, [refreshSummary]);

  const ensureContext = () => {
    if (!account?.smartAccountAddress) {
      throw new Error('Ative a Smart Account antes de usar pagamentos off-line.');
    }
    const smartAccountAddress = account.smartAccountAddress;
    if (!baseToken) throw new Error('Configure o Token Oficial.');
    if (!mintInfo) throw new Error('Conecte-se e atualize os parâmetros regionais.');
    if (getAddress(baseToken.address) !== getAddress(mintInfo.tokenAddress)) {
      throw new Error('O emissor off-line pertence a outro Token Oficial.');
    }
    return { account, smartAccountAddress, baseToken, mintInfo };
  };

  const refreshMint = async () => {
    setBusy(true);
    try {
      const info = await offlineGateway.refreshMintInfo();
      setMintInfo(info);
      if (account) {
        await geofencingGateway.preauthorizeOfflinePayment(account.address);
      }
      Alert.alert(
        'Parâmetros atualizados',
        'Emissor, limites regionais e uma autorização geográfica curta de uso único foram armazenados.',
      );
    } catch (error) {
      Alert.alert('Não foi possível atualizar', (error as Error).message);
    } finally { setBusy(false); }
  };

  const issueExactNote = async () => {
    setBusy(true);
    try {
      const context = ensureContext();
      const amountSmallest = parseUnits(
        homeAmount.replace(',', '.'),
        context.baseToken.decimals,
      ).toString();
      const draft = createNoteDraft(amountSmallest);
      const authorization = {
        regionId: context.mintInfo.regionId,
        reserveId: reserveId.trim(),
        ownerAddress: context.smartAccountAddress,
        signerAddress: context.account.address,
        nonce: `app-${crypto.randomUUID()}`,
        commitments: [{
          commitment: draft.commitment,
          amountSmallest: draft.amountSmallest,
        }],
      };
      const geofence = await geofencingGateway.authorize({
        operation: 'OFFLINE_ISSUE',
        walletAddress: context.smartAccountAddress,
      });
      await requireDeviceAuth('Autorizar carga de saldo off-line');
      const privateKey = await secureSecrets.get(context.account.secretRef);
      if (!privateKey) throw new Error('Chave da conta não encontrada.');
      const response = await offlineGateway.issueNotes({
        ...authorization,
        ownerSignature: await new Wallet(privateKey).signMessage(
          issuanceAuthorizationMessage(authorization),
        ),
        geofenceDecisionId: geofence.decisionId,
      });
      const issued = response.notes[0];
      if (
        !issued
        || issued.commitment.toLowerCase() !== draft.commitment.toLowerCase()
        || issued.amountSmallest !== draft.amountSmallest
      ) throw new Error('O emissor devolveu uma nota diferente da autorizada.');
      await offlineVault.addNotes([{
        reserveId: issued.reserveId,
        secret: draft.secret,
        amountSmallest: issued.amountSmallest,
        expiresAt: issued.expiresAt,
        mintSignature: issued.mintSignature,
      }]);
      await refreshSummary();
      Alert.alert('Saldo off-line carregado', 'A nota foi guardada no armazenamento seguro deste dispositivo.');
    } catch (error) {
      Alert.alert('Carga não concluída', (error as Error).message);
    } finally { setBusy(false); }
  };

  const createPayment = async () => {
    setBusy(true);
    try {
      const context = ensureContext();
      const amount = parseUnits(homeAmount.replace(',', '.'), context.baseToken.decimals);
      const selected = await offlineVault.selectExact(amount);
      if (new Set(selected.map(({ note }) => note.reserveId)).size !== 1) {
        throw new Error('A versão atual não mistura reservas no mesmo pacote.');
      }
      const createdAt = new Date();
      const geofence = await geofencingGateway.authorize({
        operation: 'OFFLINE_PAYMENT',
        walletAddress: context.account.address,
        counterpartyAddresses: [getAddress(recipient.trim()) as `0x${string}`],
      });
      const noteExpiry = Math.min(
        ...selected.map(({ note }) => new Date(note.expiresAt).getTime()),
      );
      const unsigned: Omit<OfflinePaymentEnvelope, 'senderSignature'> = {
        version: 2,
        paymentId: crypto.randomUUID(),
        regionId: context.mintInfo.regionId,
        reserveId: selected[0]!.note.reserveId,
        senderAddress: context.account.address,
        recipientAddress: getAddress(recipient.trim()) as `0x${string}`,
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(Math.min(
          noteExpiry,
          createdAt.getTime() + 30 * 60 * 1_000,
        )).toISOString(),
        geofenceDecisionId: geofence.decisionId,
        notes: selected.map(({ note }) => note),
      };
      await requireDeviceAuth('Autorizar pagamento off-line');
      const privateKey = await secureSecrets.get(context.account.secretRef);
      if (!privateKey) throw new Error('Chave da conta não encontrada.');
      const envelope: OfflinePaymentEnvelope = {
        ...unsigned,
        senderSignature: await new Wallet(privateKey).signMessage(
          offlinePaymentMessage(unsigned),
        ),
      };
      const paymentUri = createOfflinePaymentUri(envelope);
      if (paymentUri.length > 2_500) {
        throw new Error('Pacote grande demais para QR estático. Carregue uma nota de valor exato.');
      }
      await offlineVault.markTransferred(selected.map(({ entry }) => entry.ref));
      setQrValue(paymentUri);
      await refreshSummary();
    } catch (error) {
      Alert.alert('Pagamento não preparado', (error as Error).message);
    } finally { setBusy(false); }
  };

  const acceptIncoming = async () => {
    setBusy(true);
    try {
      const context = ensureContext();
      if (!incoming) throw new Error('Nenhum pacote recebido.');
      const total = verifyOfflinePayment({
        envelope: incoming,
        mintInfo: context.mintInfo,
        expectedRecipient: context.smartAccountAddress,
        tokenDecimals: context.baseToken.decimals,
      });
      await requireDeviceAuth('Aceitar pagamento off-line pendente');
      await offlineVault.saveIncoming(incoming);
      await refreshSummary();
      Alert.alert(
        'Pagamento guardado como pendente',
        `${formatUnits(total, context.baseToken.decimals)} ${context.baseToken.symbol}. Sincronize assim que houver internet. A aceitação off-line não garante liquidação.`,
      );
    } catch (error) {
      Alert.alert('Pacote recusado', (error as Error).message);
    } finally { setBusy(false); }
  };

  const synchronize = async () => {
    setBusy(true);
    try {
      await requireDeviceAuth('Sincronizar pagamentos off-line');
      const pending = await offlineVault.pendingIncoming();
      if (pending.length === 0) throw new Error('Não há recebimentos pendentes.');
      let submitted = 0;
      for (const item of pending) {
        try {
          await offlineGateway.redeem(item.envelope);
          await offlineVault.markIncoming(item.entry.ref, 'settlement_pending');
          submitted += 1;
        } catch {
          // Falha de rede não pode apagar um instrumento ao portador.
        }
      }
      await refreshSummary();
      Alert.alert('Sincronização concluída', `${submitted} pacote(s) aceito(s) para liquidação on-chain.`);
    } catch (error) {
      Alert.alert('Sincronização não concluída', (error as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Layer 3 regional</Text>
      <Text style={styles.warning}>
        Pagamentos sem internet ficam PENDENTES até sincronização. O recebedor
        não consegue detectar gasto duplo enquanto estiver desconectado.
      </Text>
      <Text>
        Disponível: {baseToken
          ? formatUnits(summary.available, baseToken.decimals)
          : summary.available.toString()} {baseToken?.symbol ?? 'tokens'}
      </Text>
      <Text>
        Enviados pendentes: {summary.sentPending} • Recebidos: {summary.receivedPending}
        {' '}• On-chain pendentes: {summary.settlementPending}
      </Text>
      <Button title="Atualizar parâmetros regionais" onPress={refreshMint} disabled={busy} />

      {incoming && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Revisar recebimento off-line</Text>
          <Text style={styles.amount}>Valor proposto: {incomingAmount}</Text>
          <Text>Pagador: {incoming.senderAddress}</Text>
          <Text>Notas: {incoming.notes.length}</Text>
          <Text>Expira: {new Date(incoming.expiresAt).toLocaleString()}</Text>
          <Button title="Validar e aceitar como pendente" onPress={acceptIncoming} disabled={busy} />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.subtitle}>Carregar valor da calculadora</Text>
        <Text>
          Informe o ID de uma reserva pré-financiada criada pela Smart Account.
          A API confere titular, assinador, saldo e prazo on-chain.
        </Text>
        <TextInput
          value={reserveId}
          onChangeText={setReserveId}
          placeholder="0x… reserveId"
          autoCapitalize="none"
          style={styles.input}
        />
        <Button title={`Carregar ${homeAmount} ${baseToken?.symbol ?? ''}`} onPress={issueExactNote} disabled={busy} />
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Pagar sem internet</Text>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Smart Account 0x… do recebedor"
          autoCapitalize="none"
          style={styles.input}
        />
        <Button title={`Gerar QR de ${homeAmount}`} onPress={createPayment} disabled={busy} />
        {qrValue && (
          <View style={styles.qr}>
            <QRCode value={qrValue} size={250} />
            <Text style={styles.danger}>
              Este QR contém valor ao portador. Mostre somente ao destinatário.
              As notas foram bloqueadas localmente e não serão reutilizadas.
            </Text>
          </View>
        )}
      </View>

      <Button title="Sincronizar recebimentos" onPress={synchronize} disabled={busy} />
      <Text style={styles.footnote}>
        Protocolo próprio v1, inspirado conceitualmente no Minibits/Cashu.
        Não é compatível com Cashu e não usa assinaturas cegas.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: '#F9FAFB' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 18, fontWeight: '700' },
  amount: { fontSize: 20, fontWeight: '800', color: '#C2410C' },
  warning: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10, color: '#92400E' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, gap: 10 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12 },
  qr: { alignItems: 'center', gap: 10, paddingTop: 8 },
  danger: { color: '#991B1B', textAlign: 'center' },
  footnote: { color: '#6B7280', fontSize: 12, textAlign: 'center' },
});
