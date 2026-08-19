import type { Route } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { dictionary, languageNames, type Language } from "@/locales"

type LanguageSwitcherProps = {
  /** The language the surrounding page is rendered in. */
  current: Language
  /** This same page in every language it exists in, the current one included. */
  alternates: Partial<Record<Language, Route>>
  className?: string
}

/**
 * The other languages this page exists in.
 *
 * It takes the alternates rather than deriving them, because only the home page is translated: a
 * switcher that appeared on `/docs` could only send a German reader to the German home page, which
 * loses their place and implies a translation that is not there. A route with nothing to offer
 * passes nothing and renders no switch at all.
 */
export function LanguageSwitcher({ current, alternates, className }: LanguageSwitcherProps) {
  const others = (Object.entries(alternates) as [Language, Route][]).filter(([language]) => language !== current)
  if (others.length === 0) return null

  return (
    <nav aria-label={dictionary(current).common.navigation.languageLabel} className={cn("flex items-center", className)}>
      {others.map(([language, href]) => (
        <Link
          key={language}
          href={href}
          hrefLang={language}
          lang={language}
          className="rounded-md font-mono text-xs uppercase tracking-widest transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {languageNames[language]}
        </Link>
      ))}
    </nav>
  )
}
