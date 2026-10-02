import Image from "next/image"

import { siteConfig } from "@/lib/site-config"
import { blogCopy } from "@/locales/en"

const { author } = siteConfig

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** A portrait when `siteConfig.author.photo` is set, initials until then. */
function AuthorAvatar({ size }: { size: number }) {
  if (author.photo) {
    return (
      <Image
        src={author.photo}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-border object-cover"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono text-sm text-muted-foreground"
    >
      {initials(author.name)}
    </span>
  )
}

/** The name under a post's title. */
export function PostByline() {
  return (
    <p className="flex items-center gap-2.5 text-sm">
      <AuthorAvatar size={28} />
      <span>{blogCopy.author.byline(author.name)}</span>
    </p>
  )
}

/** Who wrote the post and how to reach them, after the article. */
export function AuthorCard() {
  return (
    <section
      aria-labelledby="about-the-author"
      className="mt-16 flex flex-col gap-4 rounded-xl border border-border p-6 sm:flex-row sm:items-start"
    >
      <AuthorAvatar size={56} />
      <div className="flex flex-col gap-2">
        <h2 id="about-the-author" className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {blogCopy.author.title}
        </h2>
        <p className="font-semibold tracking-tight">{author.name}</p>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{blogCopy.author.bio}</p>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {blogCopy.author.contact}{" "}
          <a
            href={`mailto:${siteConfig.contact.feedback}`}
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            {blogCopy.author.contactLink}
          </a>
        </p>
        {author.links.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {author.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} rel="me" className="underline underline-offset-4 hover:no-underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
