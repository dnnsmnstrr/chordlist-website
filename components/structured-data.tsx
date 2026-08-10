import { primaryAppLink, siteConfig } from "@/lib/site-config"
import { commonCopy, homeCopy } from "@/locales/en"

const organizationId = `${siteConfig.url}#organization`

/**
 * schema.org description of the product and who makes it, for search engines and
 * anything else that reads structured data.
 *
 * Every human-readable value comes from siteConfig or locales/en, so this cannot
 * drift from the page around it. The remaining strings are schema.org vocabulary,
 * not copy — the same reason `openGraph.type` lives in app/layout.tsx.
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

// JSON.stringify leaves "<" alone, which could close this script tag early if a
// copy string ever contained one.
const json = JSON.stringify(structuredData).replace(/</g, "\\u003c")

export function StructuredData() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  )
}
