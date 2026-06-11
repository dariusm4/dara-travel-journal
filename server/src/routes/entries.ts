import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthedRequest } from '../auth';
import { db } from '../db';

interface EntryRow {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  note: string | null;
  photo: string | null;
  location_json: string | null;
  weather_json: string | null;
  entry_date: string;
  created_at: number;
}

function safeJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function toEntry(row: EntryRow) {
  return {
    id: row.id,
    tripId: row.trip_id,
    title: row.title,
    note: row.note ?? '',
    photoUrl: row.photo ? `/photos/${row.photo}` : undefined,
    location: safeJson<unknown>(row.location_json),
    weather: safeJson<unknown>(row.weather_json),
    entryDate: row.entry_date,
    createdAt: row.created_at,
  };
}

const PHOTO_DIR = resolve(__dirname, '..', '..', 'data', 'photos');

const location = z.object({
  lat: z.number(),
  lng: z.number(),
  placeName: z.string().optional(),
  country: z.string().optional(),
});

const weather = z.object({
  temp: z.number(),
  condition: z.string(),
  icon: z.string().optional(),
});

const entryCreate = z.object({
  title: z.string().min(1).max(80),
  note: z.string().max(2000).optional(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: location.optional(),
  weather: weather.optional(),
});

const entryUpdate = z.object({
  title: z.string().min(1).max(80).optional(),
  note: z.string().max(2000).optional(),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  location: location.optional(),
  weather: weather.optional(),
  photoUrl: z.string().optional(),
});

// Nested under /trips/:tripId/entries — mergeParams gives access to :tripId.
const router: Router = Router({ mergeParams: true });
router.use(requireAuth);

function tripOwned(tripId: string, userId: string): boolean {
  return !!db.prepare('SELECT 1 FROM trips WHERE id = ? AND user_id = ?').get(tripId, userId);
}

router.get('/', (req: AuthedRequest, res) => {
  const { tripId } = req.params as { tripId: string };
  if (!tripOwned(tripId, req.userId!)) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }
  const rows = db
    .prepare(
      'SELECT * FROM entries WHERE trip_id = ? AND user_id = ? ORDER BY entry_date DESC, created_at DESC',
    )
    .all(tripId, req.userId!) as EntryRow[];
  res.json({ entries: rows.map(toEntry) });
});

router.post('/', (req: AuthedRequest, res) => {
  const { tripId } = req.params as { tripId: string };
  if (!tripOwned(tripId, req.userId!)) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }
  const parse = entryCreate.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input', detail: parse.error.message });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO entries
       (id, trip_id, user_id, title, note, location_json, weather_json, entry_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    tripId,
    req.userId!,
    parse.data.title,
    parse.data.note ?? null,
    parse.data.location ? JSON.stringify(parse.data.location) : null,
    parse.data.weather ? JSON.stringify(parse.data.weather) : null,
    parse.data.entryDate,
    Date.now(),
  );
  res.json({ id });
});

router.patch('/:entryId', (req: AuthedRequest, res) => {
  const { tripId, entryId } = req.params as { tripId: string; entryId: string };
  const parse = entryUpdate.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input', detail: parse.error.message });
    return;
  }
  const owned = db
    .prepare('SELECT id FROM entries WHERE id = ? AND trip_id = ? AND user_id = ?')
    .get(entryId, tripId, req.userId!);
  if (!owned) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  if (parse.data.title !== undefined) {
    fields.push('title = ?');
    values.push(parse.data.title);
  }
  if (parse.data.note !== undefined) {
    fields.push('note = ?');
    values.push(parse.data.note);
  }
  if (parse.data.entryDate !== undefined) {
    fields.push('entry_date = ?');
    values.push(parse.data.entryDate);
  }
  if (parse.data.location !== undefined) {
    fields.push('location_json = ?');
    values.push(JSON.stringify(parse.data.location));
  }
  if (parse.data.weather !== undefined) {
    fields.push('weather_json = ?');
    values.push(JSON.stringify(parse.data.weather));
  }
  if (parse.data.photoUrl !== undefined) {
    let photo: string | null;
    if (parse.data.photoUrl === '') photo = null;
    else if (parse.data.photoUrl.startsWith('/photos/'))
      photo = parse.data.photoUrl.slice('/photos/'.length);
    else photo = parse.data.photoUrl;
    fields.push('photo = ?');
    values.push(photo);
  }

  if (fields.length === 0) {
    res.json({ ok: true });
    return;
  }
  values.push(entryId, req.userId);
  db.prepare(`UPDATE entries SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/:entryId', async (req: AuthedRequest, res) => {
  const { tripId, entryId } = req.params as { tripId: string; entryId: string };
  const row = db
    .prepare('SELECT photo FROM entries WHERE id = ? AND trip_id = ? AND user_id = ?')
    .get(entryId, tripId, req.userId!) as { photo: string | null } | undefined;
  if (!row) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  db.prepare('DELETE FROM entries WHERE id = ? AND user_id = ?').run(entryId, req.userId!);
  if (row.photo && !row.photo.startsWith('http')) {
    await unlink(resolve(PHOTO_DIR, row.photo)).catch(() => {});
  }
  res.json({ ok: true });
});

export default router;
