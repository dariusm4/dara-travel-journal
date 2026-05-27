/**
 * Date helpers. All formatting uses UTC so output is deterministic regardless
 * of the device timezone (important for date-only ISO strings and for tests).
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

const MS_PER_DAY = 86_400_000;

function parse(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2026-05-27" -> "27 May 2026". Returns '' for invalid input. */
export function formatDate(iso: string): string {
  const d = parse(iso);
  if (!d) return '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Compact human range, collapsing shared month/year. */
export function formatDateRange(startIso: string, endIso: string): string {
  const s = parse(startIso);
  const e = parse(endIso);
  if (!s || !e) return '';

  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();

  if (sameMonth) {
    return `${s.getUTCDate()}–${e.getUTCDate()} ${MONTHS_SHORT[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
  }
  if (sameYear) {
    return `${s.getUTCDate()} ${MONTHS_SHORT[s.getUTCMonth()]} – ${e.getUTCDate()} ${MONTHS_SHORT[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
  }
  return `${formatShort(s)} – ${formatShort(e)}`;
}

function formatShort(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Inclusive number of days between two dates (min 1 for a same-day trip). */
export function daysBetween(startIso: string, endIso: string): number {
  const s = parse(startIso);
  const e = parse(endIso);
  if (!s || !e) return 0;
  const diff = Math.round((e.getTime() - s.getTime()) / MS_PER_DAY);
  return Math.max(1, diff + 1);
}
