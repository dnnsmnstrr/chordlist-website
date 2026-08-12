import type { PostMeta } from "@/lib/blog"
import { primaryAppLink, siteConfig } from "@/lib/site-config"
import { blogCopy, commonCopy, faqCopy, homeCopy, locale, metadataCopy } from "@/locales/en"

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
 * schema.org description of the product and who makes it, for search engines and
 * anything else that reads structured data.
 *
 * Every human-readable value comes from siteConfig or locales/en, so this cannot
 * drift from the page around it. The remaining strings are schema.org vocabulary,
 * not copy — the same reason `openGraph.type` lives in app/layout.tsx.
 *
 * The Organization and WebSite nodes carry `@id`s that the other blocks on this
 * site reference, so a crawler reading a blog post or the FAQ resolves the same
 * publisher rather than inventing a second one.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.operator,
      url: siteConfig.url,
      logo: `${siteConfig.url}/apple-icon.png`,
      email: siteConfig.contact.support,
      sameAs: [siteConfig.social.x.url, siteConfig.social.instagram.url],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: siteConfig.url,
      description: metadataCopy.defaultDescription,
      inLanguage: locale.htmlLang,
      publisher: { "@id": organizationId },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteConfig.url}#app`,
      name: siteConfig.name,
      description: commonCopy.appDescription,
      url: siteConfig.url,
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

export function StructuredData() {
  return <JsonLd data={structuredData} />
}

/**
 * The FAQ page's questions and answers as schema.org data.
 *
 * Built from the same `faqCopy.questions` the page renders, which is what keeps
 * this honest: a rich result or an AI answer quoting it is quoting the page.
 */
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteConfig.url}/faq#faq`,
  name: faqCopy.metadata.title,
  description: faqCopy.metadata.description,
  inLanguage: locale.htmlLang,
  isPartOf: { "@id": websiteId },
  publisher: { "@id": organizationId },
  mainEntity: faqCopy.questions.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}

export function FaqStructuredData() {
  return <JsonLd data={faqStructuredData} />
}

/**
 * A blog post as a BlogPosting, with the breadcrumb that puts it under /blog.
 *
 * `dateModified` is the published date rather than a file timestamp: posts are
 * edited in place before they go live, and a build time would claim a revision
 * that never happened.
 */
export function BlogPostStructuredData({ post }: { post: PostMeta }) {
  const url = `${siteConfig.url}${post.href}`
  const image = `${siteConfig.url}${post.cover ?? `/blog/og/${post.slug}.png`}`

  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
        inLanguage: locale.htmlLang,
        isPartOf: { "@id": websiteId },
        mainEntityOfPage: url,
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        about: { "@id": `${siteConfig.url}#app` },
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
