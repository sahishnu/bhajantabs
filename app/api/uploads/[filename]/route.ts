import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const uploadsDir = path.join(process.cwd(), 'uploads');

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const filePath = path.join(uploadsDir, filename);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const buffer = readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
