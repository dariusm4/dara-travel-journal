import { config } from './config';
import { ApiError, fetchJson } from './http';

interface RatesResponse {
  conversion_rates?: Record<string, number>; // exchangerate-api.com (keyed)
  rates?: Record<string, number>; // open.er-api.com (keyless fallback)
}

/**
 * Latest exchange rates for a base currency. Uses exchangerate-api.com when a
 * key is configured, otherwise the keyless open.er-api.com endpoint.
 */
export async function getRates(base: string): Promise<Record<string, number>> {
  const key = config.exchangeRateApiKey;
  const url = key
    ? `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`
    : `https://open.er-api.com/v6/latest/${base}`;
  const data = await fetchJson<RatesResponse>(url);
  const rates = data.conversion_rates ?? data.rates;
  if (!rates || Object.keys(rates).length === 0) {
    throw new ApiError('Could not load exchange rates for that currency.');
  }
  return rates;
}
