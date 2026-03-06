import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { UPLOADS_DIR } from '@/lib/paths';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { rows } = await query('SELECT * FROM songs ORDER BY updated_at DESC');
  return NextResponse.json(rows);
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

  const { rows } = await query(
    'INSERT INTO songs (title, lyrics, mp3_filename, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [title.trim(), lyrics.trim(), mp3_filename, user.id]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
