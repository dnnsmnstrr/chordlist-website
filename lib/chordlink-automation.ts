/** An iCloud Shortcut share link — the only kind of URL the automation routes will hand out. */
const shortcutUrlPattern = /^https:\/\/(?:www\.)?icloud\.com\/shortcuts\/[A-Za-z0-9_-]+\/?$/

export function isShortcutUrl(value: unknown): value is string {
  return typeof value === "string" && shortcutUrlPattern.test(value)
}

export function parseChordlinkAutomationUrl(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null
  const url = (value as Record<string, unknown>).url
  return isShortcutUrl(url) ? url : null
}

/**
 * Only serial numbers can carry a per-unit override. Anything else a tag might be named — `tour-2026`,
 * a typo — still gets the shared Shortcut rather than an error.
 */
export function automationOverridePublicId(value: string | null): string | null {
  const candidate = value?.trim().toLowerCase() ?? ""
  return /^[0-9]{2,6}$/.test(candidate) ? candidate : null
}
