interface ChordFingering {
  frets: (number | -1)[];   // 6 strings (low E to high E). -1 = muted, 0 = open
  baseFret: number;
}

const CHORD_MAP: Record<string, ChordFingering> = {
  C:    { frets: [-1, 3, 2, 0, 1, 0], baseFret: 1 },
  D:    { frets: [-1, -1, 0, 2, 3, 2], baseFret: 1 },
  E:    { frets: [0, 2, 2, 1, 0, 0], baseFret: 1 },
  F:    { frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
  G:    { frets: [3, 2, 0, 0, 0, 3], baseFret: 1 },
  A:    { frets: [-1, 0, 2, 2, 2, 0], baseFret: 1 },
  B:    { frets: [-1, 2, 4, 4, 4, 2], baseFret: 1 },
  Am:   { frets: [-1, 0, 2, 2, 1, 0], baseFret: 1 },
  Bm:   { frets: [-1, 2, 4, 4, 3, 2], baseFret: 1 },
  Cm:   { frets: [-1, 3, 5, 5, 4, 3], baseFret: 1 },
  Dm:   { frets: [-1, -1, 0, 2, 3, 1], baseFret: 1 },
  Em:   { frets: [0, 2, 2, 0, 0, 0], baseFret: 1 },
  Fm:   { frets: [1, 3, 3, 1, 1, 1], baseFret: 1 },
  Gm:   { frets: [3, 5, 5, 3, 3, 3], baseFret: 1 },
  A7:   { frets: [-1, 0, 2, 0, 2, 0], baseFret: 1 },
  B7:   { frets: [-1, 2, 1, 2, 0, 2], baseFret: 1 },
  C7:   { frets: [-1, 3, 2, 3, 1, 0], baseFret: 1 },
  D7:   { frets: [-1, -1, 0, 2, 1, 2], baseFret: 1 },
  E7:   { frets: [0, 2, 0, 1, 0, 0], baseFret: 1 },
  G7:   { frets: [3, 2, 0, 0, 0, 1], baseFret: 1 },
};

function SingleDiagram({ name, fingering }: { name: string; fingering: ChordFingering }) {
  const W = 60;
  const H = 80;
  const PAD_TOP = 14;
  const PAD_LEFT = 10;
  const stringSpacing = (W - PAD_LEFT * 2) / 5;
  const fretSpacing = (H - PAD_TOP) / 5;

  return (
    <div className="flex flex-col items-center shrink-0">
      <svg width={W} height={H + 6} viewBox={`0 0 ${W} ${H + 6}`}>
        {/* Nut line */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP}
          x2={W - PAD_LEFT}
          y2={PAD_TOP}
          stroke="#2D1B0E"
          strokeWidth={2}
        />

        {/* Fret lines */}
        {[1, 2, 3, 4, 5].map((f) => (
          <line
            key={f}
            x1={PAD_LEFT}
            y1={PAD_TOP + f * fretSpacing}
            x2={W - PAD_LEFT}
            y2={PAD_TOP + f * fretSpacing}
            stroke="#E2D5C3"
            strokeWidth={1}
          />
        ))}

        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <line
            key={s}
            x1={PAD_LEFT + s * stringSpacing}
            y1={PAD_TOP}
            x2={PAD_LEFT + s * stringSpacing}
            y2={H}
            stroke="#E2D5C3"
            strokeWidth={1}
          />
        ))}

        {/* Open / muted indicators and finger dots */}
        {fingering.frets.map((fret, s) => {
          const x = PAD_LEFT + s * stringSpacing;
          if (fret === -1) {
            return (
              <text
                key={s}
                x={x}
                y={PAD_TOP - 3}
                textAnchor="middle"
                fontSize={8}
                fill="#9C8B7A"
              >
                ×
              </text>
            );
          }
          if (fret === 0) {
            return (
              <circle
                key={s}
                cx={x}
                cy={PAD_TOP - 5}
                r={3}
                fill="none"
                stroke="#9C8B7A"
                strokeWidth={1}
              />
            );
          }
          const adjustedFret = fret - fingering.baseFret + 1;
          const y = PAD_TOP + (adjustedFret - 0.5) * fretSpacing;
          return <circle key={s} cx={x} cy={y} r={3.5} fill="#C77B2B" />;
        })}
      </svg>
      <span className="text-xs font-semibold text-ink mt-0.5">{name}</span>
    </div>
  );
}

interface ChordDiagramProps {
  chords: string[];
}

export default function ChordDiagram({ chords }: ChordDiagramProps) {
  const available = chords.filter((c) => CHORD_MAP[c]);
  if (available.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {available.map((c) => (
        <SingleDiagram key={c} name={c} fingering={CHORD_MAP[c]} />
      ))}
    </div>
  );
}
