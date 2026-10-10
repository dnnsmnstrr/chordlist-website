import {access, copyFile, mkdir, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Copies the inputs of the motion suite (video/src/motion) into Remotion's ignored media folder.
// Screenshots always come from this repository's synced copies; the screen recordings come from
// the app repository's press kit when a checkout is available, and are skipped otherwise.
const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(websiteRoot, 'video', 'public', 'generated', 'motion');

const exists = async (filePath) => access(filePath).then(() => true, () => false);

const appCandidates = [
  process.env.CHORDLIST_APP_REPO,
  path.resolve(websiteRoot, '..', 'chordlist-app'),
  path.resolve(websiteRoot, '..', 'chordlist'),
].filter(Boolean);

let appRoot = null;
for (const candidate of appCandidates) {
  if (await exists(path.join(candidate, 'press-kit', 'video'))) {
    appRoot = path.resolve(candidate);
    break;
  }
}

let copied = 0;
const copy = async (from, to) => {
  await mkdir(path.dirname(to), {recursive: true});
  await copyFile(from, to);
  copied += 1;
};

for (const appearance of ['light', 'dark']) {
  const source = path.join(websiteRoot, 'public', 'app-screenshots', appearance);
  for (const file of await readdir(source)) {
    if (!file.endsWith('.png')) continue;
    await copy(path.join(source, file), path.join(target, 'screens', appearance, file));
  }
}

await copy(
  path.join(websiteRoot, 'public', 'video', 'smooth-color-scroll-light-only.mp4'),
  path.join(target, 'press', 'smooth-color-scroll-light-only.mp4'),
);

if (appRoot) {
  const videoRoot = path.join(appRoot, 'press-kit', 'video');
  for (const appearance of ['light', 'dark']) {
    const file = `chordlist-demo-${appearance}.mp4`;
    await copy(path.join(videoRoot, file), path.join(target, 'press', file));
  }
  for (const file of await readdir(path.join(videoRoot, 'theme-colors'))) {
    if (file.startsWith('chordlist-autoscroll-') && file.endsWith('.mp4')) {
      await copy(path.join(videoRoot, 'theme-colors', file), path.join(target, 'press', file));
    }
  }
} else {
  console.warn('App repository not found; recordings were not refreshed. Set CHORDLIST_APP_REPO.');
}

console.log(`Synced ${copied} motion inputs into ${path.relative(websiteRoot, target)}`);
