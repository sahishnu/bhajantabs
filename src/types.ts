export interface User {
  id: number;
  username: string;
}

export interface Song {
  id: number;
  title: string;
  lyrics: string;
  mp3_filename: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChordSegment {
  type: 'text' | 'chord';
  value: string;
}
