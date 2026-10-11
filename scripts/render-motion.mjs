import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Renders every composition in the Motion folder (video/src/motion) to public/video/motion/, then
// writes public/video/motion/manifest.json, which /motion/library reads. Pass ids or prefixes to
// render a subset: `pnpm video:render:motion LogoSting Transpose-story`. `--manifest` skips the
// renders and only rewrites the manifest from the files already there.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Root out/ is ignored by both Git and ESLint, which would otherwise lint the bundled chunks.
const bundle = path.join(root, 'out', 'motion-bundle');
const outDir = path.join(root, 'public', 'video', 'motion');
const manifestOnly = process.argv.includes('--manifest');
const filters = process.argv.slice(2).filter((argument) => argument !== '--manifest');

const remotion = (...args) =>
  execFileSync('pnpm', ['exec', 'remotion', ...args], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']});

rmSync(bundle, {recursive: true, force: true});
remotion('bundle', 'video/src/chordlist-entry.ts', '--public-dir=video/public', `--out-dir=${bundle}`, '--log=error');

// The listing prints one row per composition: id, fps, size, and duration in frames. The
// Motion-Custom-* compositions belong to `pnpm build:motion`, not to this suite.
const all = [...remotion('compositions', bundle).matchAll(/^(Motion-\S+)\s+(\d+)\s+(\d+)x(\d+)\s+(\d+)/gm)]
  .map(([, id, fps, width, height, frames]) => ({id, fps: Number(fps), width: Number(width), height: Number(height), frames: Number(frames)}))
  .filter(({id}) => !id.startsWith('Motion-Custom-'));
const compositions = all.filter(({id}) => filters.length === 0 || filters.some((filter) => id.slice('Motion-'.length).startsWith(filter)));

// Motion-ChordlinkTap-story → chordlink-tap-story.
const fileName = (id) => id.slice('Motion-'.length).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

mkdirSync(outDir, {recursive: true});
for (const {id, frames} of manifestOnly ? [] : compositions) {
  const name = fileName(id);
  const file = path.join(outDir, `${name}.mp4`);
  remotion('render', bundle, id, file, '--codec=h264', '--crf=24', '--log=error');
  const poster = path.join(outDir, `${name}.jpg`);
  // Every piece ends on its resolved state, so the last frame is the poster.
  remotion('still', bundle, id, poster, `--frame=${frames - 1}`, '--image-format=jpeg', '--jpeg-quality=82', '--log=error');
  console.log(`${path.relative(root, file)}  ${(statSync(file).size / 1e6).toFixed(1)} MB`);
}

// One entry per piece, in the order MotionRoot registers them, listing the formats that have a
// rendered file — so the library never offers a download that is not there.
const pieces = new Map();
for (const {id, fps, width, height, frames} of all) {
  const name = fileName(id);
  const format = name.slice(name.lastIndexOf('-') + 1);
  const slug = name.slice(0, name.lastIndexOf('-'));
  const file = path.join(outDir, `${name}.mp4`);
  if (!existsSync(file)) continue;
  if (!pieces.has(slug)) pieces.set(slug, {slug, seconds: Math.round((frames / fps) * 10) / 10, formats: []});
  pieces.get(slug).formats.push({
    format,
    width,
    height,
    bytes: statSync(file).size,
    video: `/video/motion/${name}.mp4`,
    poster: `/video/motion/${name}.jpg`,
  });
}
writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify([...pieces.values()], null, 2)}\n`);
console.log(`public/video/motion/manifest.json  ${pieces.size} pieces`);
