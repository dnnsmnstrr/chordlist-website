/** @type {import("next").NextConfig} */
const nextConfig = {
  typedRoutes: true,

  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ]
  },

  // The blog reads content/blog with readdir, which the bundle tracer cannot follow
  // statically. Without this the .md files are dropped from the serverless bundle and
  // these routes fail in production once they revalidate.
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
    "/blog/rss.xml": ["./content/blog/**/*"],
    "/sitemap.xml": ["./content/blog/**/*"],
  },
}

export default nextConfig
