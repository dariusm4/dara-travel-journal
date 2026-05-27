/** Convert an amount using a direct rate, rounded to 2 decimals. */
export function convertAmount(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

/** Normalize user input into a 3-letter uppercase currency code (e.g. "usd" -> "USD"). */
export function normalizeCurrencyCode(input: string): string {
  return input.trim().toUpperCase();
}
