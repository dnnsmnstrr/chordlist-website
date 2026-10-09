/// Hashtags for social posts: the suggestions the editor offers, and how a post's tags are
/// cleaned, stored and written out.
///
/// Definitions store tags without the `#`. In YAML a `#` starts a comment, so `- #songbook`
/// would quietly become an empty list entry; the `#` is added back only when a caption is copied.

/// Instagram accepts at most five hashtags on a post. The editor counts against this and the build
/// warns past it, rather than refusing: X and Mastodon posts may reasonably carry fewer or more.
export const hashtagLimit = 5

/// Tags that fit what chordlist is and who it is for, grouped by the audience they reach. The
/// editor also suggests every tag already used in `content/social/`, so a tag added to one post is
/// offered for the next without being added here.
export const hashtagGroups: { label: string; tags: string[] }[] = [
  {
    label: "Songbook",
    tags: ["songbook", "setlist", "chordlist", "hobbymusician", "musicians"],
  },
  {
    label: "Guitar and ukulele",
    tags: ["guitarchords", "guitarpractice", "acousticguitar", "guitarlessons", "ukulele", "ukulelechords"],
  },
  {
    label: "Piano",
    tags: ["pianochords", "pianopractice", "sheetmusic", "jazzpiano"],
  },
  {
    label: "Harmony",
    tags: ["chordprogression", "musictheory", "eartraining", "songwriting", "blues", "bluesguitar", "jazz", "jazzguitar"],
  },
  {
    label: "Plain text",
    tags: ["markdown", "plaintext", "obsidianmd", "localfirst", "privacy"],
  },
  {
    label: "App",
    tags: ["musicapp", "iosapp", "ipadapp", "indiedev", "indieapp", "buildinpublic"],
  },
  {
    label: "German",
    tags: ["gitarre", "akkorde", "klavier", "musikapp"],
  },
]

export const suggestedHashtags = hashtagGroups.flatMap((group) => group.tags)

/// A tag as stored: no `#`, no spaces or punctuation. Letters keep their case, since
/// `#BuildInPublic` reads better to a screen reader than `#buildinpublic`; duplicates are
/// compared case-insensitively.
export function normalizeHashtag(input: string): string {
  return input.trim().replace(/^#+/, "").replace(/[^\p{L}\p{N}_]+/gu, "")
}

/// Cleans a list of tags, dropping empties and case-insensitive duplicates, first one wins.
export function normalizeHashtags(values: unknown): string[] {
  if (!Array.isArray(values)) return []
  const seen = new Set<string>()
  const tags: string[] = []
  for (const value of values) {
    const tag = normalizeHashtag(String(value))
    const key = tag.toLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

/// `#songbook #iosapp`, for the end of a caption.
export function formatHashtags(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(" ")
}

/// The caption as it is posted: the reviewed text, then the post's hashtags on their own line.
export function captionWithHashtags(caption: string, tags: string[]): string {
  const hashtags = formatHashtags(tags)
  return hashtags ? `${caption.trim()}\n\n${hashtags}` : caption.trim()
}
