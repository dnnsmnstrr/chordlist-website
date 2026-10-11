import {z} from 'zod';
import {campaignSchema} from '../campaigns';
import {resolveField, snippetRefSchema, type SnippetCatalog} from './snippets';

// A motion definition: the shape of content/motion/<slug>.md, written by the /motion wizard and
// rendered by `pnpm build:motion`. It deliberately mirrors a content/social definition — the same
// eyebrow, authored headline lines and footnote, the same template names where they overlap — so a
// still and its motion twin are written the same way, and the wizard can start from either.
//
// This file is shared by the Remotion composition, the wizard, its API, and the build script, so
// the schema that validates a save is the one that renders it.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const motionTemplates = ['statement', 'screen', 'progression', 'file', 'photo', 'chordlink-print', 'chordlink-model'] as const;
export const motionFormats = ['story', 'post', 'wide', 'square'] as const;

// Chapters of the press recording a definition may cut from. Three are left out on purpose:
// `linkImport` runs into the imported draft, which shows a third-party lyric page, and `shuffle`
// and `nextSong` can land on a fixture that carries real lyrics. Nothing here may put someone
// else's lyrics on screen.
export const recordingChapters = [
  'library',
  'chordKeyboard',
  'search',
  'matchingSongs',
  'matchingSelected',
  'songOpens',
  'transposeControl',
  'transposed',
  'autoscrollStarts',
  'speedControl',
  'speedMax',
  'handsFree',
] as const;

// The paywall is left out: it prints a price, and a price is the store's to state.
export const screenshotNames = [
  '01-Song-List',
  '02-Song-Detail',
  '03-Creation-Flow',
  '04-Search',
  '05-Tag-Filter',
  '06-Settings',
  '07-Song-Suggestions',
] as const;

const fileName = z.string().regex(/^[a-z0-9][a-z0-9._-]*$/, 'A plain lowercase file name');

export const mediaSchema = z.discriminatedUnion('kind', [
  z.object({kind: z.literal('none')}),
  z.object({kind: z.literal('screenshot'), name: z.enum(screenshotNames)}),
  z.object({
    kind: z.literal('recording'),
    chapter: z.enum(recordingChapters),
    // Seconds into the chapter. The cut never runs past the chapter's end, so a long offset
    // shortens the clip rather than spilling into the next shot.
    offset: z.number().min(0).max(30),
  }),
  z.object({kind: z.literal('colorScroll')}),
  z.object({kind: z.literal('upload'), file: fileName}),
  z.object({kind: z.literal('photo'), file: fileName}),
]);
export type MotionMedia = z.infer<typeof mediaSchema>;

const line = z.string().max(60);

export const definitionSchema = z.object({
  template: z.enum(motionTemplates),
  campaign: campaignSchema,
  appearance: z.enum(['light', 'dark']),
  formats: z.array(z.enum(motionFormats)).min(1),
  // Seconds of the piece itself, before the optional end card.
  duration: z.number().min(3).max(30),
  endCard: z.boolean(),
  eyebrow: z.string().max(24),
  headline: z.array(line).min(1).max(4),
  subline: z.string().max(90),
  footnote: z.string().max(60),
  chords: z.array(z.string().regex(/^[A-G][#b]?[a-z0-9#b+°ø/]*$/, 'A chord such as G, F#m or Cmaj7')).max(6),
  numerals: z.string().max(30),
  filename: z.string().max(40),
  fileLines: z.array(z.string().max(48)).max(18),
  media: mediaSchema,
});
export type MotionDefinition = z.infer<typeof definitionSchema>;

export const customPropsSchema = z.object({
  slug: z.string(),
  definition: definitionSchema,
});
export type CustomProps = z.infer<typeof customPropsSchema>;

/** What a new definition starts as: a statement in ink, which every other template builds on. */
export const emptyDefinition: MotionDefinition = {
  template: 'statement',
  campaign: 'ink',
  appearance: 'dark',
  formats: ['story', 'post'],
  duration: 6,
  endCard: false,
  eyebrow: '',
  headline: ['Your lyrics and chords,', 'as files in your pocket.'],
  subline: '',
  footnote: 'chordlist.app',
  chords: ['G', 'D', 'Em', 'C'],
  numerals: 'I – V – vi – IV',
  filename: 'morning-light.md',
  fileLines: [],
  media: {kind: 'none'},
};

export const END_CARD_SECONDS = 3;

export const totalSeconds = (definition: Pick<MotionDefinition, 'duration' | 'endCard'>) =>
  definition.duration + (definition.endCard ? END_CARD_SECONDS : 0);

// What content/motion/<slug>.md holds: the definition, except that its words may be references to
// snippets (see snippets.ts). Resolved into a plain MotionDefinition before it is previewed or
// rendered, so the composition never sees a reference.
const linkable = <T extends z.ZodType>(value: T) => z.union([value, snippetRefSchema]);

export const storedDefinitionSchema = definitionSchema.extend({
  eyebrow: linkable(definitionSchema.shape.eyebrow),
  headline: linkable(definitionSchema.shape.headline),
  subline: linkable(definitionSchema.shape.subline),
  footnote: linkable(definitionSchema.shape.footnote),
});
export type StoredDefinition = z.infer<typeof storedDefinitionSchema>;

export function resolveDefinition(stored: StoredDefinition, catalog: SnippetCatalog): MotionDefinition {
  return definitionSchema.parse({
    ...stored,
    eyebrow: resolveField(stored.eyebrow, 'eyebrow', catalog),
    headline: resolveField(stored.headline, 'headline', catalog),
    subline: resolveField(stored.subline, 'subline', catalog),
    footnote: resolveField(stored.footnote, 'footnote', catalog),
  });
}
