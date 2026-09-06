import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { videoSchema } from '../video/src/video-schema'
import { getCopy } from '../video/src/copy'

const fixture = {
  cut: 'standard', copyVariant: 'play-more', copyMode: 'preset',
  customCopy: getCopy('play-more'), accentColor: '#FAFAF8', paperSeed: 193,
  mediaPadding: 28, showShotLabels: false, musicFile: '', musicVolume: 0.18,
  voiceoverFile: '', voiceoverVolume: 1, manualClipFile: '', manualClipSeconds: 3,
  scenes: [],
  ...JSON.parse(readFileSync(new URL('../video/render-props/light.json', import.meta.url), 'utf8')),
}

test('existing video props remain valid without a named accent', () => {
  assert.equal(videoSchema.safeParse(fixture).success, true)
})

test('named campaign accents are readable on the video backdrop', () => {
  for (const accentPreset of ['neutral', 'blue', 'green', 'orange', 'pink', 'purple', 'teal']) {
    assert.equal(videoSchema.safeParse({ ...fixture, accentPreset }).success, true, accentPreset)
  }
})

test('custom accents reject unreadable and malformed colours', () => {
  for (const accentColor of ['#161411', 'red', '#fff', 'url(example)']) {
    assert.equal(videoSchema.safeParse({ ...fixture, accentPreset: 'custom', accentColor }).success, false)
  }
})
