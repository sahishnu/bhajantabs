'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import SongForm from '../../components/SongForm';
import { Loader2 } from 'lucide-react';

interface Song {
  id: number;
}

export default function SongNewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (!user) return null;

  async function handleSubmit(formData: FormData) {
    setError('');
    try {
      const res = await fetch('/api/songs', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to create song' }));
        throw new Error(body.error || 'Failed to create song');
      }
      const song: Song = await res.json();
      router.push(`/songs/${song.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create song');
      throw err;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink font-display mb-6">Add New Song</h1>
      {error && (
        <div className="mx-auto max-w-2xl mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <SongForm onSubmit={handleSubmit} submitLabel="Create Song" />
    </div>
  );
}
