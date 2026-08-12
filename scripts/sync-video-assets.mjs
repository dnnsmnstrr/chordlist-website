import {access, cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = process.env.CHORDLIST_APP_REPO
  ? path.resolve(process.env.CHORDLIST_APP_REPO)
  : path.resolve(websiteRoot, '..', 'chordlist-app');
const appVideoDirectory = path.join(appRoot, 'press-kit', 'video');
const generatedDirectory = path.join(appVideoDirectory, 'editor', 'generated');
const publicDirectory = path.join(websiteRoot, 'video', 'public', 'generated');
const manifestPath = path.join(websiteRoot, 'video', 'src', 'generated', 'asset-manifest.json');
const appearances = ['light', 'dark'];
const colorScrollFilename = 'smooth-color-scroll-light-only.mp4';
const colorScrollSource = path.join(
  appVideoDirectory,
  'theme-colors',
  colorScrollFilename,
);

const exists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

if (!(await exists(appRoot))) {
  throw new Error(
    `App repository not found at ${appRoot}. Set CHORDLIST_APP_REPO to its location.`,
  );
}

const secondsFromTimecode = (value) => {
  const [hours, minutes, seconds] = value.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'scene';

const parseVtt = (contents) =>
  contents
    .replace(/^WEBVTT\s*/, '')
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length >= 2 && lines[1].includes(' --> '))
    .map((lines) => {
      const [start, end] = lines[1].split(' --> ');
      return {
        title: lines[0],
        summary: lines.slice(2).join(' '),
        durationInSeconds: Number(
          (secondsFromTimecode(end) - secondsFromTimecode(start)).toFixed(3),
        ),
      };
    });

const manifest = {
  light: [],
  dark: [],
  featured: {
    colorScroll: {
      title: 'Theme colour autoscroll',
      summary:
        'One continuous hands-free scroll moves through every light accent colour without jumping.',
      durationInSeconds: 8,
      file: `generated/featured/${colorScrollFilename}`,
      poster: null,
    },
  },
};

for (const appearance of appearances) {
  const sourceDirectory = path.join(generatedDirectory, appearance);
  const destinationDirectory = path.join(publicDirectory, appearance);
  const vttPath = path.join(appVideoDirectory, `chordlist-demo-${appearance}.chapters.vtt`);

  let filenames;
  try {
    filenames = await readdir(sourceDirectory);
  } catch {
    throw new Error(
      `Missing ${sourceDirectory}. Run scripts/prepare-video-editor-assets.sh in the app repository first.`,
    );
  }

  const cues = parseVtt(await readFile(vttPath, 'utf8'));
  await rm(destinationDirectory, {recursive: true, force: true});
  await mkdir(destinationDirectory, {recursive: true});

  for (const [index, cue] of cues.entries()) {
    const prefix = `${String(index + 1).padStart(2, '0')}-${slugify(cue.title)}`;
    const videoFilename = `${prefix}.mp4`;
    const posterFilename = `${prefix}-poster.png`;

    if (!filenames.includes(videoFilename)) {
      throw new Error(
        `Missing ${videoFilename}. Refresh the generated clips in the app repository first.`,
      );
    }

    await cp(
      path.join(sourceDirectory, videoFilename),
      path.join(destinationDirectory, videoFilename),
    );

    if (filenames.includes(posterFilename)) {
      await cp(
        path.join(sourceDirectory, posterFilename),
        path.join(destinationDirectory, posterFilename),
      );
    }

    manifest[appearance].push({
      ...cue,
      file: `generated/${appearance}/${videoFilename}`,
      poster: filenames.includes(posterFilename)
        ? `generated/${appearance}/${posterFilename}`
        : null,
    });
  }
}

if (!(await exists(colorScrollSource))) {
  throw new Error(
    `Missing ${colorScrollSource}. Run regenerate-color-scroll-videos.sh in the app repository first.`,
  );
}

const featuredDirectory = path.join(publicDirectory, 'featured');
await mkdir(featuredDirectory, {recursive: true});
await cp(colorScrollSource, path.join(featuredDirectory, colorScrollFilename));

const websiteVideoDirectory = path.join(websiteRoot, 'public', 'video');
await mkdir(websiteVideoDirectory, {recursive: true});
await cp(colorScrollSource, path.join(websiteVideoDirectory, colorScrollFilename));

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Synced ${manifest.light.length} light clips, ${manifest.dark.length} dark clips, and the featured colour scroll.`,
);
