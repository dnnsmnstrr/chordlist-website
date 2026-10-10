import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Renders every composition in the Motion folder (video/src/motion) to public/video/motion/.
// Pass ids or prefixes to render a subset: `pnpm video:render:motion LogoSting Transpose-story`.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Root out/ is ignored by both Git and ESLint, which would otherwise lint the bundled chunks.
const bundle = path.join(root, 'out', 'motion-bundle');
const outDir = path.join(root, 'public', 'video', 'motion');
const filters = process.argv.slice(2);

const remotion = (...args) =>
  execFileSync('pnpm', ['exec', 'remotion', ...args], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']});

rmSync(bundle, {recursive: true, force: true});
remotion('bundle', 'video/src/chordlist-entry.ts', '--public-dir=video/public', `--out-dir=${bundle}`, '--log=error');

// The listing prints one row per composition: id, fps, size, and duration in frames.
const compositions = [...remotion('compositions', bundle).matchAll(/^(Motion-\S+)\s+\d+\s+\d+x\d+\s+(\d+)/gm)]
  .map(([, id, frames]) => ({id, frames: Number(frames)}))
  .filter(({id}) => filters.length === 0 || filters.some((filter) => id.slice('Motion-'.length).startsWith(filter)));

mkdirSync(outDir, {recursive: true});
for (const {id, frames} of compositions) {
  const name = id.slice('Motion-'.length).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const file = path.join(outDir, `${name}.mp4`);
  remotion('render', bundle, id, file, '--codec=h264', '--crf=24', '--log=error');
  const poster = path.join(outDir, `${name}.jpg`);
  // Every piece ends on its resolved state, so the last frame is the poster.
  remotion('still', bundle, id, poster, `--frame=${frames - 1}`, '--image-format=jpeg', '--jpeg-quality=82', '--log=error');
  console.log(`${path.relative(root, file)}  ${(statSync(file).size / 1e6).toFixed(1)} MB`);
}
