import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SongForm from '../components/SongForm';
import { apiUpload } from '../utils/api';

export default function SongNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setError('');
    try {
      const res = await apiUpload('/api/songs', formData);
      const song = await res.json();
      navigate(`/songs/${song.id}`);
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
