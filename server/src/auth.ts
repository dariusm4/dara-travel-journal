import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'dev-only-change-me';
const TOKEN_TTL: jwt.SignOptions['expiresIn'] = '30d';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function issueToken(userId: string): string {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): string {
  const decoded = jwt.verify(token, SECRET) as { sub?: unknown };
  if (typeof decoded.sub !== 'string') throw new Error('Invalid token payload');
  return decoded.sub;
}

/** Auth middleware: pulls a Bearer token (or ?token=) and sets req.userId. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const fromHeader = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const fromQuery = typeof req.query.token === 'string' ? req.query.token : null;
  const token = fromHeader ?? fromQuery;
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }
  try {
    req.userId = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid auth token' });
  }
}
