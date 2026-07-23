import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { appendKey, toTransferAmount } from '../../domain/calculator/calculator';
import { useWalletStore } from '../../application/hooks/useWalletStore';
import { ActionButton } from '../components/ActionButton';
import type { RootStackParamList } from '../navigation/AppNavigator';

const KEYS = ['C', '⌫', '÷', '×', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '00', '.',];

export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [expression, setExpression] = useState('');
  const setHomeAmount = useWalletStore((state) => state.setHomeAmount);
  const send = () => {
    try {
      setHomeAmount(toTransferAmount(expression));
      navigation.navigate('Scanner');
    } catch (error) { Alert.alert('Valor inválido', (error as Error).message); }
  };
  const key = (value: string) => {
    try { setExpression((current) => appendKey(current, value)); }
    catch (error) { Alert.alert('Cálculo inválido', (error as Error).message); }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>CARTEIRA POLYGON • CALCULADORA</Text>
      <View style={styles.display}><Text style={styles.expression}>{expression || '0'}</Text></View>
      <View style={styles.actions}>
        <ActionButton label="Enviar" onPress={send} />
        <ActionButton label="Receber" onPress={() => navigation.navigate('Receive')} />
        <ActionButton label="Scan QR" onPress={() => navigation.navigate('Scanner')} />
      </View>
      <View style={styles.keys}>{KEYS.map((item) =>
        <Pressable key={item} onPress={() => key(item)} style={styles.key}>
          <Text style={styles.keyText}>{item}</Text>
        </Pressable>)}
      </View>
      <View style={styles.actions}>
        <ActionButton label="Swap" onPress={() => navigation.navigate('Swap')} />
        <ActionButton label="Configurações" onPress={() => navigation.navigate('Config')} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712', padding: 16 },
  badge: { color: '#9CA3AF', textAlign: 'center', marginBottom: 10, fontSize: 12 },
  display: { backgroundColor: '#111827', borderRadius: 16, padding: 20, minHeight: 100, justifyContent: 'flex-end' },
  expression: { color: '#fff', fontSize: 36, textAlign: 'right' },
  actions: { flexDirection: 'row', marginVertical: 8 },
  keys: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  key: { width: '23%', aspectRatio: 1.05, backgroundColor: '#1F2937', margin: '1%', borderRadius: 14, justifyContent: 'center' },
  keyText: { color: '#fff', fontSize: 24, textAlign: 'center' },
});
