import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { signUp } from '@/services/auth';
import { isValidEmail, validatePassword } from '@/utils/validation';

export default function RegisterScreen() {
  const c = useTheme();
  const { submit, submitting, authError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const validate = () => {
    const emailErr = isValidEmail(email) ? null : 'Enter a valid email address.';
    const pwErr = validatePassword(password);
    const confirmErr = password === confirm ? null : 'Passwords do not match.';
    setEmailError(emailErr);
    setPasswordError(pwErr);
    setConfirmError(confirmErr);
    return !emailErr && !pwErr && !confirmErr;
  };

  const onSubmit = () => {
    clearError();
    if (!validate()) return;
    submit(() => signUp(email, password, name));
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
            <Text style={[styles.title, { color: c.text }]}>Create your account</Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              Start logging your travels with Dara.
            </Text>
          </View>

          <TextField
            label="Name (optional)"
            value={name}
            onChangeText={setName}
            placeholder="Alex Traveler"
            autoCapitalize="words"
          />
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
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />
          <TextField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            error={confirmError}
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
          />

          {authError ? (
            <Text style={[styles.formError, { color: c.danger }]}>{authError}</Text>
          ) : null}

          <Button title="Sign up" onPress={onSubmit} loading={submitting} style={styles.submit} />

          <View style={styles.footer}>
            <Text style={{ color: c.textMuted }}>Already have an account? </Text>
            <Link href="/login" onPress={clearError}>
              <Text style={[styles.link, { color: c.primary }]}>Log in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.lg },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.body, marginTop: spacing.xs },
  formError: { marginBottom: spacing.md, fontSize: fontSize.body },
  submit: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { fontWeight: fontWeight.semibold },
});
