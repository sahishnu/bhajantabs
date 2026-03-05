import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'bhajantabs-dev-secret';

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<{ id: number; username: string; is_admin: boolean } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const row = db.prepare('SELECT id, username, is_admin FROM users WHERE id = ?').get(payload.userId) as
    | { id: number; username: string; is_admin: number }
    | undefined;

  if (!row) return null;
  return { id: row.id, username: row.username, is_admin: !!row.is_admin };
}
