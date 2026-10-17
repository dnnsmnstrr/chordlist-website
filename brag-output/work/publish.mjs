// Muxes the brag renders into the finished launch videos and writes them, their posters, and
// public/video/launch/manifest.json, which /motion/library reads. Run after rendering the silent
// cuts and the soundtracks (see ../brag-plan.md):
//
//   node brag-output/work/publish.mjs
//
// Each video is its silent render, the soundtrack loudness-normalized to −14 LUFS, and the poster
// baked in as frame 0 so every platform's thumbnail shows it.
import {execFileSync} from "node:child_process"
import {mkdirSync, readFileSync, statSync, writeFileSync} from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"

const work = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(work, "..", "..")
const outDir = path.join(root, "public", "video", "launch")

const posters = {wide: "poster.png", story: "poster-vertical.png"}
const pieces = [
  {
    slug: "launch-video",
    soundtrack: "soundtrack.wav",
    renders: {story: "vertical-silent.mp4", wide: "video-silent.mp4"},
  },
  {
    slug: "launch-video-piano",
    soundtrack: "soundtrack-piano.wav",
    renders: {story: "vertical-silent-piano.mp4", wide: "video-silent-piano.mp4"},
  },
]

const ffmpeg = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], {stdio: "inherit"})
const probe = (file) =>
  JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height:format=duration", "-of", "json", file], {
      encoding: "utf8",
    }),
  )

mkdirSync(outDir, {recursive: true})

// Both soundtracks share the same picture timing, so a format's poster serves either piece.
for (const [format, poster] of Object.entries(posters)) {
  ffmpeg("-i", path.join(work, poster), "-q:v", "3", path.join(outDir, `launch-video-${format}.jpg`))
}

const caption = readFileSync(path.join(work, "..", "share-copy.txt"), "utf8").trim()
const manifest = pieces.map(({slug, soundtrack, renders}) => {
  let seconds = 0
  const formats = Object.entries(renders).map(([format, render]) => {
    const file = path.join(outDir, `${slug}-${format}.mp4`)
    ffmpeg(
      "-i", path.join(work, render),
      "-i", path.join(work, posters[format]),
      "-i", path.join(work, soundtrack),
      "-filter_complex", "[0:v][1:v]overlay=enable='eq(n,0)',format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=7[a]",
      "-map", "[v]", "-map", "[a]",
      "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-r", "30",
      "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
      "-movflags", "+faststart", "-shortest",
      file,
    )
    const {streams, format: container} = probe(file)
    const video = streams.find((stream) => stream.width)
    console.log(`${path.relative(root, file)}  ${(statSync(file).size / 1e6).toFixed(1)} MB`)
    seconds = Math.round(Number(container.duration) * 10) / 10
    return {
      format,
      width: video.width,
      height: video.height,
      bytes: statSync(file).size,
      video: `/video/launch/${slug}-${format}.mp4`,
      poster: `/video/launch/launch-video-${format}.jpg`,
    }
  })
  return {slug, seconds, caption, formats}
})

writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`public/video/launch/manifest.json  ${manifest.length} pieces`)
