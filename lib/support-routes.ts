import type { Route } from "next"

import type { Language } from "@/locales"

/**
 * Where the support page lives in each language.
 *
 * Its own map rather than a rule, for the same reason `imprintHref` has one: a path-rewriting rule
 * would imply that every English route has a German twin, and most of them do not.
 */
export const supportHref = {
  en: "/support" as Route,
  de: "/de/support" as Route,
} as const satisfies Record<Language, Route>
