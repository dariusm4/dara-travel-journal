import { daysBetween, formatDate, formatDateRange } from './date';

describe('formatDate', () => {
  it('formats an ISO date as "D Month YYYY"', () => {
    expect(formatDate('2026-05-27')).toBe('27 May 2026');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatDateRange', () => {
  it('collapses a range within one month', () => {
    expect(formatDateRange('2026-05-27', '2026-05-30')).toBe('27–30 May 2026');
  });

  it('keeps both months when the range spans months in one year', () => {
    expect(formatDateRange('2026-05-30', '2026-06-02')).toBe('30 May – 2 Jun 2026');
  });

  it('shows both years when the range spans a year boundary', () => {
    expect(formatDateRange('2025-12-30', '2026-01-02')).toBe('30 Dec 2025 – 2 Jan 2026');
  });
});

describe('daysBetween', () => {
  it('counts inclusive days', () => {
    expect(daysBetween('2026-05-27', '2026-05-30')).toBe(4);
  });

  it('returns 1 for a same-day trip', () => {
    expect(daysBetween('2026-05-27', '2026-05-27')).toBe(1);
  });
});
