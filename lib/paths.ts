import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const dataDir = process.env.NODE_ENV === 'production' ? '/data' : process.cwd();

export const DB_PATH = path.join(dataDir, 'bhajantabs.db');

export const UPLOADS_DIR = path.join(dataDir, 'uploads');
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}
