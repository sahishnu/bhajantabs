import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const admin = await getAuthUser();
  if (!admin || !admin.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { rows } = await query('SELECT id, username, is_admin, created_at FROM users ORDER BY created_at DESC');
  return NextResponse.json(rows);
}
