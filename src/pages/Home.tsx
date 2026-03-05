import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Music } from 'lucide-react';
import type { Song } from '../types';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    apiFetch('/api/songs')
      .then((res) => res.json())
      .then(setSongs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>;
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-ink-muted">
        <Music className="h-16 w-16 mb-4 text-border" />
        <p className="text-lg font-medium">No songs yet</p>
        <p className="text-sm">Be the first to add a bhajan!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-ink mb-6">✦ All Songs</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((song) => {
          const firstLine = song.lyrics.split('\n')[0]?.replace(/\[[^\]]*\]/g, '').trim() || '';
          return (
            <Link
              key={song.id}
              to={`/songs/${song.id}`}
              className="block rounded-lg border border-border border-l-3 border-l-saffron/30 bg-ivory p-5 shadow-sm hover:shadow-md hover:border-saffron/40 transition-all"
            >
              <h2 className="font-semibold text-ink truncate">{song.title}</h2>
              <p className="mt-1 text-sm text-ink-light truncate">{firstLine}</p>
              <p className="mt-3 text-xs text-ink-muted">
                {new Date(song.created_at).toLocaleDateString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
