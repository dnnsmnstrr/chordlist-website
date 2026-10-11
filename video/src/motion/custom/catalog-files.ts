import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {Document, parse, parseDocument} from 'yaml';
import {
  SNIPPET_KEY,
  SnippetError,
  buildCatalog,
  sectionFor,
  snippetsFileSchema,
  type SnippetCatalog,
  type SnippetKind,
  type SnippetsFile,
} from './snippets';

// The snippet catalog read from disk, for the render script and the wizard's server code (never
// the Remotion bundle). See snippets.ts for what the three sources are.

const snippetsPath = (root: string) => path.join(root, 'content', 'motion', 'snippets.yml');

export async function readSnippetsFile(root: string): Promise<SnippetsFile> {
  const source = await readFile(snippetsPath(root), 'utf8').catch(() => '');
  const parsed = snippetsFileSchema.safeParse(parse(source) ?? {});
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new SnippetError(`content/motion/snippets.yml: ${issues.join('; ')}`);
  }
  return parsed.data;
}

async function readSocialWording(root: string) {
  const directory = path.join(root, 'content', 'social');
  const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith('.md')).sort();
  const wording = [];
  for (const file of files) {
    const match = (await readFile(path.join(directory, file), 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) continue;
    try {
      const data = (parse(match[1] ?? '') ?? {}) as Record<string, unknown>;
      if (data.draft === true) continue;
      wording.push({
        slug: file.replace(/\.md$/, ''),
        eyebrow: typeof data.eyebrow === 'string' ? data.eyebrow : undefined,
        headline: Array.isArray(data.headline) ? data.headline.map(String) : undefined,
        footnote: typeof data.footnote === 'string' ? data.footnote : undefined,
        caption: (match[2] ?? '').trim() || undefined,
      });
    } catch {
      // A malformed still fails pnpm build:social; here it only costs its snippets.
    }
  }
  return wording;
}

export async function loadCatalog(root: string): Promise<SnippetCatalog> {
  const vocabulary = JSON.parse(await readFile(path.join(root, 'locales', 'vocabulary.json'), 'utf8')) as {
    phrases: {name: string; translations: {en?: string}}[];
  };
  return buildCatalog(await readSnippetsFile(root), vocabulary.phrases, await readSocialWording(root));
}

/**
 * Adds or changes one snippet in content/motion/snippets.yml, validated against its field's limits.
 * Only the wizard's own snippets are written; vocabulary and social wording are changed at source.
 */
export async function writeSnippet(root: string, kind: SnippetKind, key: string, value: string | string[]) {
  if (!SNIPPET_KEY.test(key)) throw new SnippetError(`"${key}" is not a valid snippet name. Use lowercase words joined by hyphens.`);
  const file = await readSnippetsFile(root);
  const parsed = snippetsFileSchema.safeParse({...file, [sectionFor[kind]]: {...file[sectionFor[kind]], [key]: value}});
  if (!parsed.success) throw new SnippetError(parsed.error.issues.map((issue) => issue.message).join('; '));

  // Edited as a YAML document rather than re-serialised, so the file's comments and order survive.
  const source = await readFile(snippetsPath(root), 'utf8').catch(() => '');
  const document = source.trim() === '' ? new Document({}) : parseDocument(source);
  document.setIn([sectionFor[kind], key], document.createNode(value));
  await mkdir(path.dirname(snippetsPath(root)), {recursive: true});
  await writeFile(snippetsPath(root), document.toString({lineWidth: 0}));
  return parsed.data;
}
