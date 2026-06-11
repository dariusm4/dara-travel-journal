import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db';
import {
  hashPassword,
  issueToken,
  requireAuth,
  verifyPassword,
  type AuthedRequest,
} from '../auth';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: number;
}

function publicUser(row: UserRow) {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name ?? undefined,
  };
}

const credentials = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
  displayName: z.string().min(1).max(100).optional(),
});

const router: Router = Router();

router.post('/register', async (req, res) => {
  const parse = credentials.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input', detail: parse.error.message });
    return;
  }
  const { email, password, displayName } = parse.data;
  const lowered = email.toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(lowered) as
    | { id: string }
    | undefined;
  if (existing) {
    res.status(409).json({ error: 'An account with that email already exists' });
    return;
  }
  const id = randomUUID();
  const hash = await hashPassword(password);
  db.prepare(
    'INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, lowered, hash, displayName ?? null, Date.now());
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  res.json({ token: issueToken(id), user: publicUser(row) });
});

router.post('/login', async (req, res) => {
  const parse = credentials.pick({ email: true, password: true }).safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }
  const { email, password } = parse.data;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as
    | UserRow
    | undefined;
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    res.status(401).json({ error: 'Incorrect email or password' });
    return;
  }
  res.json({ token: issueToken(row.id), user: publicUser(row) });
});

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId!) as
    | UserRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: publicUser(row) });
});

export default router;
