export type CopyVariant =
  | 'open-tabs'
  | 'play-more'
  | 'ownership'
  | 'customization'
  | 'songwriting'
  | 'shuffle'
  | 'chord-matching';

export type SceneId = 'collect' | 'find' | 'pace' | 'adapt' | 'hands-free' | 'files';

export type SceneCopy = {
  eyebrow: string;
  headline: string;
  explanation: string;
};

export type CopyPack = {
  openingHook: string;
  openingFooter: string;
  endLine: string;
  releaseLine: string;
  scenes: Record<SceneId, SceneCopy>;
};

export const copyVariants: Record<CopyVariant, CopyPack> = {
  'open-tabs': {
    openingHook: 'Your songs deserve better than 37 open tabs.',
    openingFooter: 'Close the tabs. Open your songbook.',
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
    openingFooter: 'Less organizing. More playing.',
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
    openingFooter: 'Portable by design. Yours by default.',
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
  customization: {
    openingHook: 'Your songbook should feel\nlike yours.',
    openingFooter: 'Your colour. Your pace. Your way.',
    endLine: 'Your colour.\nYour pace.\nYour songbook.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Your library',
        headline: 'Shape your own songbook',
        explanation:
          'Import a link, write from scratch, or point chordlist at the folder you already use.',
      },
      find: {
        eyebrow: 'Your system',
        headline: 'Find it your way',
        explanation:
          'Search by title, artist, tag, or chord progression—whatever comes to mind first.',
      },
      pace: {
        eyebrow: 'Your tempo',
        headline: 'Dial in the scroll',
        explanation:
          'Fine-tune autoscroll in the song, then adjust the overall speed to suit how you play.',
      },
      adapt: {
        eyebrow: 'Your key',
        headline: 'Make every chart fit',
        explanation:
          'Transpose the progression in one tap without changing the song you saved.',
      },
      'hands-free': {
        eyebrow: 'Your colour',
        headline: 'Choose your accent',
        explanation:
          'Pick one of seven app accents, then carry that colour into a hands-free play-through.',
      },
      files: {
        eyebrow: 'Your folder',
        headline: 'Keep it where you want it',
        explanation:
          'Choose the folder and keep each song as readable Markdown you can move or edit elsewhere.',
      },
    },
  },
  songwriting: {
    openingHook: 'Give the song in your head\nsomewhere to live.',
    openingFooter: 'Write it down. Play it through.',
    endLine: 'Write it.\nShape it.\nPlay it.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Start here',
        headline: 'Catch the song while it is fresh',
        explanation:
          'Add lyrics and tags, then enter the changes quickly with a purpose-built chord keyboard.',
      },
      find: {
        eyebrow: 'Come back',
        headline: 'Find the idea again',
        explanation:
          'Search by title, artist, tag, or the chord progression you remember.',
      },
      pace: {
        eyebrow: 'Play it through',
        headline: 'Let the words keep pace',
        explanation:
          'Autoscroll moves through the chart while you try the song from top to bottom.',
      },
      adapt: {
        eyebrow: 'Try another key',
        headline: 'Explore without rewriting',
        explanation:
          'Transpose the progression in a tap while the song you saved stays unchanged.',
      },
      'hands-free': {
        eyebrow: 'Hear it out',
        headline: 'Play while the chart moves',
        explanation:
          'Hands-free scrolling lets you hear the idea as a song, not just read it on the page.',
      },
      files: {
        eyebrow: 'Keep the work',
        headline: 'The song stays readable',
        explanation:
          'Each song is a Markdown file you can revisit, revise, and keep outside chordlist.',
      },
    },
  },
  shuffle: {
    openingHook: "Don't know what to play?\nTap Shuffle.",
    openingFooter: 'Let your songbook choose.',
    endLine: 'Less choosing.\nMore playing.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Stack the deck',
        headline: 'Build a library worth shuffling',
        explanation:
          'Add songs from links, write your own, or bring in the files you already keep.',
      },
      find: {
        eyebrow: 'Shuffle',
        headline: 'One tap. Your next song.',
        explanation:
          'Filter the library if you like, then let Shuffle pick at random from the songs in view.',
      },
      pace: {
        eyebrow: 'Press play',
        headline: 'Get straight into the song',
        explanation:
          'Set autoscroll to a comfortable pace and follow wherever the choice takes you.',
      },
      adapt: {
        eyebrow: 'Make it fit',
        headline: 'Move the pick into your key',
        explanation:
          'Shift every chord in a tap without rewriting the source song.',
      },
      'hands-free': {
        eyebrow: 'Stay with it',
        headline: 'Keep your hands on the instrument',
        explanation:
          'The chart moves on its own while you see where the random choice takes you.',
      },
      files: {
        eyebrow: 'Your repertoire',
        headline: 'Always ready to reshuffle',
        explanation:
          'The whole songbook stays portable as readable Markdown files.',
      },
    },
  },
  'chord-matching': {
    openingHook: 'Different key.\nSame progression.\nYour next song.',
    openingFooter: 'See what your songs have in common.',
    endLine: 'Match the chords.\nFind what comes next.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {
        eyebrow: 'Map the song',
        headline: 'Save the progression',
        explanation:
          'Keep lyrics, tags, and chord changes together in one readable song file.',
      },
      find: {
        eyebrow: 'Chord match',
        headline: 'Find songs with the same shape',
        explanation:
          'Chordlist recognizes the same progression across different keys and surfaces matches from your library.',
      },
      pace: {
        eyebrow: 'Keep the thread',
        headline: 'Move straight into the match',
        explanation:
          'Open a suggestion and let autoscroll carry the next chart at your pace.',
      },
      adapt: {
        eyebrow: 'Across keys',
        headline: 'Same changes. New key.',
        explanation:
          'Transpose a chart in a tap while its structure—and the source file—stay intact.',
      },
      'hands-free': {
        eyebrow: 'Try the pairing',
        headline: 'Play them back to back',
        explanation:
          'Hands-free scrolling makes it easy to hear how two matching songs connect.',
      },
      files: {
        eyebrow: 'Open by design',
        headline: 'The chords stay with the song',
        explanation:
          'Progressions live in readable Markdown, ready to keep, edit, or use outside the app.',
      },
    },
  },
};

export const getCopy = (variant: CopyVariant): CopyPack => copyVariants[variant];

export const resolveCopy = (
  variant: CopyVariant,
  mode: 'preset' | 'custom',
  customCopy: CopyPack,
): CopyPack => (mode === 'custom' ? customCopy : getCopy(variant));
