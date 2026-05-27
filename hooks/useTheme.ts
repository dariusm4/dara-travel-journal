import { useColorScheme } from '@/components/useColorScheme';
import { darkColors, lightColors, type ColorScheme } from '@/constants/theme';

/** Returns the active color palette based on the system color scheme. */
export function useTheme(): ColorScheme {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}
