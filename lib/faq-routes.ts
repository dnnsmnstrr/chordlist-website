import type { Route } from "next"

import type { Language } from "@/locales"

/** Where the FAQ lives in each language. Its own map, for the reasons in `lib/support-routes.ts`. */
export const faqHref = {
  en: "/faq" as Route,
  de: "/de/faq" as Route,
} as const satisfies Record<Language, Route>
