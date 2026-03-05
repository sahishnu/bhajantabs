import { useState, useRef, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface SongFormProps {
  initialData?: { title: string; lyrics: string; mp3_filename: string | null };
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

export default function SongForm({ initialData, onSubmit, submitLabel }: SongFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [lyrics, setLyrics] = useState(initialData?.lyrics ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!lyrics.trim()) errs.lyrics = 'Lyrics are required';

    const file = fileRef.current?.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.mp3')) {
        errs.mp3 = 'Only .mp3 files are allowed';
      } else if (file.size > 10 * 1024 * 1024) {
        errs.mp3 = 'File must be 10 MB or smaller';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('lyrics', lyrics);
      const file = fileRef.current?.files?.[0];
      if (file) fd.append('mp3', file);
      await onSubmit(fd);
    } catch (err: any) {
      setErrors({ form: err.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {errors.form && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{errors.form}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink-light mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
          className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-saffron focus:ring-1 focus:ring-saffron outline-none disabled:opacity-50"
          placeholder="Song title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="lyrics" className="block text-sm font-medium text-ink-light mb-1">
          Lyrics
        </label>
        <textarea
          id="lyrics"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          disabled={submitting}
          rows={18}
          className="w-full rounded-md border border-border px-3 py-2 text-sm font-mono shadow-sm focus:border-saffron focus:ring-1 focus:ring-saffron outline-none disabled:opacity-50"
          placeholder="Paste lyrics here with inline chords..."
        />
        <p className="mt-1 text-xs text-ink-muted">
          Use <code className="bg-border-light px-1 rounded">[C]</code>,{' '}
          <code className="bg-border-light px-1 rounded">[Am]</code>,{' '}
          <code className="bg-border-light px-1 rounded">[G7]</code> etc. to add inline chords
        </p>
        {errors.lyrics && <p className="mt-1 text-sm text-red-600">{errors.lyrics}</p>}
      </div>

      <div>
        <label htmlFor="mp3" className="block text-sm font-medium text-ink-light mb-1">
          MP3 Audio (optional)
        </label>
        {initialData?.mp3_filename && (
          <p className="mb-1 text-xs text-ink-muted">
            Current file: <span className="font-medium">{initialData.mp3_filename}</span>
          </p>
        )}
        <input
          id="mp3"
          type="file"
          accept=".mp3"
          ref={fileRef}
          disabled={submitting}
          className="w-full text-sm text-ink-light file:mr-3 file:rounded-md file:border-0 file:bg-saffron/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-saffron-deep hover:file:bg-saffron/20 disabled:opacity-50"
        />
        {errors.mp3 && <p className="mt-1 text-sm text-red-600">{errors.mp3}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-md bg-saffron px-5 py-2.5 text-sm font-medium text-white hover:bg-saffron-light transition-colors disabled:opacity-50"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
