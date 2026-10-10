import vocabulary from '../../../locales/vocabulary.json';
import socialCopy from './generated/social-copy.json';

// Words for the motion suite, in the same shape as a content/social definition: a lowercase
// eyebrow beside the wordmark, a headline authored line by line, and a footnote. A piece with a
// social twin reads all three from that definition (synced into generated/social-copy.json by
// `pnpm sync:motion`), so the video and the still that go out together say the same thing.
// Product wording shared with the app comes from VOCABULARY.md through vocabulary.json.
const phrase = (name: string) => {
  const entry = vocabulary.phrases.find((candidate) => candidate.name === name);
  if (!entry) throw new Error(`Unknown vocabulary phrase: ${name}`);
  return entry.translations.en;
};

export type Frame = {eyebrow: string; headline: readonly string[]; footnote: string};

const social = (slug: keyof typeof socialCopy): Frame => socialCopy[slug];

export const tagline = phrase('tagline');
export const freeLimit = phrase('free limit');

export const motionCopy = {
  logoSting: {tagline},
  plainText: {
    eyebrow: 'Format',
    headline: ['A song is', 'just a file.'],
    footnote: 'chordlist.app/#preview',
    filename: 'morning-light.md',
  },
  transpose: {
    eyebrow: 'Feature',
    headline: ['New key.', 'Same song.'],
    footnote: 'chordlist.app/docs#playing',
    stepLabel: (steps: number) => `${steps > 0 ? '+' : ''}${steps} semitones`,
    key: 'Key',
  },
  sameChords: social('matching-progressions'),
  keyboard: social('chord-keyboard'),
  handsFree: {
    eyebrow: 'Feature',
    headline: ['Keep your hands', 'on the instrument.'],
    footnote: 'chordlist.app/docs#playing',
    touches: 'touches',
  },
  themes: {
    eyebrow: 'Feature',
    headline: ['Seven colours.', 'One songbook.'],
    footnote: 'chordlist.app',
  },
  reel: {
    eyebrow: 'Tour',
    footnote: 'chordlist.app',
    intro: ['Your songbook,', 'in motion.'],
    // Scenes with a social twin use its headline, so the tour quotes the stills it summarises.
    scenes: [
      social('song-library').headline,
      social('chord-keyboard').headline,
      social('search-across-everything').headline,
      social('matching-progressions').headline,
      ['Transpose', 'in one tap.'],
      ['Hands-free', 'autoscroll.'],
    ],
  },
  wall: {...social('local-first-songbook'), detail: 'For iPhone and iPad'},
  manifesto: {
    ...social('local-first-songbook'),
    words: ['Your lyrics.', 'Your chords.', 'Your files.', 'Your songbook.'],
  },
  launch: {...social('out-now'), freeLimit},
  endCard: {
    // The promo's end line, so a phone edit ending on this card matches the launch cut.
    headline: ['Your chords', 'Your lyrics', 'Your files'],
    pill: 'Out now on the App Store',
  },
} as const;
