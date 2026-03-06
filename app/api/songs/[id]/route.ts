import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { UPLOADS_DIR } from '@/lib/paths';

interface Song {
  id: number;
  title: string;
  lyrics: string;
  mp3_filename: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { rows } = await query('SELECT * FROM songs WHERE id = $1', [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { rows: songRows } = await query('SELECT * FROM songs WHERE id = $1', [id]);
  if (songRows.length === 0) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }
  const song = songRows[0] as Song;
  if (song.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const title = (formData.get('title') as string | null) ?? song.title;
  const lyrics = (formData.get('lyrics') as string | null) ?? song.lyrics;
  let mp3_filename = song.mp3_filename;

  const mp3 = formData.get('mp3') as File | null;
  if (mp3 && mp3.size > 0) {
    if (mp3.type !== 'audio/mpeg') {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
    }
    if (mp3.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }
    if (song.mp3_filename) {
      const oldPath = path.join(UPLOADS_DIR, song.mp3_filename);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    mp3_filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.mp3`;
    const buffer = Buffer.from(await mp3.arrayBuffer());
    writeFileSync(path.join(UPLOADS_DIR, mp3_filename), buffer);
  }

  const { rows: updated } = await query(
    'UPDATE songs SET title = $1, lyrics = $2, mp3_filename = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    [title, lyrics, mp3_filename, song.id]
  );

  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { rows } = await query('SELECT * FROM songs WHERE id = $1', [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }
  const song = rows[0] as Song;
  if (song.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (song.mp3_filename) {
    const filePath = path.join(UPLOADS_DIR, song.mp3_filename);
    if (existsSync(filePath)) unlinkSync(filePath);
  }

  await query('DELETE FROM songs WHERE id = $1', [song.id]);
  return new NextResponse(null, { status: 204 });
}
