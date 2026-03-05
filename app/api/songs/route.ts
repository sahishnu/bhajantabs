import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import db from '@/lib/db';
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

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const songs = db.prepare('SELECT * FROM songs ORDER BY updated_at DESC').all() as Song[];
  return NextResponse.json(songs);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const title = formData.get('title') as string | null;
  const lyrics = formData.get('lyrics') as string | null;
  const mp3 = formData.get('mp3') as File | null;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!lyrics || !lyrics.trim()) {
    return NextResponse.json({ error: 'Lyrics are required' }, { status: 400 });
  }

  let mp3_filename: string | null = null;
  if (mp3 && mp3.size > 0) {
    if (mp3.type !== 'audio/mpeg') {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
    }
    if (mp3.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }
    mp3_filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.mp3`;
    const buffer = Buffer.from(await mp3.arrayBuffer());
    writeFileSync(path.join(UPLOADS_DIR, mp3_filename), buffer);
  }

  const result = db
    .prepare('INSERT INTO songs (title, lyrics, mp3_filename, user_id) VALUES (?, ?, ?, ?)')
    .run(title.trim(), lyrics.trim(), mp3_filename, user.id);

  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid) as Song;
  return NextResponse.json(song, { status: 201 });
}
