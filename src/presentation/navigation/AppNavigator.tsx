import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConfigScreen } from '../screens/ConfigScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ReceiveScreen } from '../screens/ReceiveScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { SendReviewScreen } from '../screens/SendReviewScreen';
import { SwapScreen } from '../screens/SwapScreen';
import { CashOperationsScreen } from '../screens/CashOperationsScreen';

export type RootStackParamList = {
  Home: undefined; Scanner: undefined; Receive: undefined; SendReview: undefined;
  Contacts: undefined; Swap: undefined; Config: undefined;
  CashOperations: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#111827' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Meu Dinheiro' }} />
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Ler QR Code' }} />
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Agenda' }} />
      <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receber' }} />
      <Stack.Screen name="SendReview" component={SendReviewScreen} options={{ title: 'Revisar pagamento' }} />
      <Stack.Screen name="Swap" component={SwapScreen} options={{ title: 'Trocar ativos' }} />
      <Stack.Screen name="CashOperations" component={CashOperationsScreen} options={{ title: 'Pix: carga e resgate' }} />
      <Stack.Screen name="Config" component={ConfigScreen} options={{ title: 'Configurações' }} />
    </Stack.Navigator>
  );
}
