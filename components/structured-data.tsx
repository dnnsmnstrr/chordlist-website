import type { PostMeta } from "@/lib/blog"
import { faqHref } from "@/lib/faq-routes"
import { plainInlineText } from "@/lib/inline-markup"
import { primaryAppLink, siteConfig } from "@/lib/site-config"
import { defaultLanguage, dictionary, homeHref, type Language } from "@/locales"
import { blogCopy } from "@/locales/en"

const organizationId = `${siteConfig.url}#organization`
const websiteId = `${siteConfig.url}#website`

/**
 * One JSON-LD block.
 *
 * JSON.stringify leaves "<" alone, which could close this script tag early if a
 * copy string ever contained one.
 */
function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c")

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

/**
 * Who publishes this site, and the site itself.
 *
 * Both nodes are emitted in full on every page that references them, not just on
 * the home page. A validator reading one post in isolation does not fetch the
 * home page to resolve `{"@id": …}`, so a bare reference leaves an Article
 * without the author and publisher it needs. Repeating the node is what makes
 * each page's graph stand on its own; the stable `@id`s are what let a crawler
 * that reads several pages collapse them back into one publisher.
 */
const organizationNode = {
  "@type": "Organization",
  "@id": organizationId,
  name: siteConfig.operator,
  url: siteConfig.url,
  logo: `${siteConfig.url}/apple-icon.png`,
  email: siteConfig.contact.support,
  sameAs: [siteConfig.social.x.url, siteConfig.social.instagram.url],
}

/**
 * The site, described in the language of the page emitting it.
 *
 * The `@id` is stable across languages on purpose — it is one website — while `inLanguage` and the
 * description follow the page, so a validator reading the German home page is not told the page it
 * is looking at is English.
 */
function websiteNode(language: Language) {
  const { locale, metadata: metadataCopy } = dictionary(language)

  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: metadataCopy.defaultDescription,
    inLanguage: locale.htmlLang,
    publisher: { "@id": organizationId },
  }
}

/**
 * schema.org description of the product and who makes it, for search engines and
 * anything else that reads structured data.
 *
 * Every human-readable value comes from siteConfig or locales/en, so this cannot
 * drift from the page around it. The remaining strings are schema.org vocabulary,
 * not copy — the same reason `openGraph.type` lives in app/layout.tsx.
 */
function structuredData(language: Language) {
  const { common: commonCopy, home: homeCopy } = dictionary(language)
  const url = `${siteConfig.url}${homeHref[language] === "/" ? "" : homeHref[language]}`

  return {
  "@context": "https://schema.org",
  "@graph": [
    organizationNode,
    websiteNode(language),
    {
      "@type": "SoftwareApplication",
      "@id": `${siteConfig.url}#app`,
      name: siteConfig.name,
      description: commonCopy.appDescription,
      url,
      applicationCategory: "MusicApplication",
      operatingSystem: `iOS ${siteConfig.minimumOSVersion}, iPadOS ${siteConfig.minimumOSVersion}`,
      image: `${siteConfig.url}/og.png`,
      // Pricing is not final, so there is no `offers` node here. Do not add one
      // until the App Store listing settles it — see the content accuracy rules.
      featureList: homeCopy.features.items.map((item) => item.title),
      softwareHelp: { "@type": "CreativeWork", url: `${siteConfig.url}/docs` },
      publisher: { "@id": organizationId },
      author: { "@id": organizationId },
      ...(primaryAppLink === null ? {} : { downloadUrl: primaryAppLink }),
    },
  ],
  }
}

export function StructuredData({ language = defaultLanguage }: { language?: Language }) {
  return <JsonLd data={structuredData(language)} />
}

/**
 * The FAQ page's questions and answers as schema.org data, in the language it renders in.
 *
 * Built from the same questions the page renders, which is what keeps this honest: a rich result or
 * an AI answer quoting it is quoting the page. The German page carries its own block, at its own
 * URL and with `inLanguage` to match — one FAQPage node claiming both would describe neither.
 */
function faqStructuredData(language: Language) {
  const copy = dictionary(language).faq

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode,
      websiteNode(language),
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.url}${faqHref[language]}#faq`,
        name: copy.metadata.title,
        description: copy.metadata.description,
        inLanguage: dictionary(language).locale.htmlLang,
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        // Stripped rather than rendered: an answer may carry the inline markup copy is allowed to
        // use, and a tag reaching a rich result would misquote the page.
        mainEntity: copy.questions.map((item) => ({
          "@type": "Question",
          name: plainInlineText(item.question),
          acceptedAnswer: { "@type": "Answer", text: plainInlineText(item.answer) },
        })),
      },
    ],
  }
}

export function FaqStructuredData({ language = defaultLanguage }: { language?: Language }) {
  return <JsonLd data={faqStructuredData(language)} />
}

/**
 * A blog post as a BlogPosting, with the breadcrumb that puts it under /blog.
 *
 * `dateModified` is the published date rather than a file timestamp: posts are
 * edited in place before they go live, and a build time would claim a revision
 * that never happened.
 *
 * The post does not point `about` at the SoftwareApplication node: that node
 * belongs to the home page, and repeating app markup on an article would be
 * describing something other than the page it sits on.
 */
export function BlogPostStructuredData({ post }: { post: PostMeta }) {
  const url = `${siteConfig.url}${post.href}`
  const image = `${siteConfig.url}${post.cover ?? `/blog/og/${post.slug}.png`}`

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode,
      websiteNode(defaultLanguage),
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: post.title,
        description: post.description,
        url,
        image,
        datePublished: post.publishedISO,
        dateModified: post.publishedISO,
        keywords: post.tags.map((tag) => blogCopy.tags[tag]),
        inLanguage: dictionary(defaultLanguage).locale.htmlLang,
        isPartOf: { "@id": websiteId },
        mainEntityOfPage: url,
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: siteConfig.name, item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: blogCopy.metadata.title, item: `${siteConfig.url}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return <JsonLd data={data} />
}
