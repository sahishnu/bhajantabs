import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Song } from '../types';
import SongForm from '../components/SongForm';
import { apiFetch, apiUpload } from '../utils/api';

export default function SongEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/songs/${id}`)
      .then((res) => res.json())
      .then(setSong)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

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
      await apiUpload(`/api/songs/${id}`, formData, 'PUT');
      navigate(`/songs/${id}`);
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
