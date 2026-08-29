import type { Route } from "next"

import type { Language } from "@/locales"

export const imprintHref = {
  en: "/imprint" as Route,
  de: "/de/impressum" as Route,
} as const satisfies Record<Language, Route>
