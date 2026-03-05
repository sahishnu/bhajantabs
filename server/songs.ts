import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import db from './db.js';
import { requireAuth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

interface Song {
  id: number;
  title: string;
  lyrics: string;
  mp3_filename: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'audio/mpeg') {
      cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'Only MP3 files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const songsRouter = Router();

songsRouter.get('/api/songs', requireAuth, (_req: Request, res: Response) => {
  const songs = db.prepare('SELECT * FROM songs ORDER BY updated_at DESC').all() as Song[];
  res.json(songs);
});

songsRouter.get('/api/songs/:id', requireAuth, (req: Request, res: Response) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song | undefined;
  if (!song) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }
  res.json(song);
});

songsRouter.post('/api/songs', requireAuth, upload.single('mp3'), (req: Request, res: Response) => {
  const { title, lyrics } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  if (!lyrics || !lyrics.trim()) {
    res.status(400).json({ error: 'Lyrics are required' });
    return;
  }

  const mp3_filename = req.file ? req.file.filename : null;
  const result = db
    .prepare('INSERT INTO songs (title, lyrics, mp3_filename, user_id) VALUES (?, ?, ?, ?)')
    .run(title.trim(), lyrics.trim(), mp3_filename, req.userId!);

  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid) as Song;
  res.status(201).json(song);
});

songsRouter.put('/api/songs/:id', requireAuth, upload.single('mp3'), (req: Request, res: Response) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song | undefined;
  if (!song) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }
  if (song.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const title = req.body.title ?? song.title;
  const lyrics = req.body.lyrics ?? song.lyrics;
  let mp3_filename = song.mp3_filename;

  if (req.file) {
    if (song.mp3_filename) {
      const oldPath = path.join(uploadsDir, song.mp3_filename);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    mp3_filename = req.file.filename;
  }

  db.prepare('UPDATE songs SET title = ?, lyrics = ?, mp3_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    title,
    lyrics,
    mp3_filename,
    song.id,
  );

  const updated = db.prepare('SELECT * FROM songs WHERE id = ?').get(song.id) as Song;
  res.json(updated);
});

songsRouter.delete('/api/songs/:id', requireAuth, (req: Request, res: Response) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song | undefined;
  if (!song) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }
  if (song.user_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (song.mp3_filename) {
    const filePath = path.join(uploadsDir, song.mp3_filename);
    if (existsSync(filePath)) unlinkSync(filePath);
  }

  db.prepare('DELETE FROM songs WHERE id = ?').run(song.id);
  res.status(204).send();
});

songsRouter.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({ error: err.message || 'Only MP3 files are allowed' });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  _next(err);
});
