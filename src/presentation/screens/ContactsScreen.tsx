import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import { rankContacts } from '../../domain/contacts/contact';
import {
  createPaymentRequestUri,
  parsePaymentRequestUri,
  type PaymentAsset,
} from '../../domain/payment/paymentRequest';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function ContactsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Contacts'>) {
  const state = useWalletStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [directAddress, setDirectAddress] = useState('');
  const [editingId, setEditingId] = useState<string>();
  const contacts = useMemo(() => rankContacts(state.contacts), [state.contacts]);
  const baseAsset: PaymentAsset | undefined = state.baseToken
    ? {
        kind: 'erc20',
        address: state.baseToken.address,
        symbol: state.baseToken.symbol,
        decimals: state.baseToken.decimals,
        referenceCurrency: state.baseToken.referenceCurrency,
      }
    : undefined;
  const selectedAsset: PaymentAsset | undefined = state.selectedAsset === 'POL'
    ? { kind: 'native', symbol: 'POL', decimals: 18 }
    : state.baseToken?.referenceCurrency === 'BRL' ? baseAsset : undefined;

  const selectRecipient = (recipient: string) => {
    try {
      if (!selectedAsset) throw new Error('Configure a Moeda Base antes de pagar em BRL.');
      const uri = createPaymentRequestUri({
        recipient,
        amount: state.homeAmount,
        asset: selectedAsset,
      });
      const request = parsePaymentRequestUri(uri, baseAsset);
      if (!request) throw new Error('Não foi possível montar a solicitação.');
      state.setPendingPayment(request);
      navigation.navigate('SendReview');
    } catch (error) {
      Alert.alert('Não foi possível preparar o envio', (error as Error).message);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setEditingId(undefined);
  };

  const persistContact = () => {
    try {
      if (editingId) state.updateContact(editingId, name, address);
      else state.addContact(name, address);
      resetForm();
    } catch (error) {
      Alert.alert(
        'Conflito na agenda',
        `${(error as Error).message}\n\nUse outro nome ou edite o contato existente.`,
      );
    }
  };

  const save = () => {
    const current = state.contacts.find(({ id }) => id === editingId);
    const addressChanged = current
      && current.address.toLowerCase() !== address.trim().toLowerCase();

    if (addressChanged) {
      Alert.alert(
        'Confirmar novo endereço',
        `Você está alterando o endereço de ${current.name}. Confira o endereço completo antes de continuar:\n\n${address.trim()}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar alteração', onPress: persistContact },
        ],
      );
      return;
    }
    persistContact();
  };

  return (
    <View style={styles.container}>
      <View style={styles.methods}>
        <Button title="Ler QR" onPress={() => navigation.navigate('Scanner')} />
        <TextInput
          placeholder="Ou informe um novo endereço 0x..."
          value={directAddress}
          onChangeText={setDirectAddress}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Button
          title="Revisar novo endereço"
          onPress={() => selectRecipient(directAddress)}
          disabled={!directAddress.trim()}
        />
      </View>

      <Text style={styles.heading}>Destinatários mais usados</Text>
      <FlatList
        data={contacts}
        keyExtractor={({ id }) => id}
        ListEmptyComponent={<Text>Nenhum contato salvo.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable onPress={() => selectRecipient(item.address)} style={styles.contact}>
              <Text style={styles.name}>{item.favorite ? '★ ' : ''}{item.name}</Text>
              <Text numberOfLines={1}>{item.address}</Text>
              <Text>{item.useCount} uso(s)</Text>
            </Pressable>
            <View style={styles.row}>
              <Button
                title="Editar"
                onPress={() => {
                  setEditingId(item.id);
                  setName(item.name);
                  setAddress(item.address);
                }}
              />
              <Button
                title={item.favorite ? 'Desfavoritar' : 'Favoritar'}
                onPress={() => state.toggleContactFavorite(item.id)}
              />
              <Button
                title="Remover"
                color="#B91C1C"
                onPress={() => Alert.alert(
                  'Remover contato?',
                  `${item.name} será removido somente desta agenda.`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Remover',
                      style: 'destructive',
                      onPress: () => state.removeContact(item.id),
                    },
                  ],
                )}
              />
            </View>
          </View>
        )}
      />

      <View style={styles.form}>
        <Text style={styles.heading}>{editingId ? 'Editar contato' : 'Novo contato'}</Text>
        <TextInput
          placeholder="Nome ou apelido"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Endereço 0x..."
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Button title={editingId ? 'Salvar alterações' : 'Salvar contato'} onPress={save} />
        {editingId && <Button title="Cancelar edição" color="#6B7280" onPress={resetForm} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  methods: { gap: 8 },
  heading: { fontSize: 20, fontWeight: '700' },
  card: { padding: 14, borderRadius: 12, backgroundColor: '#F3F4F6', gap: 10, marginBottom: 10 },
  contact: { gap: 4 },
  name: { fontSize: 17, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  form: { gap: 8, borderTopWidth: 1, borderTopColor: '#D1D5DB', paddingTop: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
});
