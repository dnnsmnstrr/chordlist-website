import "server-only"

import { getPublishedPosts } from "@/lib/blog"
import { docsSearchEntries } from "@/lib/docs-search"
import { faqQuestionId, faqSearchText, type FaqEntry } from "@/lib/faq"
import { faqHref } from "@/lib/faq-routes"
import { plainInlineText } from "@/lib/inline-markup"
import type { SiteSearchEntry } from "@/lib/site-search"
import { supportHref } from "@/lib/support-routes"
import { dictionary, type Language } from "@/locales"
import { blogCopy } from "@/locales/en"

function questionEntries(page: "faq" | "support", href: string, questions: readonly FaqEntry[]): SiteSearchEntry[] {
  return questions.map((entry) => ({
    page,
    href: `${href}#${faqQuestionId(entry.question)}`,
    title: plainInlineText(entry.question),
    text: plainInlineText(entry.answer),
    // Everything else the question list matches on — its link label and aliases.
    keywords: [faqSearchText({ question: "", answer: "", link: entry.link, keywords: entry.keywords })],
  }))
}

/**
 * Everything the site-wide search can find, for one language.
 *
 * The FAQ and support answers are in that language. The docs and the blog exist only in English, so
 * every language gets them as they are — the same choice the header makes by linking a German
 * reader to the English docs rather than to a translation that does not exist.
 */
export async function siteSearchIndex(language: Language): Promise<SiteSearchEntry[]> {
  const { faq, support } = dictionary(language)
  const posts = await getPublishedPosts()

  return [
    ...questionEntries("support", supportHref[language], support.questions),
    ...questionEntries("faq", faqHref[language], faq.questions),
    ...docsSearchEntries().map((entry) => ({
      page: "docs" as const,
      href: `/docs#${entry.targetId}`,
      title: entry.title,
      text: entry.text,
      keywords: [entry.section, ...entry.keywords],
    })),
    ...posts.map((post) => ({
      page: "blog" as const,
      href: post.href,
      title: post.title,
      text: post.description,
      keywords: post.tags.map((tag) => blogCopy.tags[tag]),
    })),
  ]
}
