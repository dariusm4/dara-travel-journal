import { convertAmount, normalizeCurrencyCode } from './currency';

describe('convertAmount', () => {
  it('multiplies by the rate and rounds to 2 decimals', () => {
    expect(convertAmount(100, 0.92)).toBe(92);
    expect(convertAmount(10, 1.2345)).toBe(12.35);
  });

  it('handles zero', () => {
    expect(convertAmount(0, 1.5)).toBe(0);
  });
});

describe('normalizeCurrencyCode', () => {
  it('trims and uppercases', () => {
    expect(normalizeCurrencyCode(' usd ')).toBe('USD');
    expect(normalizeCurrencyCode('eur')).toBe('EUR');
  });
});
