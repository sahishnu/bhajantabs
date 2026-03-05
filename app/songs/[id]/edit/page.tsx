'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/AuthContext';
import SongForm from '../../../components/SongForm';

interface Song {
  id: number;
  title: string;
  lyrics: string;
  mp3_filename: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export default function SongEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetch(`/api/songs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setSong)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (!user) return null;

  if (notFound || !song) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-ink-light">Song not found</h2>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError('');
    try {
      const res = await fetch(`/api/songs/${id}`, { method: 'PUT', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to update song' }));
        throw new Error(body.error || 'Failed to update song');
      }
      router.push(`/songs/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update song');
      throw err;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink font-display mb-6">Edit Song</h1>
      {error && (
        <div className="mx-auto max-w-2xl mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <SongForm
        initialData={{
          title: song.title,
          lyrics: song.lyrics,
          mp3_filename: song.mp3_filename,
        }}
        onSubmit={handleSubmit}
        submitLabel="Update Song"
      />
    </div>
  );
}
