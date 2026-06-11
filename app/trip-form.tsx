import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fontSize, spacing } from '@/constants/theme';
import { useReloadJournal } from '@/hooks/useReloadJournal';
import { useTheme } from '@/hooks/useTheme';
import { createTrip, updateTrip } from '@/services/journal';
import { saveTripCover } from '@/services/storage';
import { findDestinationPhoto } from '@/services/unsplash';
import { useAppSelector } from '@/store/hooks';
import type { Trip } from '@/types';
import { todayISO } from '@/utils/date';
import { haptics } from '@/utils/haptics';
import { isNonEmpty, withinMaxLength } from '@/utils/validation';

/** Stores a cover: keep remote (Unsplash) URLs as-is; upload local files. */
async function resolveCoverUrl(tripId: string, uri: string): Promise<string> {
  return uri.startsWith('http') ? uri : saveTripCover('', tripId, uri);
}

const MAX_TITLE = 80;

export default function TripFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);
  const c = useTheme();
  const router = useRouter();
  const existing = useAppSelector((s) =>
    id ? (s.trips.items.find((t) => t.id === id) ?? null) : null,
  );
  const { reloadTrips } = useReloadJournal();

  const [title, setTitle] = useState(existing?.title ?? '');
  const [destination, setDestination] = useState(existing?.destination ?? '');
  const [startDate, setStartDate] = useState(existing?.startDate ?? todayISO());
  const [endDate, setEndDate] = useState(existing?.endDate ?? todayISO());
  const [coverUri, setCoverUri] = useState<string | null>(existing?.coverPhotoUrl ?? null);
  const [coverChanged, setCoverChanged] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; destination?: string; dates?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const suggestCover = async () => {
    if (!isNonEmpty(destination)) {
      Alert.alert('Add a destination first', 'Enter where you went to find a matching photo.');
      return;
    }
    setSuggesting(true);
    try {
      const url = await findDestinationPhoto(destination.trim());
      if (url) {
        setCoverUri(url);
        setCoverChanged(true);
      } else {
        Alert.alert('No photo found', `Couldn't find a photo for "${destination.trim()}".`);
      }
    } catch {
      Alert.alert('Could not load photo', 'Please check your connection and try again.');
    } finally {
      setSuggesting(false);
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!isNonEmpty(title)) next.title = 'Give your trip a title.';
    else if (!withinMaxLength(title, MAX_TITLE))
      next.title = `Keep it under ${MAX_TITLE} characters.`;
    if (!isNonEmpty(destination)) next.destination = 'Where did you go?';
    if (endDate < startDate) next.dates = 'End date cannot be before the start date.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing && id) {
        const patch: Partial<Trip> = {
          title: title.trim(),
          destination: destination.trim(),
          startDate,
          endDate,
        };
        if (coverChanged) {
          patch.coverPhotoUrl = coverUri ? await resolveCoverUrl(id, coverUri) : '';
        }
        await updateTrip(id, patch);
      } else {
        const tripId = await createTrip({
          title: title.trim(),
          destination: destination.trim(),
          startDate,
          endDate,
        });
        if (coverUri) {
          await updateTrip(tripId, {
            coverPhotoUrl: await resolveCoverUrl(tripId, coverUri),
          });
        }
      }
      await reloadTrips();
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
          title: editing ? 'Edit trip' : 'New trip',
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
          <PhotoPicker
            label="Cover photo"
            uri={coverUri}
            onChange={(uri) => {
              setCoverUri(uri);
              setCoverChanged(true);
            }}
            height={160}
          />
          <Button
            title="Suggest a cover from Unsplash"
            variant="ghost"
            onPress={suggestCover}
            loading={suggesting}
            style={styles.suggest}
          />
          <TextField
            label="Title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            placeholder="Summer in Portugal"
            maxLength={MAX_TITLE}
          />
          <TextField
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            error={errors.destination}
            placeholder="Lisbon, Portugal"
          />
          <DateField label="Start date" value={startDate} onChange={setStartDate} />
          <DateField label="End date" value={endDate} onChange={setEndDate} />
          {errors.dates ? (
            <Text style={[styles.error, { color: c.danger }]}>{errors.dates}</Text>
          ) : null}
          {formError ? <Text style={[styles.error, { color: c.danger }]}>{formError}</Text> : null}

          <Button
            title={editing ? 'Save changes' : 'Create trip'}
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
  suggest: { minHeight: 40, marginBottom: spacing.md },
  error: { fontSize: fontSize.body, marginBottom: spacing.sm },
  save: { marginTop: spacing.md },
});
