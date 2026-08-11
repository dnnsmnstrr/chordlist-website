export type CopyVariant = 'open-tabs' | 'play-more' | 'ownership';

export type SceneId = 'collect' | 'find' | 'pace' | 'adapt' | 'hands-free' | 'files';

type SceneCopy = {
  eyebrow: string;
  headline: string;
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
      collect: {eyebrow: 'Collect', headline: 'One personal songbook'},
      find: {eyebrow: 'Find', headline: 'Search. Match. Keep playing.'},
      pace: {eyebrow: 'Set the pace', headline: 'Scroll at your speed'},
      adapt: {eyebrow: 'Adapt', headline: 'Transpose in a tap'},
      'hands-free': {eyebrow: 'Hands free', headline: 'Lyrics that move with you'},
      files: {eyebrow: 'Yours', headline: 'Readable Markdown files'},
    },
  },
  'play-more': {
    openingHook: 'Spend less time organizing. More time playing.',
    endLine: 'Less managing. More music.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {eyebrow: 'Together', headline: 'Every song in one place'},
      find: {eyebrow: 'On cue', headline: 'Find the right song, fast'},
      pace: {eyebrow: 'Keep moving', headline: 'The chart follows your pace'},
      adapt: {eyebrow: 'Your key', headline: 'Transpose without rewriting'},
      'hands-free': {eyebrow: 'Stay playing', headline: 'Keep your hands on the instrument'},
      files: {eyebrow: 'Still yours', headline: 'Saved as readable Markdown'},
    },
  },
  ownership: {
    openingHook: 'Your songbook should belong to you.',
    endLine: 'Your music. Your files. Your way.',
    releaseLine: 'chordlist — coming August 30',
    scenes: {
      collect: {eyebrow: 'Local first', headline: 'One library on your device'},
      find: {eyebrow: 'Ready', headline: 'Your songs, instantly searchable'},
      pace: {eyebrow: 'Hands free', headline: 'Follow every line automatically'},
      adapt: {eyebrow: 'Flexible', headline: 'Change key in one tap'},
      'hands-free': {eyebrow: 'In flow', headline: 'Keep playing while lyrics move'},
      files: {eyebrow: 'Open files', headline: 'Readable Markdown, always yours'},
    },
  },
};

export const getCopy = (variant: CopyVariant): CopyPack => copyVariants[variant];
