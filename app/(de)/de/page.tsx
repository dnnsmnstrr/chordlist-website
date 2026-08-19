import { HomePage } from "@/components/home-page"

/**
 * The German home page.
 *
 * Its title, description, and social card come from `rootMetadata("de")` in the `(de)` root
 * layout, which is the only route this layout wraps.
 */
export default function Page() {
  return <HomePage language="de" />
}
