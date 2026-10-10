import vocabulary from '../../../locales/vocabulary.json';

// Words for the motion suite. Product wording shared with the app (the tagline, the free limit)
// is read from VOCABULARY.md through the synced vocabulary.json rather than retyped, and every
// claim here is one the site already makes in locales/en.ts.
const phrase = (name: string) => {
  const entry = vocabulary.phrases.find((candidate) => candidate.name === name);
  if (!entry) throw new Error(`Unknown vocabulary phrase: ${name}`);
  return entry.translations.en;
};

export const tagline = phrase('tagline');
export const freeLimit = phrase('free limit');

export const motionCopy = {
  logoSting: {
    tagline,
  },
  plainText: {
    eyebrow: 'Plain text, really',
    filename: 'morning-light.md',
    headline: 'A song is\njust a file.',
    caption: 'Markdown you can read, move, and keep.',
  },
  transpose: {
    eyebrow: 'Transpose',
    headline: 'New key.\nSame song.',
    caption: 'Every chord moves. The words stay put.',
    stepLabel: (steps: number) => `${steps > 0 ? '+' : ''}${steps} semitones`,
  },
  sameChords: {
    eyebrow: 'Matching progressions',
    headline: 'Seven songs.\nOne progression.',
    caption: 'chordlist finds the songs that share your chords.',
    roman: 'I – V – vi – IV',
  },
  keyboard: {
    eyebrow: 'Chord keyboard',
    headline: 'Built for chords,\nnot sentences.',
    caption: 'A piano keyboard for entering progressions.',
  },
  handsFree: {
    eyebrow: 'Autoscroll',
    headline: 'Keep your hands\non the instrument.',
    caption: 'The chart follows your pace.',
    timer: 'touches',
  },
  themes: {
    eyebrow: 'Appearance',
    headline: 'Seven colours.\nOne songbook.',
    caption: 'Pick the tint that suits your stage.',
  },
  reel: {
    intro: 'Your songbook,\nin motion.',
    scenes: [
      {eyebrow: '01 — Library', headline: 'Every song\nin one place.'},
      {eyebrow: '02 — Write', headline: 'A keyboard\nmade for chords.'},
      {eyebrow: '03 — Find', headline: 'Find the right\nsong, fast.'},
      {eyebrow: '04 — Discover', headline: 'Songs that share\nyour chords.'},
      {eyebrow: '05 — Adapt', headline: 'Transpose\nin one tap.'},
      {eyebrow: '06 — Play', headline: 'Hands-free\nautoscroll.'},
    ],
    outro: 'Now on the\nApp Store.',
  },
  wall: {
    eyebrow: 'For iPhone and iPad',
    headline: tagline,
  },
  manifesto: {
    words: ['Your lyrics.', 'Your chords.', 'Your files.', 'Your songbook.'],
    closing: tagline,
  },
  launch: {
    eyebrow: 'Out now',
    headline: 'Now on the\nApp Store.',
    freeLimit,
    detail: 'Free download · one-time unlock for unlimited songs',
    platforms: 'iPhone · iPad',
  },
  search: {
    eyebrow: 'Search',
    headline: 'Title, artist,\ntag, or chords.',
    caption: 'The library narrows as you type.',
  },
} as const;
