/**
 * The ready-made iCloud Shortcut that turns a chordlink scan into an instant app launch.
 *
 * The URL is operator-editable in the backend admin, which is the whole point — the site reads the
 * current one rather than carrying a copy that goes stale the day it is changed. It arrives over
 * the network and is rendered into an `href`, so it is validated here as well as in the backend
 * that served it: a link the operator can edit is a link worth checking at both ends.
 */
const automationUrlPattern = /^https:\/\/(?:www\.)?icloud\.com\/shortcuts\/[A-Za-z0-9_-]+\/?$/

export function parseChordlinkAutomationUrl(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null
  const url = (value as Record<string, unknown>).url
  if (typeof url !== "string") return null
  return automationUrlPattern.test(url) ? url : null
}
