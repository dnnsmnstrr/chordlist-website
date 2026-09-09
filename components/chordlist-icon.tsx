import type { SVGProps } from 'react'
import mark from '@/design/mark.json'

/** Geometry vendored from the canonical app icon by design/sync.py. */
export function ChordlistIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={mark.viewBox} fill="currentColor" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      {mark.shapes.map(({ tag, ...attributes }, index) =>
        tag === 'path' ? <path key={index} {...attributes} /> : <rect key={index} {...attributes} />
      )}
    </svg>
  )
}
