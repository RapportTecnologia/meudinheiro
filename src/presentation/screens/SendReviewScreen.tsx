import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSponsoredTransfer } from '../../application/hooks/useSponsoredTransfer';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import { validateContactDraft } from '../../domain/contacts/contact';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function SendReviewScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SendReview'>) {
  const [busy, setBusy] = useState(false);
  const [saveChoice, setSaveChoice] = useState<'undecided' | 'save' | 'skip'>('undecided');
  const [newContactName, setNewContactName] = useState('');
  const {
    pendingPayment,
    clearPendingPayment,
    contacts,
    addContact,
    recordContactUse,
    accounts,
    activeAccountId,
  } = useWalletStore();
  const sendSponsoredTransfer = useSponsoredTransfer();
  const activeAccount = accounts.find(({ id }) => id === activeAccountId);

  if (!pendingPayment) {
    return <View style={styles.container}><Text>Nenhum pagamento aguardando revisão.</Text></View>;
  }

  const knownContact = contacts.find((contact) =>
    contact.address.toLowerCase() === pendingPayment.recipient.toLowerCase());

  const pay = async () => {
    if (busy) return;
    if (!knownContact && saveChoice === 'undecided') {
      Alert.alert('Agenda', 'Escolha se deseja salvar este novo endereço antes de continuar.');
      return;
    }

    if (!knownContact && saveChoice === 'save') {
      try {
        validateContactDraft(contacts, {
          name: newContactName,
          address: pendingPayment.recipient,
        });
      } catch (error) {
        Alert.alert(
          'Conflito na agenda',
          `${(error as Error).message}\n\nUse outro nome ou edite o contato existente.`,
          [
            { text: 'Usar outro nome', style: 'cancel' },
            { text: 'Editar Agenda', onPress: () => navigation.navigate('Contacts') },
          ],
        );
        return;
      }
    }

    setBusy(true);
    try {
      const operation = await sendSponsoredTransfer(pendingPayment);
      if (operation.status === 'reverted') {
        throw new Error(`A UserOperation foi revertida: ${operation.reason}`);
      }
      if (operation.status !== 'included') {
        throw new Error('A confirmação da UserOperation permanece pendente.');
      }

      let contactWarning = '';
      if (!knownContact && saveChoice === 'save') {
        try {
          addContact(newContactName, pendingPayment.recipient);
        } catch (error) {
          contactWarning = `\n\nO pagamento foi confirmado, mas o contato não foi salvo: ${(error as Error).message}`;
        }
      }
      recordContactUse(pendingPayment.recipient);
      clearPendingPayment();
      Alert.alert(
        'Pagamento confirmado',
        `Gás cobrado do usuário: 0 POL\nTransação: ${operation.transactionHash}\nUserOperation: ${operation.userOperationHash}${contactWarning}`,
        [
        { text: 'OK', onPress: () => navigation.popToTop() },
        ],
      );
    } catch (error) {
      Alert.alert('Pagamento não realizado', (error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Confira antes de autorizar</Text>
      <View style={styles.card}>
        <Text>Rede: Polygon (137)</Text>
        <Text>Origem: Smart Account ERC-4337</Text>
        <Text selectable>{activeAccount?.smartAccountAddress ?? 'não ativada'}</Text>
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
      <View style={styles.sponsorCard}>
        <Text style={styles.sponsorTitle}>Custo de gás para você: 0 POL</Text>
        <Text>
          A plataforma patrocinará esta UserOperation por meio do Paymaster
          ERC-4337. Se o patrocínio não for aprovado, nada será assinado nem cobrado.
        </Text>
      </View>
      {knownContact ? (
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contato: {knownContact.name}</Text>
          <Text>Este destinatário já está na agenda.</Text>
        </View>
      ) : (
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Novo destinatário</Text>
          <Text>
            Este endereço ainda não está na agenda. Deseja salvá-lo após a
            confirmação do pagamento?
          </Text>
          <View style={styles.contactActions}>
            <Button title="Salvar" onPress={() => setSaveChoice('save')} disabled={busy} />
            <Button title="Agora não" onPress={() => setSaveChoice('skip')} disabled={busy} />
          </View>
          {saveChoice === 'save' && (
            <>
              <TextInput
                placeholder="Nome único do contato"
                value={newContactName}
                onChangeText={setNewContactName}
                autoCorrect={false}
                style={styles.input}
              />
              <Text style={styles.hint}>
                Nomes e endereços não podem ser repetidos. Em caso de conflito,
                use outro nome ou edite o contato existente na Agenda.
              </Text>
            </>
          )}
          {saveChoice === 'skip' && <Text style={styles.hint}>O endereço não será salvo.</Text>}
        </View>
      )}
      <Button
        title={busy ? 'Processando…' : 'Autorizar com biometria, PIN ou padrão'}
        onPress={pay}
        disabled={
          busy
          || (!knownContact && saveChoice === 'undecided')
          || (!knownContact && saveChoice === 'save' && !newContactName.trim())
        }
      />
      <Button title="Cancelar" color="#B91C1C" onPress={() => {
        clearPendingPayment();
        navigation.popToTop();
      }} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 18 },
  title: { fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: '#F3F4F6', padding: 18, borderRadius: 14, gap: 10 },
  amount: { color: '#C2410C', fontSize: 28, fontWeight: '800' },
  warning: { backgroundColor: '#FEF3C7', padding: 14, borderRadius: 10 },
  contactCard: { backgroundColor: '#EFF6FF', padding: 14, borderRadius: 10, gap: 10 },
  contactTitle: { fontSize: 17, fontWeight: '700' },
  contactActions: { flexDirection: 'row', gap: 12 },
  input: { borderWidth: 1, borderColor: '#93C5FD', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  hint: { color: '#374151', fontSize: 12 },
  sponsorCard: { backgroundColor: '#DCFCE7', padding: 14, borderRadius: 10, gap: 6 },
  sponsorTitle: { color: '#166534', fontSize: 17, fontWeight: '800' },
});
