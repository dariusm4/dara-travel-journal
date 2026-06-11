import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Router } from 'express';
import multer from 'multer';

import { requireAuth, type AuthedRequest } from '../auth';
import { db } from '../db';

const PHOTO_DIR = resolve(__dirname, '..', '..', 'data', 'photos');
mkdirSync(PHOTO_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PHOTO_DIR),
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.jpg`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const FILENAME_RE = /^[A-Za-z0-9_-]+\.jpg$/;

const router: Router = Router();

/** Upload a trip cover photo (replaces the previous one if any). */
router.post(
  '/trips/:tripId/cover',
  requireAuth,
  upload.single('file'),
  async (req: AuthedRequest, res) => {
    const { tripId } = req.params;
    if (!req.file) {
      res.status(400).json({ error: 'Missing file' });
      return;
    }
    const owned = db
      .prepare('SELECT cover_photo FROM trips WHERE id = ? AND user_id = ?')
      .get(tripId, req.userId!) as { cover_photo: string | null } | undefined;
    if (!owned) {
      await unlink(req.file.path).catch(() => {});
      res.status(404).json({ error: 'Trip not found' });
      return;
    }
    db.prepare('UPDATE trips SET cover_photo = ? WHERE id = ? AND user_id = ?').run(
      req.file.filename,
      tripId,
      req.userId!,
    );
    if (owned.cover_photo && !owned.cover_photo.startsWith('http')) {
      await unlink(resolve(PHOTO_DIR, owned.cover_photo)).catch(() => {});
    }
    res.json({ photoUrl: `/photos/${req.file.filename}` });
  },
);

/** Upload a photo for an entry. */
router.post(
  '/trips/:tripId/entries/:entryId/photo',
  requireAuth,
  upload.single('file'),
  async (req: AuthedRequest, res) => {
    const { tripId, entryId } = req.params;
    if (!req.file) {
      res.status(400).json({ error: 'Missing file' });
      return;
    }
    const owned = db
      .prepare(
        'SELECT photo FROM entries WHERE id = ? AND trip_id = ? AND user_id = ?',
      )
      .get(entryId, tripId, req.userId!) as { photo: string | null } | undefined;
    if (!owned) {
      await unlink(req.file.path).catch(() => {});
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    db.prepare('UPDATE entries SET photo = ? WHERE id = ? AND user_id = ?').run(
      req.file.filename,
      entryId,
      req.userId!,
    );
    if (owned.photo && !owned.photo.startsWith('http')) {
      await unlink(resolve(PHOTO_DIR, owned.photo)).catch(() => {});
    }
    res.json({ photoUrl: `/photos/${req.file.filename}` });
  },
);

/** Serve a stored photo; only its owner can fetch it. */
router.get('/photos/:filename', requireAuth, (req: AuthedRequest, res) => {
  const filename = String(req.params.filename);
  if (!FILENAME_RE.test(filename)) {
    res.status(400).json({ error: 'Bad filename' });
    return;
  }
  const owned =
    db.prepare('SELECT 1 FROM trips WHERE cover_photo = ? AND user_id = ?').get(filename, req.userId!) ||
    db.prepare('SELECT 1 FROM entries WHERE photo = ? AND user_id = ?').get(filename, req.userId!);
  if (!owned) {
    res.status(404).end();
    return;
  }
  res.sendFile(resolve(PHOTO_DIR, filename));
});

export default router;
