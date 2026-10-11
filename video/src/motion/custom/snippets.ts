import {z} from 'zod';

// Snippets: reusable wording for the /motion wizard's text fields. A definition can hold a field's
// text itself, or a reference such as `eyebrow: {snippet: feature}`. A reference is resolved when
// the definition is previewed or rendered, so changing a snippet changes every video that uses it
// on its next render, and the wording stays the same everywhere it appears.
//
// The catalog has three sources, and only the first is edited here:
//   - content/motion/snippets.yml, the wizard's own list (ids like `feature`);
//   - VOCABULARY.md through locales/vocabulary.json (ids like `vocabulary/tagline`), the shared
//     product wording, changed in the app repository;
//   - content/social/*.md (ids like `social/out-now`), so a video stays worded like its still.

export const snippetKinds = ['eyebrow', 'headline', 'subline', 'footnote', 'caption'] as const;
export type SnippetKind = (typeof snippetKinds)[number];

export const SNIPPET_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const snippetRefSchema = z.object({snippet: z.string().min(1)});
export type SnippetRef = z.infer<typeof snippetRefSchema>;

export const isSnippetRef = (value: unknown): value is SnippetRef => snippetRefSchema.safeParse(value).success;

// The same limits the definition schema puts on each field, so a snippet always fits its field.
const eyebrow = z.string().max(24);
const headline = z.array(z.string().max(60)).min(1).max(4);
const subline = z.string().max(90);
const footnote = z.string().max(60);
const caption = z.string().max(2200);

const record = <T extends z.ZodType>(value: T) => z.record(z.string().regex(SNIPPET_KEY, 'lowercase-words-with-hyphens'), value);

/** content/motion/snippets.yml — every section optional, each a map from key to wording. */
export const snippetsFileSchema = z.object({
  eyebrows: record(eyebrow).default({}),
  headlines: record(headline).default({}),
  sublines: record(subline).default({}),
  footnotes: record(footnote).default({}),
  captions: record(caption).default({}),
});
export type SnippetsFile = z.infer<typeof snippetsFileSchema>;

export const sectionFor: Record<SnippetKind, keyof SnippetsFile> = {
  eyebrow: 'eyebrows',
  headline: 'headlines',
  subline: 'sublines',
  footnote: 'footnotes',
  caption: 'captions',
};

export type SnippetSource = 'snippets' | 'vocabulary' | 'social';

export type Snippet = {
  id: string;
  kind: SnippetKind;
  source: SnippetSource;
  /** The wording: a list of lines for a headline, otherwise one string. */
  value: string | string[];
};

export type SnippetCatalog = Snippet[];

type SocialWording = {slug: string; eyebrow?: string; headline?: string[]; footnote?: string; caption?: string};
type VocabularyPhrase = {name: string; translations: {en?: string}};

const fits = (schema: z.ZodType, value: unknown) => schema.safeParse(value).success;

/** Every snippet the wizard can offer, from all three sources, checked against its field's limits. */
export function buildCatalog(file: SnippetsFile, vocabulary: VocabularyPhrase[], social: SocialWording[]): SnippetCatalog {
  const catalog: SnippetCatalog = [];
  for (const kind of snippetKinds) {
    for (const [key, value] of Object.entries(file[sectionFor[kind]])) {
      catalog.push({id: key, kind, source: 'snippets', value: value as string | string[]});
    }
  }
  for (const phrase of vocabulary) {
    const text = phrase.translations.en;
    if (text && fits(subline, text)) {
      catalog.push({id: `vocabulary/${phrase.name.replace(/\s+/g, '-')}`, kind: 'subline', source: 'vocabulary', value: text});
    }
  }
  for (const entry of social) {
    const id = `social/${entry.slug}`;
    if (entry.eyebrow && fits(eyebrow, entry.eyebrow)) catalog.push({id, kind: 'eyebrow', source: 'social', value: entry.eyebrow});
    if (entry.headline && fits(headline, entry.headline)) catalog.push({id, kind: 'headline', source: 'social', value: entry.headline});
    if (entry.footnote && fits(footnote, entry.footnote)) catalog.push({id, kind: 'footnote', source: 'social', value: entry.footnote});
    if (entry.caption && fits(caption, entry.caption)) catalog.push({id, kind: 'caption', source: 'social', value: entry.caption});
  }
  return catalog;
}

export function findSnippet(catalog: SnippetCatalog, kind: SnippetKind, id: string) {
  return catalog.find((snippet) => snippet.kind === kind && snippet.id === id);
}

export class SnippetError extends Error {}

/** A field's text, following a reference into the catalog. Throws on a reference to nothing. */
export function resolveField<T extends string | string[]>(value: T | SnippetRef, kind: SnippetKind, catalog: SnippetCatalog): T {
  if (!isSnippetRef(value)) return value as T;
  const snippet = findSnippet(catalog, kind, value.snippet);
  if (!snippet) throw new SnippetError(`There is no ${kind} snippet called "${value.snippet}".`);
  return snippet.value as T;
}
