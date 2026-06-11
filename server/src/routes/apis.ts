import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../auth';

interface OpenWeatherResponse {
  main: { temp: number };
  weather: { main: string; icon: string }[];
}

interface UnsplashResponse {
  results: { urls: { regular: string } }[];
}

interface RatesResponse {
  conversion_rates?: Record<string, number>;
  rates?: Record<string, number>;
}

const router: Router = Router();
router.use(requireAuth);

// ---- Weather ----------------------------------------------------------------

const weatherQuery = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

router.get('/weather', async (req, res) => {
  const parse = weatherQuery.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'Weather is not configured on this server.' });
    return;
  }
  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${parse.data.lat}&lon=${parse.data.lng}&units=metric&appid=${key}`;
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Weather lookup failed' });
      return;
    }
    const data = (await upstream.json()) as OpenWeatherResponse;
    res.json({
      temp: data.main.temp,
      condition: data.weather[0]?.main ?? 'Unknown',
      icon: data.weather[0]?.icon,
    });
  } catch {
    res.status(502).json({ error: 'Could not reach the weather service.' });
  }
});

// ---- Unsplash ---------------------------------------------------------------

router.get('/unsplash', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) {
    res.status(400).json({ error: 'q is required' });
    return;
  }
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    res.status(503).json({ error: 'Photo search is not configured on this server.' });
    return;
  }
  try {
    const url =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape&client_id=${key}`;
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Photo search failed' });
      return;
    }
    const data = (await upstream.json()) as UnsplashResponse;
    res.json({ photoUrl: data.results[0]?.urls.regular ?? null });
  } catch {
    res.status(502).json({ error: 'Could not reach the photo service.' });
  }
});

// ---- Currency ---------------------------------------------------------------

router.get('/currency/rates', async (req, res) => {
  const base = typeof req.query.base === 'string' ? req.query.base.toUpperCase() : '';
  if (!/^[A-Z]{3}$/.test(base)) {
    res.status(400).json({ error: 'base must be a 3-letter currency code' });
    return;
  }
  const key = process.env.EXCHANGERATE_API_KEY;
  const url = key
    ? `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`
    : `https://open.er-api.com/v6/latest/${base}`;
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Rates lookup failed' });
      return;
    }
    const data = (await upstream.json()) as RatesResponse;
    const rates = data.conversion_rates ?? data.rates;
    if (!rates || Object.keys(rates).length === 0) {
      res.status(502).json({ error: 'No rates returned' });
      return;
    }
    res.json({ rates });
  } catch {
    res.status(502).json({ error: 'Could not reach the rates service.' });
  }
});

export default router;
