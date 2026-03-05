import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const admin = await getAuthUser();
  if (!admin || !admin.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, password_hash);
  const id = result.lastInsertRowid as number;

  return NextResponse.json({ user: { id, username } }, { status: 201 });
}
