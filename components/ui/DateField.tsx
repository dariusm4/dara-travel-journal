import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatDate, toISODate } from '@/utils/date';

import { Button } from './Button';

interface DateFieldProps {
  label: string;
  /** ISO date (YYYY-MM-DD). */
  value: string;
  onChange: (iso: string) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useTheme();
  const [show, setShow] = useState(false);
  const current = value ? new Date(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setShow(false);
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    if (selected) onChange(toISODate(selected));
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setShow(true)}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: c.surface, borderColor: c.border },
          pressed && styles.pressed,
        ]}
      >
        <Text style={{ color: value ? c.text : c.textMuted, fontSize: fontSize.body }}>
          {value ? formatDate(value) : 'Select a date'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={c.textMuted} />
      </Pressable>

      {show && (
        <DateTimePicker
          value={current}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
      {Platform.OS === 'ios' && show && (
        <Button title="Done" variant="ghost" onPress={() => setShow(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.8 },
});
