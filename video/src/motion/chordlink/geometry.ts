import * as THREE from 'three';

// The chordlink tag's geometry, ported from the configurator in public/model.html (its `build`
// function) at the defaults the first edition is printed with. Units are millimetres, y up, the
// bed at y = 0, so a print layer is a horizontal slice.
//
// It is rebuilt here rather than loaded from public/models/chordlink.glb because the print needs
// what the finished model hides: the floor under the pocket, the pocket itself, and the lid over
// it, each as its own body.

export const TAG = {
  size: 32, // squircle width
  plate: 1.2, // plate thickness
  nfcDiameter: 27, // the NFC sticker
  nfcHeight: 0.4,
  relief: 0.4, // the raised keys of the logo
  stem: 1.5, // how much the logo's hairline stems are widened to print
  layer: 0.1, // drawn layer height: twice as many slices as a 0.2 mm print, so the build reads
} as const;

// model.html: the cavity is one millimetre wider than the tag and the spare thickness is split so
// the tag sits mid-plate: floor 0–0.4, pocket 0.4–0.8, lid 0.8–1.2.
const spare = TAG.plate - TAG.nfcHeight;
const roof = Math.min(1.4, spare / 2);
export const LEVELS = {
  ceil: TAG.plate - roof,
  floor: TAG.plate - roof - TAG.nfcHeight,
  top: TAG.plate,
  reliefTop: TAG.plate + TAG.relief,
  pocketDiameter: Math.min(TAG.nfcDiameter + 1, TAG.size - 4),
} as const;

/** model.html's squircle: a superellipse with exponent 4.6, the app icon's outline. */
export function squirclePoints(size: number, n = 4.6, steps = 160): [number, number][] {
  const a = size / 2;
  const points: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    points.push([a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), a * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]);
  }
  return points;
}

function rectPoints(cx: number, cy: number, w: number, h: number, r: number, seg = 6): [number, number][] {
  const points: [number, number][] = [];
  const corners: [number, number, number][] = [
    [cx + w / 2 - r, cy + h / 2 - r, 0],
    [cx - w / 2 + r, cy + h / 2 - r, Math.PI / 2],
    [cx - w / 2 + r, cy - h / 2 + r, Math.PI],
    [cx + w / 2 - r, cy - h / 2 + r, -Math.PI / 2],
  ];
  for (const [ax, ay, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      points.push([ax + r * Math.cos(a), ay + r * Math.sin(a)]);
    }
  }
  return points;
}

// Sutherland–Hodgman against the convex squircle, as model.html clips the logo to the plate edge.
function clipToConvex(subject: [number, number][], clip: [number, number][]) {
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i]!;
    const b = clip[(i + 1) % clip.length]!;
    const side = (p: [number, number]) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const current = input[j]!;
      const previous = input[(j + input.length - 1) % input.length]!;
      const dc = side(current);
      const dp = side(previous);
      if (dc >= 0) {
        if (dp < 0) {
          const t = dp / (dp - dc);
          out.push([previous[0] + t * (current[0] - previous[0]), previous[1] + t * (current[1] - previous[1])]);
        }
        out.push(current);
      } else if (dp >= 0) {
        const t = dp / (dp - dc);
        out.push([previous[0] + t * (current[0] - previous[0]), previous[1] + t * (current[1] - previous[1])]);
      }
    }
  }
  return out;
}

function shape(points: [number, number][], holes: [number, number][][] = [], circleHole?: number) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  for (const hole of holes) {
    const path = new THREE.Path();
    hole.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
    path.closePath();
    s.holes.push(path);
  }
  if (circleHole) {
    const path = new THREE.Path();
    path.absarc(0, 0, circleHole / 2, 0, Math.PI * 2, true);
    s.holes.push(path);
  }
  return s;
}

/** A horizontal slab of `shapes` between y0 and y1, lying flat on the bed. */
export function slab(shapes: THREE.Shape[], y0: number, y1: number) {
  const geometry = new THREE.ExtrudeGeometry(shapes, {depth: y1 - y0, bevelEnabled: false, curveSegments: 48});
  // Extruded along +z in the shape's plane; turned so the shape lies in x/z and grows up in y.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, y0, 0);
  return geometry;
}

const outline = squirclePoints(TAG.size);

/** The plate's cross-section at height y: solid, or ringed around the pocket. */
export function plateShapeAt(y: number) {
  const inPocket = y >= LEVELS.floor - 1e-6 && y < LEVELS.ceil - 1e-6;
  return [shape(outline, [], inPocket ? LEVELS.pocketDiameter : undefined)];
}

/** The logo's two keys and their stems, as model.html lays them out on the lid (graphite). */
export function logoShapes() {
  const K = TAG.size / 613; // the mark's 270 × 613 viewBox, fitted to the plate height
  const barW = 76 * K;
  const barH = 375 * K;
  const barR = 10 * K;
  const stemW = 5 * K * TAG.stem;
  const barX = (270 * K) / 2 - barW / 2;
  const stemX = (270 * K) / 2 - 38 * K;
  const py = (svgY: number) => (306.5 - svgY) * K;
  const spec: [number, number, number, number, number][] = [
    [187.5, barW, barH, barR, barX],
    [460, stemW, 306 * K, stemW / 2, stemX],
  ];
  const shapes: THREE.Shape[] = [];
  for (const [svgY, w, h, r, x] of spec) {
    for (const side of [-1, 1]) {
      const points = clipToConvex(rectPoints(side * x, py(svgY), w, h, r), outline);
      // Laid flat, the shape's +y runs away from the camera, so the keys end up at the far edge,
      // where model.html puts them.
      if (points.length >= 3) shapes.push(shape(points));
    }
  }
  return shapes;
}

export type PrintLayer = {index: number; y0: number; y1: number; colour: 'bone' | 'graphite'; geometry: THREE.ExtrudeGeometry};

/** Every layer of the print, bottom to top, each one a slab of the cross-section at its height. */
export function printLayers(): PrintLayer[] {
  const layers: PrintLayer[] = [];
  const count = Math.round(LEVELS.reliefTop / TAG.layer);
  for (let i = 0; i < count; i++) {
    const y0 = i * TAG.layer;
    const y1 = y0 + TAG.layer;
    const mid = (y0 + y1) / 2;
    const isLogo = mid > LEVELS.top;
    layers.push({
      index: i,
      y0,
      y1,
      colour: isLogo ? 'graphite' : 'bone',
      geometry: slab(isLogo ? logoShapes() : plateShapeAt(mid), y0, y1),
    });
  }
  return layers;
}

/** The layer the print pauses after, to drop the NFC tag into its pocket. */
export const pauseAfterLayer = Math.round(LEVELS.ceil / TAG.layer) - 1;
/** The first layer in graphite: the filament change. */
export const colourChangeAtLayer = Math.round(LEVELS.top / TAG.layer);
