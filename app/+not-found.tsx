import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const c = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen>
        <View style={styles.container}>
          <Text style={[styles.title, { color: c.text }]}>This screen doesn&apos;t exist.</Text>
          <Link href="/" style={styles.link}>
            <Text style={[styles.linkText, { color: c.primary }]}>Go to home screen</Text>
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.subtitle, fontWeight: fontWeight.bold },
  link: { marginTop: spacing.md, paddingVertical: spacing.md },
  linkText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
