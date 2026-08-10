import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { AmbientBackground } from "@/components/ambient-background"
import { siteConfig } from "@/lib/site-config"
import { commonCopy, locale, metadataCopy } from "@/locales/en"

import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: metadataCopy.defaultTitle,
    template: metadataCopy.titleTemplate,
  },
  description: commonCopy.appDescription,
  category: metadataCopy.category,
  creator: siteConfig.operator,
  publisher: siteConfig.operator,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: locale.openGraph,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: metadataCopy.socialTitle,
    description: commonCopy.appDescription,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: metadataCopy.socialImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.x.handle,
    creator: siteConfig.social.x.handle,
    title: metadataCopy.socialTitle,
    description: commonCopy.appDescription,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      { url: "/icon-light-32x32.png", type: "image/png", sizes: "32x32", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", type: "image/png", sizes: "32x32", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={locale.htmlLang} className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {/* First thing in the tab order on every page: one Tab, one Enter, past the
            header nav and into the content. Invisible until it takes focus. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {commonCopy.skipToContent}
        </a>
        <AmbientBackground />
        <div className="site-content">{children}</div>
        {process.env.NODE_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  )
}
