// Chapter boundaries of the press-kit demo masters (chordlist-demo-{light,dark}.mp4, 30 fps), as
// written by the app repository's capture pipeline in chordlist-demo-<appearance>.chapters.vtt.
// The imported-draft chapter is deliberately absent: it shows a third-party lyric page, and nothing
// here may put someone else's lyrics on screen. For the same reason no cut may run into `nextSong`,
// which opens a fixture that carries real lyrics.
const light = {
  library: {start: 0.254, end: 1.765},
  linkImport: {start: 1.765, end: 13.514},
  chordKeyboard: {start: 21.097, end: 31.736},
  shuffle: {start: 31.736, end: 39.747},
  search: {start: 39.747, end: 48.95},
  matchingSongs: {start: 48.95, end: 54.903},
  matchingSelected: {start: 54.903, end: 58.145},
  nextSong: {start: 58.145, end: 63.671},
  songOpens: {start: 63.671, end: 70.646},
  transposeControl: {start: 70.646, end: 73.053},
  transposed: {start: 73.053, end: 76.113},
  autoscrollStarts: {start: 76.113, end: 76.881},
  speedControl: {start: 76.881, end: 80.744},
  speedMax: {start: 80.744, end: 84.344},
  handsFree: {start: 84.344, end: 95.6},
} as const;

// The dark take is a separate capture, so its chapters land a little earlier.
const dark = {
  library: {start: 0.252, end: 1.757},
  linkImport: {start: 1.757, end: 13.05},
  chordKeyboard: {start: 20.381, end: 31.053},
  shuffle: {start: 31.053, end: 38.781},
  search: {start: 38.781, end: 47.862},
  matchingSongs: {start: 47.862, end: 53.681},
  matchingSelected: {start: 53.681, end: 56.959},
  nextSong: {start: 56.959, end: 62.498},
  songOpens: {start: 62.498, end: 69.329},
  transposeControl: {start: 69.329, end: 71.71},
  transposed: {start: 71.71, end: 74.776},
  autoscrollStarts: {start: 74.776, end: 75.552},
  speedControl: {start: 75.552, end: 79.408},
  speedMax: {start: 79.408, end: 82.698},
  handsFree: {start: 82.698, end: 91.267},
} satisfies Record<keyof typeof light, {start: number; end: number}>;

export const chaptersFor = (appearance: 'light' | 'dark') => (appearance === 'light' ? light : dark);

export type ChapterName = keyof typeof light;

// The theme-colour master cycles through the app's seven tints. Boundaries were measured from the
// play button's fill in smooth-color-scroll-light-only.mp4 (8 s).
export const colorScrollStops = [
  {accent: 'blue', start: 0},
  {accent: 'purple', start: 1.33},
  {accent: 'pink', start: 2.73},
  {accent: 'neutral', start: 4.33},
  {accent: 'orange', start: 5.33},
  {accent: 'teal', start: 6.33},
  {accent: 'green', start: 6.93},
] as const;
export const colorScrollDuration = 8;
