import { Pressable, StyleSheet, Text } from 'react-native';

export function ActionButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable accessibilityRole="button" style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { backgroundColor: '#F97316', borderRadius: 12, padding: 12, flex: 1, margin: 4 },
  text: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
