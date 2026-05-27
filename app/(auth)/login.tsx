import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { signIn } from '@/services/auth';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const c = useTheme();
  const { submit, submitting, authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validate = () => {
    const emailErr = isValidEmail(email) ? null : 'Enter a valid email address.';
    const pwErr = password.length > 0 ? null : 'Enter your password.';
    setEmailError(emailErr);
    setPasswordError(pwErr);
    return !emailErr && !pwErr;
  };

  const onSubmit = () => {
    clearError();
    if (!validate()) return;
    submit(() => signIn(email, password));
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.brand, { color: c.primary }]}>Dara</Text>
            <Text style={[styles.tagline, { color: c.textMuted }]}>
              Your travel journal & companion
            </Text>
          </View>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
          />

          {authError ? (
            <Text style={[styles.formError, { color: c.danger }]}>{authError}</Text>
          ) : null}

          <Button title="Log in" onPress={onSubmit} loading={submitting} style={styles.submit} />

          <View style={styles.footer}>
            <Text style={{ color: c.textMuted }}>New here? </Text>
            <Link href="/register" onPress={clearError}>
              <Text style={[styles.link, { color: c.primary }]}>Create an account</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: 1 },
  tagline: { fontSize: fontSize.body, marginTop: spacing.xs },
  formError: { marginBottom: spacing.md, fontSize: fontSize.body },
  submit: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { fontWeight: fontWeight.semibold },
});
