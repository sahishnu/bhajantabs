import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthUser();
  if (!admin || !admin.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (userId === admin.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const { rows } = await query('SELECT id FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await query('DELETE FROM songs WHERE user_id = $1', [userId]);
  await query('DELETE FROM users WHERE id = $1', [userId]);
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthUser();
  if (!admin || !admin.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  const body = await req.json();

  const { rows: userRows } = await query('SELECT id FROM users WHERE id = $1', [userId]);
  if (userRows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (body.password) {
    const hash = bcrypt.hashSync(body.password, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
  }

  if (typeof body.is_admin === 'boolean') {
    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot change your own admin status' }, { status: 400 });
    }
    await query('UPDATE users SET is_admin = $1 WHERE id = $2', [body.is_admin, userId]);
  }

  const { rows: updated } = await query('SELECT id, username, is_admin, created_at FROM users WHERE id = $1', [userId]);
  return NextResponse.json(updated[0]);
}
