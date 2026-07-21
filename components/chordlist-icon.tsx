import type { SVGProps } from "react"

/**
 * chordlist mark — two rounded "key" bars each with a thin descending stem.
 * Rebuilt from the provided design export. Uses currentColor so it inherits
 * the surrounding text color and adapts to light/dark themes.
 */
export function ChordlistIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 270 613"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* left key */}
      <rect x="0" y="0" width="76" height="375" rx="10" />
      <rect x="35.5" y="307" width="5" height="306" />
      {/* right key */}
      <rect x="194" y="0" width="76" height="375" rx="10" />
      <rect x="229.5" y="307" width="5" height="306" />
    </svg>
  )
}
