import { apiGet } from './api';

interface RatesResponse {
  rates: Record<string, number>;
}

/** Exchange rates for `base` (e.g. "USD"), proxied by the backend (criterion C). */
export async function getRates(base: string): Promise<Record<string, number>> {
  const data = await apiGet<RatesResponse>(`/api/currency/rates?base=${base}`);
  return data.rates;
}
