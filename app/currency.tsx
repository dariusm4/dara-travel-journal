import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { getRates } from '@/services/exchange';
import { convertAmount, normalizeCurrencyCode } from '@/utils/currency';

export default function CurrencyScreen() {
  const c = useTheme();
  const router = useRouter();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async () => {
    setError(null);
    setResult(null);
    const base = normalizeCurrencyCode(from);
    const target = normalizeCurrencyCode(to);
    const value = Number.parseFloat(amount);
    if (Number.isNaN(value)) {
      setError('Enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      const rates = await getRates(base);
      const rate = rates[target];
      if (rate == null) {
        setError(`No exchange rate available for ${target}.`);
        return;
      }
      setResult(convertAmount(value, rate));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not convert. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{
          title: 'Currency',
          headerLeft: () => (
            <Pressable hitSlop={8} onPress={() => router.back()}>
              <Text style={{ color: c.primary, fontSize: fontSize.body }}>Close</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="100"
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <TextField
                label="From"
                value={from}
                onChangeText={setFrom}
                autoCapitalize="characters"
                maxLength={3}
                placeholder="USD"
              />
            </View>
            <View style={styles.col}>
              <TextField
                label="To"
                value={to}
                onChangeText={setTo}
                autoCapitalize="characters"
                maxLength={3}
                placeholder="EUR"
              />
            </View>
          </View>

          <Button title="Convert" onPress={convert} loading={loading} />

          {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}

          {result != null ? (
            <View style={[styles.resultCard, { backgroundColor: c.surfaceAlt }]}>
              <Text style={[styles.resultLabel, { color: c.textMuted }]}>
                {amount} {normalizeCurrencyCode(from)} =
              </Text>
              <Text style={[styles.result, { color: c.text }]}>
                {result.toLocaleString()} {normalizeCurrencyCode(to)}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  error: { fontSize: fontSize.body, marginTop: spacing.md },
  resultCard: { borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg },
  resultLabel: { fontSize: fontSize.body },
  result: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, marginTop: spacing.xs },
});
