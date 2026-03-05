import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import type { Song } from '../types';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SongView from '../components/SongView';

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    apiFetch(`/api/songs/${id}`)
      .then((res) => res.json())
      .then(setSong)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user, authLoading]);

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

  if (notFound || !song) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-ink-light">Song not found</h2>
        <Link to="/" className="mt-4 inline-block text-sm text-saffron hover:text-saffron-deep hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === song.user_id;

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      await apiFetch(`/api/songs/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch {
      alert('Failed to delete song');
    }
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex gap-3">
          <Link
            to={`/songs/${song.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink-light hover:bg-cream transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit Song
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Song
          </button>
        </div>
      )}

      <SongView song={song} />
    </div>
  );
}
