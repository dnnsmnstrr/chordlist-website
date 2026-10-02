/** @type {import("next").NextConfig} */
const nextConfig = {
  typedRoutes: true,
  turbopack: { root: process.cwd() },
  // Next 16.3 appends its own agent-rules block to AGENTS.md whenever an AI agent runs `next dev`.
  // AGENTS.md and CLAUDE.md here are written by hand and round-trip through v0, so they stay ours.
  agentRules: false,

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
