export interface ChordSegment {
  type: 'text' | 'chord';
  value: string;
}

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const FLAT_MAP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
};

const CHORD_REGEX = /\[([^\]]+)\]/g;
const ROOT_REGEX = /^([A-G][#b]?)(.*)/;
const INLINE_CHORD_REGEX = /\[([^\]]+)\]/g;

export function parseLyrics(text: string): { lines: { segments: ChordSegment[] }[] } {
  const lines = text.split('\n').map((line) => {
    const segments: ChordSegment[] = [];
    let lastIndex = 0;
    const regex = new RegExp(INLINE_CHORD_REGEX.source, INLINE_CHORD_REGEX.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', value: line.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'chord', value: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      segments.push({ type: 'text', value: line.slice(lastIndex) });
    }

    if (segments.length === 0) {
      segments.push({ type: 'text', value: '' });
    }

    return { segments };
  });

  return { lines };
}

export function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(ROOT_REGEX);
  if (!match) return chord;

  let root = match[1];
  const suffix = match[2];

  if (root.length === 2 && root[1] === 'b') {
    root = FLAT_MAP[root] || root;
  }

  const index = NOTES.indexOf(root);
  if (index === -1) return chord;

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return NOTES[newIndex] + suffix;
}

export function transposeLyrics(text: string, semitones: number): string {
  if (semitones === 0) return text;
  return text.replace(CHORD_REGEX, (_, chord) => `[${transposeChord(chord, semitones)}]`);
}
