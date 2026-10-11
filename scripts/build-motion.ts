import {mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {loadCatalog} from '../video/src/motion/custom/catalog-files';
import {parseDefinitionFile} from '../video/src/motion/custom/definition-file';
import {SLUG_PATTERN, resolveDefinition, totalSeconds, type MotionDefinition} from '../video/src/motion/custom/schema';

// Renders every definition in content/motion into public/motion/<slug>/<format>.mp4, with a poster
// of the final frame beside each and public/motion/manifest.json listing them — the motion
// counterpart of `pnpm build:social`. It runs under tsx rather than as plain .mjs because it shares
// the definition schema with the composition and the /motion wizard, so a definition is validated
// by exactly one set of rules wherever it is read.
//
//   pnpm build:motion                     every definition
//   pnpm build:motion --only a-slug       one (or a comma-separated list)
//   pnpm build:motion --json              one JSON event per line, for the wizard's progress bar

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const definitionsDirectory = path.join(root, 'content', 'motion');
const outputDirectory = path.join(root, 'public', 'motion');

const argument = (name: string) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};
const only = argument('--only')?.split(',').filter(Boolean);
const json = process.argv.includes('--json');

const emit = (event: Record<string, unknown>) => {
  if (json) {
    console.log(JSON.stringify(event));
  } else if (event.type === 'rendered') {
    console.log(`public/motion/${event.slug}/${event.format}.mp4`);
  } else if (event.type === 'error') {
    console.error(event.message);
  }
};

type Entry = {slug: string; definition: MotionDefinition; caption: string};

async function readDefinitions(): Promise<Entry[]> {
  const files = (await readdir(definitionsDirectory).catch(() => [])).filter((file) => file.endsWith('.md')).sort();
  // Snippet references are resolved here, so every render uses the snippets as they are now.
  const catalog = await loadCatalog(root);
  const entries: Entry[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    if (!SLUG_PATTERN.test(slug)) throw new Error(`content/motion/${file}: the filename must be a lowercase slug.`);
    const source = await readFile(path.join(definitionsDirectory, file), 'utf8');
    const {definition, caption} = parseDefinitionFile(source, `content/motion/${file}`);
    try {
      entries.push({slug, definition: resolveDefinition(definition, catalog), caption});
    } catch (error) {
      throw new Error(`content/motion/${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return entries;
}

async function main() {
  const all = await readDefinitions();
  const selected = only ? all.filter((entry) => only.includes(entry.slug)) : all;
  if (only) {
    for (const slug of only) {
      if (!all.some((entry) => entry.slug === slug)) throw new Error(`No definition named content/motion/${slug}.md.`);
    }
  }

  emit({type: 'bundling'});
  const serveUrl = await bundle({
    entryPoint: path.join(root, 'video', 'src', 'chordlist-entry.ts'),
    publicDir: path.join(root, 'video', 'public'),
    // The same alias remotion.config.ts adds for the CLI: shared components import through @/.
    webpackOverride: (config) => ({
      ...config,
      resolve: {...config.resolve, alias: {...(config.resolve?.alias ?? {}), '@': root}},
    }),
  });
  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;

  const jobs = selected.flatMap((entry) => entry.definition.formats.map((format) => ({entry, format})));
  let done = 0;
  for (const {entry, format} of jobs) {
    const inputProps = {slug: entry.slug, definition: entry.definition};
    const composition = await selectComposition({serveUrl, id: `Motion-Custom-${format}`, inputProps, browserExecutable});
    const directory = path.join(outputDirectory, entry.slug);
    await mkdir(directory, {recursive: true});
    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      codec: 'h264',
      crf: 24,
      browserExecutable,
      outputLocation: path.join(directory, `${format}.mp4`),
      onProgress: ({progress}) => emit({type: 'progress', slug: entry.slug, format, progress: (done + progress) / jobs.length}),
    });
    await renderStill({
      serveUrl,
      composition,
      inputProps,
      browserExecutable,
      frame: composition.durationInFrames - 1,
      imageFormat: 'jpeg',
      jpegQuality: 82,
      output: path.join(directory, `${format}.jpg`),
    });
    done += 1;
    emit({type: 'rendered', slug: entry.slug, format, progress: done / jobs.length});
  }

  // The manifest always describes every definition, and a folder whose definition is gone is
  // pruned, so a deleted video stops resolving at a public URL, as `build:social` does for stills.
  const known = new Set(all.map((entry) => entry.slug));
  for (const folder of await readdir(outputDirectory).catch(() => [])) {
    if (folder !== 'manifest.json' && !known.has(folder)) await rm(path.join(outputDirectory, folder), {recursive: true});
  }
  const manifest = await Promise.all(
    all.map(async (entry) => {
      const rendered = new Set(await readdir(path.join(outputDirectory, entry.slug)).catch(() => []));
      return {
        slug: entry.slug,
        template: entry.definition.template,
        headline: entry.definition.headline,
        caption: entry.caption,
        seconds: totalSeconds(entry.definition),
        outputs: entry.definition.formats
          .filter((format) => rendered.has(`${format}.mp4`))
          .map((format) => ({format, video: `/motion/${entry.slug}/${format}.mp4`, poster: `/motion/${entry.slug}/${format}.jpg`})),
      };
    }),
  );
  await mkdir(outputDirectory, {recursive: true});
  await writeFile(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  emit({type: 'done', rendered: done});
}

main().catch((error: unknown) => {
  emit({type: 'error', message: error instanceof Error ? error.message : String(error)});
  process.exit(1);
});
