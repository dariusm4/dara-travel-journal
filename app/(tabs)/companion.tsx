import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { fontSize, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { chatWithCompanion, type ChatMessage } from '@/services/ai';
import { haptics } from '@/utils/haptics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function CompanionScreen() {
  const c = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    haptics.light();
    setError(null);
    const next = [...messages, { id: `u${Date.now()}`, role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const history: ChatMessage[] = next.map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatWithCompanion(history);
      setMessages((cur) => [...cur, { id: `a${Date.now()}`, role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.role === 'user';
    return (
      <View
        style={[
          styles.bubble,
          mine
            ? [styles.mine, { backgroundColor: c.primary }]
            : [styles.theirs, { backgroundColor: c.surfaceAlt }],
        ]}
      >
        <Text style={{ color: mine ? c.onPrimary : c.text, fontSize: fontSize.body }}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <Screen edges={[]} padded={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon="sparkles-outline"
            title="Ask your travel companion"
            message="Try: “3 days in Lisbon, what should I not miss?”"
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {loading ? <ActivityIndicator color={c.primary} style={styles.typing} /> : null}
        {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}

        <View
          style={[styles.inputBar, { borderTopColor: c.border, backgroundColor: c.background }]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your next trip..."
            placeholderTextColor={c.textMuted}
            style={[
              styles.input,
              { backgroundColor: c.surface, color: c.text, borderColor: c.border },
            ]}
            multiline
            onSubmitEditing={send}
          />
          <Pressable
            accessibilityRole="button"
            onPress={send}
            disabled={loading || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: c.primary },
              (loading || !input.trim()) && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-up" size={22} color={c.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm },
  bubble: { maxWidth: '85%', borderRadius: radius.lg, padding: spacing.md },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: radius.sm },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: radius.sm },
  typing: { alignSelf: 'flex-start', marginLeft: spacing.lg, marginBottom: spacing.sm },
  error: { fontSize: fontSize.caption, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: fontSize.body,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
