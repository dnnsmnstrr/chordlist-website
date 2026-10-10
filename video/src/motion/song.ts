// chordlist's own demo song, exactly as the app's screenshot fixture arranges it
// (ScreenshotFixtureCatalog.swift in the app repository). It is the only song whose words may
// appear in a motion piece: every other title shown is a library entry, never its lyrics.
export const morningLightFile = [
  '---',
  'title: Morning Light',
  'artist: chordlist',
  'chords: G D Em C',
  'tags:',
  '  - practice',
  'playCount: 3',
  '---',
  '',
  'Capo 0 · 4/4 · 84 bpm',
  '',
  '[Verse 1] G D Em C',
  'G            D',
  'Coffee on the counter going cold',
  'Em               C',
  'Radio is humming something old',
  'G                 D',
  'Curtains hold the dust up in the room',
  'Em           C',
  'Morning came around a little soon',
  '',
  '[Chorus] C G D Em',
  'C                G',
  'Hold the morning light',
  'D            Em',
  'Slow it down awhile',
];

export type ChartLine = {kind: 'section' | 'chords' | 'lyric' | 'blank'; text: string; progression?: string[]};

export const morningLightChart: ChartLine[] = [
  {kind: 'section', text: '[Verse 1]', progression: ['G', 'D', 'Em', 'C']},
  {kind: 'chords', text: 'G            D'},
  {kind: 'lyric', text: 'Coffee on the counter going cold'},
  {kind: 'chords', text: 'Em               C'},
  {kind: 'lyric', text: 'Radio is humming something old'},
  {kind: 'chords', text: 'G                 D'},
  {kind: 'lyric', text: 'Curtains hold the dust up in the room'},
  {kind: 'chords', text: 'Em           C'},
  {kind: 'lyric', text: 'Morning came around a little soon'},
  {kind: 'blank', text: ''},
  {kind: 'section', text: '[Chorus]', progression: ['C', 'G', 'D', 'Em']},
  {kind: 'chords', text: 'C                G'},
  {kind: 'lyric', text: 'Hold the morning light'},
  {kind: 'chords', text: 'D            Em'},
  {kind: 'lyric', text: 'Slow it down awhile'},
];

const sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flats: Record<string, string> = {Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#'};

/** Transposes one chord symbol, spelling with sharps as the app's chord keyboard does. */
export function transposeChord(chord: string, steps: number) {
  const match = /^([A-G][#b]?)(.*)$/.exec(chord);
  if (!match) return chord;
  const [, root = '', quality = ''] = match;
  const index = sharps.indexOf(flats[root] ?? root);
  if (index < 0) return chord;
  return sharps[(index + steps + 120) % 12] + quality;
}

/** Splits a chord line into chords and the column each one starts at. */
export function chordColumns(line: string) {
  const result: {chord: string; column: number}[] = [];
  const pattern = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line))) result.push({chord: match[0], column: match.index});
  return result;
}

// Library entries from the screenshot fixtures that share Morning Light's normalized progression
// (the "Matching Songs" screen). Titles and artists only; their own keys as the fixtures store them.
export const matchingSongs = [
  {title: 'Morning Light', artist: 'chordlist', chords: ['G', 'D', 'Em', 'C']},
  {title: 'Let It Be', artist: 'The Beatles', chords: ['C', 'G', 'Am', 'F']},
  {title: 'No Woman No Cry', artist: 'Bob Marley', chords: ['C', 'G', 'Am', 'F']},
  {title: 'Someone Like You', artist: 'Adele', chords: ['A', 'E', 'F#m', 'D']},
  {title: "I'm Yours", artist: 'Jason Mraz', chords: ['B', 'F#', 'G#m', 'E']},
  {title: "Don't Stop Believin'", artist: 'Journey', chords: ['E', 'B', 'C#m', 'A']},
  {title: 'With or Without You', artist: 'U2', chords: ['D', 'A', 'Bm', 'G']},
];
export const romanNumerals = ['I', 'V', 'vi', 'IV'];
