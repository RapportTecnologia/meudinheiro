import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '../../application/hooks/useWalletStore';

export function ReceiveScreen() {
  const { accounts, activeAccountId } = useWalletStore();
  const account = accounts.find((item) => item.id === activeAccountId);
  return (
    <View style={styles.container}>
      {account ? <><QRCode value={`ethereum:${account.address}@137`} size={240} /><Text selectable style={styles.address}>{account.address}</Text></>
        : <Text>Cadastre e selecione uma conta.</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  address: { textAlign: 'center' },
});
