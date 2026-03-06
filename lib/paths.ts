import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const dataDir = process.env.DATA_DIR || process.cwd();

export const UPLOADS_DIR = path.join(dataDir, 'uploads');
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}
