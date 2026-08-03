import * as Clipboard from 'expo-clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import { useAuthorizedSigner } from '../../application/hooks/useAuthorizedSigner';
import { formatDindinName } from '../../domain/naming/dindinName';
import { dindinRegistryGateway } from '../../infrastructure/naming/dindinRegistryGateway';
import { requireDeviceAuth } from '../../infrastructure/security/deviceAuth';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function ConfigScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Config'>) {
  const state = useWalletStore();
  const [name, setName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [token, setToken] = useState('');
  const [useAsBrl, setUseAsBrl] = useState(false);
  const [dindinInput, setDindinInput] = useState('');
  const authorizedSigner = useAuthorizedSigner();
  const activeAccount = state.accounts.find((account) => account.id === state.activeAccountId);

  const registerDindin = async () => {
    try {
      if (!activeAccount?.smartAccountAddress) throw new Error('Ative a Smart Account antes de registrar um nome.');
      const formatted = formatDindinName(dindinInput);
      const [fee, pending] = await Promise.all([
        dindinRegistryGateway.quote(),
        dindinRegistryGateway.hasPendingCommit(formatted, activeAccount.smartAccountAddress),
      ]);
      const feeText = `${fee.amount.toString()} unidade(s) atômica(s) de ${fee.token}`;
      Alert.alert(
        pending ? 'Concluir registro .dindin' : 'Iniciar registro .dindin',
        `${formatted}\nDestino: ${activeAccount.smartAccountAddress}\nTaxa vigente: ${feeText}\n\nO nome é público e a taxa não inclui alteração retroativa.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: pending ? 'Autenticar e revelar' : 'Autenticar e criar compromisso', onPress: async () => {
            try {
              const signer = await authorizedSigner(`Autorizar registro de ${formatted}`);
              const registered = pending
                ? await dindinRegistryGateway.complete(formatted, activeAccount.smartAccountAddress!, signer)
                : await dindinRegistryGateway.begin(formatted, activeAccount.smartAccountAddress!, signer);
              if (pending) state.setDindinName(activeAccount.id, registered);
              Alert.alert(pending ? 'Nome registrado' : 'Compromisso confirmado', pending ? `${registered} agora resolve para sua Smart Account.` : 'Aguarde a janela mínima e toque novamente para concluir.');
            } catch (error) { Alert.alert('Registro não concluído', (error as Error).message); }
          } },
        ],
      );
    } catch (error) { Alert.alert('PNS indisponível', (error as Error).message); }
  };

  const importAccount = async () => {
    try { await state.importAccount(name, privateKey.trim()); setPrivateKey(''); }
    catch (e) { Alert.alert('Não foi possível importar', (e as Error).message); }
  };
  const exportKey = (secretRef: string) => Alert.alert(
    'Exportação de alto risco',
    'Quem obtiver esta chave controla os fundos. Não envie por chat, e-mail ou formulário.',
    [{ text: 'Cancelar', style: 'cancel' }, { text: 'Autenticar e copiar', style: 'destructive', onPress: async () => {
      try {
        await requireDeviceAuth('Autorizar exportação da chave privada');
        const key = await secureSecrets.get(secretRef);
        if (!key) throw new Error('Chave não encontrada.');
        await Clipboard.setStringAsync(key);
        Alert.alert('Copiada', 'A chave foi copiada. Limpe a área de transferência após o uso.');
      } catch (e) { Alert.alert('Não autorizado', (e as Error).message); }
    }}],
  );
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Contas ({state.accounts.length}/2)</Text>
      {state.accounts.map((account) => <View key={account.id} style={styles.card}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text>Proprietário da conta (EOA):</Text>
        <Text selectable>{account.address}</Text>
        {account.smartAccountAddress ? (
          <>
            <Text>Endereço para receber e pagar (Smart Account):</Text>
            <Text selectable>{account.smartAccountAddress}</Text>
            <Text style={styles.gasless}>✓ Gás patrocinado via ERC-4337</Text>
            {account.dindinName && <Text style={styles.gasless}>Nome público: {account.dindinName}</Text>}
          </>
        ) : (
          <>
            <Text style={styles.warning}>
              Ative a Smart Account antes de receber fundos. O endereço será
              calculado pelo gateway da plataforma, sem transmitir a chave privada.
            </Text>
            <Button
              title="Ativar custo zero"
              onPress={async () => {
                try {
                  await state.activateGaslessAccount(account.id);
                  Alert.alert(
                    'Smart Account ativada',
                    'Use o novo endereço exibido para receber o Token Oficial.',
                  );
                } catch (error) {
                  Alert.alert('Não foi possível ativar', (error as Error).message);
                }
              }}
            />
          </>
        )}
        <Button title="Exportar chave" onPress={() => exportKey(account.secretRef)} />
        <Button title="Remover conta" color="#B91C1C" onPress={() => state.removeAccount(account.id)} />
      </View>)}
      {state.accounts.length < 2 && <View style={styles.card}>
        <TextInput placeholder="Nome da conta" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Chave privada 0x..." value={privateKey} onChangeText={setPrivateKey} secureTextEntry autoCapitalize="none" style={styles.input} />
        <Button title="Importar conta" onPress={importAccount} />
      </View>}
      <Text style={styles.heading}>Nome .dindin</Text>
      <View style={styles.card}>
        <Text>Escolha um nome público único para facilitar transferências. O endereço resolvido sempre aparece antes do pagamento.</Text>
        <TextInput placeholder="seunome.dindin" value={dindinInput} onChangeText={setDindinInput} autoCapitalize="none" autoCorrect={false} style={styles.input} />
        <Button title="Consultar taxa e registrar" onPress={() => void registerDindin()} disabled={!dindinInput.trim() || !activeAccount?.smartAccountAddress} />
        <Text style={styles.warning}>Registro usa commit–reveal. Não use CPF, telefone ou outro dado sensível no nome público.</Text>
      </View>
      <Text style={styles.heading}>Moeda Base</Text>
      <Button
        title="Parceiros e regulamentação"
        onPress={() => navigation.navigate('RegulatoryPartners')}
      />
      {state.baseToken ? <View style={styles.card}>
        <Text>{state.baseToken.name} ({state.baseToken.symbol})</Text><Text selectable>{state.baseToken.address}</Text>
        <Text>
          Referência: {state.baseToken.referenceCurrency === 'BRL'
            ? 'BRL nominal 1:1'
            : 'unidades do token'}
        </Text>
        <Button title="Remover Moeda Base" color="#B91C1C" onPress={() => Alert.alert('Remover configuração?', 'Para trocar o token, esta configuração deve ser removida.', [
          { text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: state.removeBaseToken },
        ])} />
      </View> : <View style={styles.card}>
        <TextInput placeholder="Contrato ERC-20 0x..." value={token} onChangeText={setToken} autoCapitalize="none" style={styles.input} />
        <View style={styles.switchRow}>
          <Switch value={useAsBrl} onValueChange={setUseAsBrl} />
          <Text style={styles.switchText}>
            Vincular R$ ao token em proporção nominal 1:1. Use somente quando
            houver paridade verificável; caso contrário, será necessário um cotador.
          </Text>
        </View>
        <Button title="Validar e salvar" onPress={async () => {
          try {
            await state.configureBaseToken(token, useAsBrl);
            setToken('');
            setUseAsBrl(false);
          }
          catch (e) { Alert.alert('Token inválido', (e as Error).message); }
        }} />
      </View>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  heading: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  card: { padding: 14, borderRadius: 12, backgroundColor: '#F3F4F6', gap: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchText: { flex: 1, fontSize: 12 },
  accountName: { fontSize: 17, fontWeight: '700' },
  gasless: { color: '#166534', fontWeight: '700' },
  warning: { backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8 },
});
