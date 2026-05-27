import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { LocationField } from '@/components/ui/LocationField';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fontSize, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { createEntry, updateEntry } from '@/services/firestore';
import { deleteEntryPhoto, uploadEntryPhoto } from '@/services/storage';
import { getCurrentWeather } from '@/services/weather';
import { useAppSelector } from '@/store/hooks';
import type { Entry, GeoLocation, Weather } from '@/types';
import { todayISO } from '@/utils/date';
import { haptics } from '@/utils/haptics';
import { isNonEmpty, withinMaxLength } from '@/utils/validation';

const MAX_TITLE = 80;
const MAX_NOTE = 2000;

export default function EntryFormScreen() {
  const { id, tripId } = useLocalSearchParams<{ id?: string; tripId: string }>();
  const editing = Boolean(id);
  const c = useTheme();
  const router = useRouter();
  const uid = useAppSelector((s) => s.auth.user?.uid);
  const existing = useAppSelector((s) =>
    id ? s.entries.items.find((e) => e.id === id) : undefined,
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [entryDate, setEntryDate] = useState(existing?.entryDate ?? todayISO());
  const [photoUri, setPhotoUri] = useState<string | null>(existing?.photoUrl ?? null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [location, setLocation] = useState<GeoLocation | null>(existing?.location ?? null);
  const [weather, setWeather] = useState<Weather | null>(existing?.weather ?? null);
  const [errors, setErrors] = useState<{ title?: string; note?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onPhotoChange = (uri: string | null) => {
    setPhotoUri(uri);
    setPhotoChanged(true);
  };

  // Auto-fetch current weather for the captured location (best-effort).
  const onLocationChange = async (geo: GeoLocation | null) => {
    setLocation(geo);
    setWeather(null);
    if (geo) {
      try {
        setWeather(await getCurrentWeather(geo.lat, geo.lng));
      } catch {
        // Weather is optional; ignore failures (missing key, offline, etc.).
      }
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!isNonEmpty(title)) next.title = 'Give this entry a title.';
    else if (!withinMaxLength(title, MAX_TITLE))
      next.title = `Keep it under ${MAX_TITLE} characters.`;
    if (!withinMaxLength(note, MAX_NOTE))
      next.note = `Notes are limited to ${MAX_NOTE} characters.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    setFormError(null);
    if (!validate() || !uid || !tripId) return;
    setSubmitting(true);
    try {
      if (editing && id) {
        const patch: Partial<Entry> = {
          title: title.trim(),
          note: note.trim(),
          entryDate,
          location: location ?? undefined,
          weather: weather ?? undefined,
        };
        if (photoChanged) {
          if (photoUri) {
            patch.photoUrl = await uploadEntryPhoto(uid, tripId, id, photoUri);
          } else {
            patch.photoUrl = '';
            void deleteEntryPhoto(uid, tripId, id);
          }
        }
        await updateEntry(uid, tripId, id, patch);
      } else {
        const entryId = await createEntry(uid, tripId, {
          tripId,
          title: title.trim(),
          note: note.trim(),
          entryDate,
          location: location ?? undefined,
          weather: weather ?? undefined,
          createdAt: Date.now(),
        });
        if (photoUri) {
          const url = await uploadEntryPhoto(uid, tripId, entryId, photoUri);
          await updateEntry(uid, tripId, entryId, { photoUrl: url });
        }
      }
      haptics.success();
      router.back();
    } catch {
      setFormError('Could not save. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <Stack.Screen
        options={{
          title: editing ? 'Edit entry' : 'New entry',
          headerLeft: () => (
            <Pressable hitSlop={8} onPress={() => router.back()}>
              <Text style={{ color: c.primary, fontSize: fontSize.body }}>Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PhotoPicker label="Photo" uri={photoUri} onChange={onPhotoChange} />
          <TextField
            label="Title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            placeholder="A morning by the sea"
            maxLength={MAX_TITLE}
          />
          <DateField label="Date" value={entryDate} onChange={setEntryDate} />
          <LocationField value={location} onChange={onLocationChange} />
          {weather ? (
            <Text style={[styles.weather, { color: c.textMuted }]}>
              Weather: {Math.round(weather.temp)}° · {weather.condition}
            </Text>
          ) : null}
          <TextField
            label="Note"
            value={note}
            onChangeText={setNote}
            error={errors.note}
            placeholder="What happened, how it felt..."
            multiline
            numberOfLines={6}
            style={styles.noteInput}
            maxLength={MAX_NOTE}
          />
          {formError ? <Text style={[styles.error, { color: c.danger }]}>{formError}</Text> : null}

          <Button
            title={editing ? 'Save changes' : 'Add entry'}
            onPress={onSave}
            loading={submitting}
            style={styles.save}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg },
  noteInput: { minHeight: 120, paddingTop: spacing.sm, textAlignVertical: 'top' },
  weather: { fontSize: fontSize.caption, marginTop: -spacing.sm, marginBottom: spacing.md },
  error: { fontSize: fontSize.body, marginBottom: spacing.sm },
  save: { marginTop: spacing.md },
});
