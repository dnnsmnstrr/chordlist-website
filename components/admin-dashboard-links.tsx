import { siteConfig } from "@/lib/site-config"
import { adminCopy } from "@/locales/en"

type DashboardId = keyof typeof siteConfig.adminDashboards

const dashboards = Object.keys(siteConfig.adminDashboards) as DashboardId[]

/**
 * A row of third-party dashboards on `/admin`, each only its favicon. The icons are copies in
 * `public/admin/dashboards/`, named by the dashboard's key in `siteConfig.adminDashboards`, so the
 * page asks no other host for anything. Every link opens in a new tab.
 */
export function AdminDashboardLinks() {
  const { dashboards: copy } = adminCopy

  return (
    <nav aria-label={copy.label} className="mt-6 flex flex-wrap items-center gap-3">
      <h2 className="mr-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{copy.label}</h2>
      <ul className="flex flex-wrap gap-2">
        {dashboards.map((id) => (
          <li key={id}>
            <a
              href={siteConfig.adminDashboards[id]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.opensInNewTab(copy.names[id])}
              title={copy.names[id]}
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a 20px favicon, nothing to optimize */}
              <img src={`/admin/dashboards/${id}.png`} alt="" width={20} height={20} className="size-5 rounded-sm" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
