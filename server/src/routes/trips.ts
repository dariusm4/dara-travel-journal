import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, type AuthedRequest } from '../auth';
import { db } from '../db';

interface TripRow {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_photo: string | null;
  story: string | null;
  created_at: number;
}

function toTrip(row: TripRow) {
  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    coverPhotoUrl: row.cover_photo ? `/photos/${row.cover_photo}` : undefined,
    story: row.story ?? undefined,
    createdAt: row.created_at,
  };
}

const PHOTO_DIR = resolve(__dirname, '..', '..', 'data', 'photos');

const tripCreate = z.object({
  title: z.string().min(1).max(80),
  destination: z.string().min(1).max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  story: z.string().max(4000).optional(),
});

const tripUpdate = z.object({
  title: z.string().min(1).max(80).optional(),
  destination: z.string().min(1).max(80).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  story: z.string().max(4000).optional(),
  // App can clear the remote-fetched Unsplash cover by setting '' here.
  coverPhotoUrl: z.string().optional(),
});

const router: Router = Router();
router.use(requireAuth);

router.get('/', (req: AuthedRequest, res) => {
  const rows = db
    .prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId!) as TripRow[];
  res.json({ trips: rows.map(toTrip) });
});

router.post('/', (req: AuthedRequest, res) => {
  const parse = tripCreate.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input', detail: parse.error.message });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO trips (id, user_id, title, destination, start_date, end_date, story, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    req.userId!,
    parse.data.title,
    parse.data.destination,
    parse.data.startDate,
    parse.data.endDate,
    parse.data.story ?? null,
    Date.now(),
  );
  res.json({ id });
});

router.patch('/:id', (req: AuthedRequest, res) => {
  const parse = tripUpdate.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input', detail: parse.error.message });
    return;
  }
  const owned = db
    .prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!);
  if (!owned) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = {
    title: 'title',
    destination: 'destination',
    startDate: 'start_date',
    endDate: 'end_date',
    story: 'story',
  };
  for (const [key, column] of Object.entries(map)) {
    const value = (parse.data as Record<string, unknown>)[key];
    if (value !== undefined) {
      fields.push(`${column} = ?`);
      values.push(value);
    }
  }
  // coverPhotoUrl is handled specially: '' clears, http URL stored as-is,
  // /photos/<file> path gets the filename extracted.
  if (parse.data.coverPhotoUrl !== undefined) {
    const url = parse.data.coverPhotoUrl;
    let coverPhoto: string | null;
    if (url === '') coverPhoto = null;
    else if (url.startsWith('/photos/')) coverPhoto = url.slice('/photos/'.length);
    else coverPhoto = url; // remote URL (e.g. Unsplash)
    fields.push('cover_photo = ?');
    values.push(coverPhoto);
  }

  if (fields.length === 0) {
    res.json({ ok: true });
    return;
  }
  values.push(req.params.id, req.userId);
  db.prepare(`UPDATE trips SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const trip = db
    .prepare('SELECT cover_photo FROM trips WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!) as { cover_photo: string | null } | undefined;
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }
  // Gather entry photo filenames before FK cascade wipes the rows.
  const entryPhotos = db
    .prepare('SELECT photo FROM entries WHERE trip_id = ? AND photo IS NOT NULL')
    .all(req.params.id) as { photo: string }[];
  db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);

  const filesToRemove = [
    ...(trip.cover_photo && !trip.cover_photo.startsWith('http') ? [trip.cover_photo] : []),
    ...entryPhotos.map((e) => e.photo).filter((p) => p && !p.startsWith('http')),
  ];
  for (const file of filesToRemove) {
    await unlink(resolve(PHOTO_DIR, file)).catch(() => {});
  }
  res.json({ ok: true });
});

export default router;
