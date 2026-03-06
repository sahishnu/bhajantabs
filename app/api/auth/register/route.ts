import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
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

  const { rows: existing } = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const { rows } = await query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id', [username, password_hash]);
  const id = rows[0].id;

  return NextResponse.json({ user: { id, username } }, { status: 201 });
}
