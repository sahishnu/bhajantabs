import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

let initPromise: Promise<void> | null = null;

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      lyrics TEXT NOT NULL,
      mp3_filename TEXT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminUsername && adminPassword) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, TRUE) ON CONFLICT (username) DO NOTHING',
      [adminUsername, hash]
    );
  }
}

export async function query(text: string, params?: unknown[]) {
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
  return pool.query(text, params);
}
