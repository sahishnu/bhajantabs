'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { parseLyrics, transposeLyrics } from '@/lib/chords';
import ChordDiagram from './ChordDiagram';

interface Song {
  id: number;
  title: string;
  lyrics: string;
  mp3_filename: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface SongViewProps {
  song: Song;
}

export default function SongView({ song }: SongViewProps) {
  const [semitones, setSemitones] = useState(0);

  const transposedText = transposeLyrics(song.lyrics, semitones);
  const { lines } = parseLyrics(transposedText);

  const chordMatches = transposedText.match(/\[([^\]]+)\]/g);
  const uniqueChords = chordMatches
    ? [...new Set(chordMatches.map((m) => m.slice(1, -1)))]
    : [];

  const transposeLabel =
    semitones === 0 ? 'Original' : semitones > 0 ? `+${semitones}` : `${semitones}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink font-display sm:text-3xl">{song.title}</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink-light">Transpose:</span>
        <button
          onClick={() => setSemitones((s) => s - 1)}
          className="rounded-md border border-border p-1.5 hover:bg-cream transition-colors"
          aria-label="Transpose down"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[4rem] text-center text-sm font-semibold text-saffron">
          {transposeLabel}
        </span>
        <button
          onClick={() => setSemitones((s) => s + 1)}
          className="rounded-md border border-border p-1.5 hover:bg-cream transition-colors"
          aria-label="Transpose up"
        >
          <Plus className="h-4 w-4" />
        </button>
        {semitones !== 0 && (
          <button
            onClick={() => setSemitones(0)}
            className="text-xs text-ink-muted hover:text-ink underline transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {song.mp3_filename && (
        <audio controls className="w-full max-w-lg">
          <source src={`/api/uploads/${song.mp3_filename}`} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      <div className="rounded-lg bg-ivory p-4 shadow-sm border border-border overflow-x-auto">
        {uniqueChords.length > 0 && (
          <div className="mb-4 pb-4 border-b border-border-light">
            <ChordDiagram chords={uniqueChords} />
          </div>
        )}
        <div className="font-mono text-sm leading-normal">
          {lines.map((line, li) => {
            const hasChords = line.segments.some((s) => s.type === 'chord');
            return (
              <div key={li} className="whitespace-pre min-h-[1.25em]">
                {hasChords ? (
                  <>
                    <div className="text-xs font-bold text-saffron leading-none select-none">
                      {line.segments.map((seg, si) =>
                        seg.type === 'chord' ? (
                          <span key={si}>{seg.value}</span>
                        ) : (
                          <span key={si}>{seg.value.replace(/./g, ' ')}</span>
                        ),
                      )}
                    </div>
                    <div className="leading-tight">
                      {line.segments.map((seg, si) =>
                        seg.type === 'chord' ? (
                          <span key={si}>{seg.value.replace(/./g, ' ')}</span>
                        ) : (
                          <span key={si}>{seg.value}</span>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div>{line.segments.map((seg) => seg.value).join('')}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Added by User #{song.user_id} &middot;{' '}
        {new Date(song.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
