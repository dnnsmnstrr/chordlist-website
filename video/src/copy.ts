export type CopyVariant = 'open-tabs' | 'play-more' | 'ownership';

export type SceneId = 'collect' | 'find' | 'pace' | 'adapt' | 'hands-free' | 'files';

type SceneCopy = {
  eyebrow: string;
  headline: string;
  explanation: string;
};

type CopyPack = {
  openingHook: string;
  endLine: string;
  releaseLine: string;
  scenes: Record<SceneId, SceneCopy>;
};

export const copyVariants: Record<CopyVariant, CopyPack> = {
  'open-tabs': {
    openingHook: 'Your songs deserve better than 37 open tabs.',
    endLine: 'Your lyrics. Your chords. Your files.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Collect',
        headline: 'One personal songbook',
        explanation: 'Bring songs together from links, quick edits, and your existing files.',
      },
      find: {
        eyebrow: 'Find',
        headline: 'Search. Match. Keep playing.',
        explanation: 'Search titles, artists, tags, and progressions without leaving your library.',
      },
      pace: {
        eyebrow: 'Set the pace',
        headline: 'Scroll at your speed',
        explanation: 'Choose a comfortable tempo once and let the chart keep your place.',
      },
      adapt: {
        eyebrow: 'Adapt',
        headline: 'Transpose in a tap',
        explanation: 'Move every chord into the right key without rewriting the song.',
      },
      'hands-free': {
        eyebrow: 'Hands free',
        headline: 'Lyrics that move with you',
        explanation: 'The chart advances on its own, leaving both hands free for the instrument.',
      },
      files: {
        eyebrow: 'Yours',
        headline: 'Readable Markdown files',
        explanation: 'Your songbook stays portable, inspectable, and useful outside the app.',
      },
    },
  },
  'play-more': {
    openingHook: 'Spend less time organizing. More time playing.',
    endLine: 'Less managing. More music.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Together',
        headline: 'Every song in one place',
        explanation: 'Collect songs from the web or write your own without breaking your flow.',
      },
      find: {
        eyebrow: 'On cue',
        headline: 'Find the right song, fast',
        explanation: 'Search by song, artist, tag, or chord progression and get back to playing.',
      },
      pace: {
        eyebrow: 'Keep moving',
        headline: 'The chart follows your pace',
        explanation: 'Fine-tune autoscroll from a gentle rehearsal pace to a confident performance.',
      },
      adapt: {
        eyebrow: 'Your key',
        headline: 'Transpose without rewriting',
        explanation: 'Shift the entire chart in one tap while the original song stays intact.',
      },
      'hands-free': {
        eyebrow: 'Stay playing',
        headline: 'Keep your hands on the instrument',
        explanation: 'A continuous, colour-changing chart demonstrates the full hands-free experience.',
      },
      files: {
        eyebrow: 'Still yours',
        headline: 'Saved as readable Markdown',
        explanation: 'Every song remains a simple file you can read, move, and keep for yourself.',
      },
    },
  },
  ownership: {
    openingHook: 'Your songbook should belong to you.',
    endLine: 'Your music. Your files. Your way.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Local first',
        headline: 'One library on your device',
        explanation: 'Build a personal songbook without handing its contents to another platform.',
      },
      find: {
        eyebrow: 'Ready',
        headline: 'Your songs, instantly searchable',
        explanation: 'Fast local search keeps the whole library available whenever inspiration strikes.',
      },
      pace: {
        eyebrow: 'Hands free',
        headline: 'Follow every line automatically',
        explanation: 'Autoscroll keeps the current line in view at the speed that works for you.',
      },
      adapt: {
        eyebrow: 'Flexible',
        headline: 'Change key in one tap',
        explanation: 'Transpose the chart for a different voice or instrument without duplicating it.',
      },
      'hands-free': {
        eyebrow: 'In flow',
        headline: 'Keep playing while lyrics move',
        explanation: 'The performance view stays out of the way while your chart moves continuously.',
      },
      files: {
        eyebrow: 'Open files',
        headline: 'Readable Markdown, always yours',
        explanation: 'No proprietary format stands between you and the songs you have collected.',
      },
    },
  },
};

export const getCopy = (variant: CopyVariant): CopyPack => copyVariants[variant];
