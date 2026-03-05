import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface UserRow {
  id: number;
  username: string;
  is_admin: number;
  created_at: string;
}

export async function GET() {
  const admin = await getAuthUser();
  if (!admin || !admin.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const users = db.prepare('SELECT id, username, is_admin, created_at FROM users ORDER BY created_at DESC').all() as UserRow[];
  return NextResponse.json(users.map(u => ({ ...u, is_admin: !!u.is_admin })));
}
