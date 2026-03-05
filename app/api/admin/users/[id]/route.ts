import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
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

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM songs WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
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

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (body.password) {
    const hash = bcrypt.hashSync(body.password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  }

  if (typeof body.is_admin === 'boolean') {
    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot change your own admin status' }, { status: 400 });
    }
    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(body.is_admin ? 1 : 0, userId);
  }

  const updated = db.prepare('SELECT id, username, is_admin, created_at FROM users WHERE id = ?').get(userId) as any;
  return NextResponse.json({ ...updated, is_admin: !!updated.is_admin });
}
