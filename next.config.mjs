/** @type {import("next").NextConfig} */
const nextConfig = {
  typedRoutes: true,

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
