import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Palette} from '../theme';
import {LEVELS, TAG, colourChangeAtLayer, pauseAfterLayer, printLayers} from './geometry';

// model.html's materials: bone for the plate, graphite for the logo.
const BONE = '#f7f7f8';
const GRAPHITE = '#1c1c1e';
// The tag is 1.6 mm tall and 32 mm wide; at true scale its layers are hairlines from any distance
// that shows the whole tag. Heights are drawn four times over so the layers, the pocket and the
// sealed lid read. Widths, and every proportion within a layer, are true.
const EXAGGERATION = 4;

/**
 * The print's timeline in frames, derived from its events so a change of layer count or pace
 * moves everything after it: the floor and the pocket wall, a pause while the NFC tag goes in, the
 * lid that seals it, a filament change, and the graphite logo.
 */
export function printTimeline(fps: number, pace = 1) {
  // `pace` stretches every step evenly, so the same print fits a piece of any length.
  const at = (seconds: number) => Math.max(1, Math.round(fps * seconds * pace));
  const perLayer = at(0.24);
  const start = at(0.5);
  const firstRun = start + (pauseAfterLayer + 1) * perLayer;
  const pause = at(2.4);
  const lidRun = firstRun + pause + (colourChangeAtLayer - pauseAfterLayer - 1) * perLayer;
  const swap = at(1);
  const total = printLayers().length;
  const logoRun = lidRun + swap + (total - colourChangeAtLayer) * perLayer;
  const layerStart = (index: number) => {
    if (index <= pauseAfterLayer) return start + index * perLayer;
    if (index < colourChangeAtLayer) return firstRun + pause + (index - pauseAfterLayer - 1) * perLayer;
    return lidRun + swap + (index - colourChangeAtLayer) * perLayer;
  };
  return {perLayer, start, firstRun, pause, lidRun, swap, logoRun, total, layerStart, end: logoRun + at(2.4)};
}

export type PrintPhase = {kind: 'printing'; layer: number; total: number} | {kind: 'pause'} | {kind: 'swap'} | {kind: 'done'};

export function printPhase(frame: number, fps: number, pace = 1): PrintPhase {
  const t = printTimeline(fps, pace);
  if (frame >= t.logoRun) return {kind: 'done'};
  if (frame >= t.firstRun && frame < t.firstRun + t.pause) return {kind: 'pause'};
  if (frame >= t.lidRun && frame < t.lidRun + t.swap) return {kind: 'swap'};
  let layer = 0;
  for (let i = 0; i < t.total; i++) if (frame >= t.layerStart(i)) layer = i;
  return {kind: 'printing', layer: layer + 1, total: t.total};
}

function Camera({frame, durationInFrames, aspect}: {frame: number; durationInFrames: number; aspect: number}) {
  const {camera} = useThree();
  // A slow quarter orbit over the whole piece, rising at the end to look down on the finished logo.
  const angle = interpolate(frame, [0, durationInFrames], [-0.55, 0.35]);
  const rise = interpolate(frame, [durationInFrames - 70, durationInFrames - 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Far enough that about 52 mm fits across the frame's narrower side, so a 9:16 story keeps the
  // whole tag and its bed in view (the field of view is 30° vertically).
  const portrait = aspect < 1;
  const distance = Math.max(74, 26 / (Math.tan(THREE.MathUtils.degToRad(15)) * aspect));
  const height = interpolate(rise, [0, 1], [34, 58]);
  camera.position.set(Math.sin(angle) * distance, height, Math.cos(angle) * distance);
  // Aimed beside the tag, not at it, to frame it clear of the copy: below the headline on a
  // portrait canvas, to its right on the wide one. The offset turns with the orbit.
  const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
  const target = portrait ? new THREE.Vector3(0, distance * 0.1, 0) : right.multiplyScalar(-14);
  camera.lookAt(target);
  return null;
}

function Nozzle({position, visible}: {position: [number, number, number]; visible: number}) {
  return (
    <group position={position} visible={visible > 0.01}>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1, 2.4, 32]} />
        <meshStandardMaterial color="#c7b27a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[5.5, 4.4, 5.5]} />
        <meshStandardMaterial color="#8c8c90" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** The NFC sticker: a white inlay with its copper antenna and chip, as it is dropped in. */
function NfcTag({y}: {y: number}) {
  const rings = [12.4, 11.7, 11.0, 10.3];
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, TAG.nfcHeight / 2, 0]}>
        <cylinderGeometry args={[TAG.nfcDiameter / 2, TAG.nfcDiameter / 2, TAG.nfcHeight, 96]} />
        <meshStandardMaterial color="#e8e6df" roughness={0.6} />
      </mesh>
      {rings.map((radius) => (
        <mesh key={radius} position={[0, TAG.nfcHeight + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.18, radius, 96]} />
          <meshStandardMaterial color="#b87333" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[4.5, TAG.nfcHeight + 0.15, 4.5]}>
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#202022" roughness={0.4} />
      </mesh>
    </group>
  );
}

const SWEEP_NORMAL = new THREE.Vector3(-1, 0, 0);

type PrintSceneProps = {palette: Palette; width: number; height: number; pace?: number};

/**
 * The chordlink being printed, layer by layer, with the camera on a slow orbit. Each layer is laid
 * down in one sweep of the nozzle and glows briefly while it is fresh. At the pause the NFC tag
 * drops into its pocket; after the lid seals it, the filament changes and the logo prints in
 * graphite.
 */
export function PrintScene({palette, width, height, pace = 1}: PrintSceneProps) {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = printTimeline(fps, pace);
  const layers = useMemo(() => printLayers(), []);
  const half = TAG.size / 2 + 0.5;
  let nozzle: [number, number, number] = [0, 30, 0];
  let printing = 0;
  const looks: {cut: number; glow: number}[] = [];
  layers.forEach((layer, index) => {
    const begin = t.layerStart(index);
    const sweep = interpolate(frame, [begin, begin + t.perLayer], [-half, half], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    // Fresh plastic glows warm for a moment, then settles to its colour.
    const fresh = interpolate(frame, [begin, begin + t.perLayer * 1.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    looks.push({
      cut: frame < begin ? -half - 1 : sweep,
      glow: frame >= begin ? fresh * (layer.colour === 'bone' ? 0.3 : 0.05) : 0,
    });
    if (frame >= begin && frame < begin + t.perLayer) {
      // A raster pass: across in x, back and forth in z.
      const zig = Math.sin(((frame - begin) / t.perLayer) * Math.PI * 9) * half * 0.9;
      nozzle = [sweep, layer.y1 * EXAGGERATION + 0.15, zig];
      printing = 1;
    }
  });
  if (!printing) {
    // Parked beside the bed between passes, and swung well clear for the pause and at the end.
    const clear = (frame >= t.firstRun && frame < t.firstRun + t.pause) || frame >= t.logoRun;
    nozzle = clear ? [half + 40, 10, -half - 30] : [half + 6, 8, -half - 4];
  }
  const nozzleIn = interpolate(frame, [t.start - 10, t.start], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nozzleOut = interpolate(frame, [t.logoRun, t.logoRun + 20], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const drop = spring({frame: frame - (t.firstRun + 12), fps, config: {damping: 16, stiffness: 70, mass: 1.2}});
  const tagY = interpolate(drop, [0, 1], [26 / EXAGGERATION, LEVELS.floor]);
  const tagVisible = frame >= t.firstRun + 6;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      onCreated={({gl}) => {
        gl.localClippingEnabled = true;
      }}
      camera={{fov: 30, near: 1, far: 400}}
    >
      <Camera frame={frame} durationInFrames={durationInFrames} aspect={width / height} />
      <hemisphereLight args={['#ffffff', '#3a3a3e', 1.6]} />
      <directionalLight position={[30, 60, 40]} intensity={2.6} />
      <directionalLight position={[-40, 20, -20]} intensity={0.8} color="#b8c5ff" />
      {/* The build plate. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[110, 110]} />
        <meshStandardMaterial color={palette.panel} roughness={0.9} />
      </mesh>
      <gridHelper args={[110, 22, palette.rule, palette.rule]} position={[0, 0.001, 0]} />
      <group scale={[1, EXAGGERATION, 1]}>
        {layers.map((layer, index) => (
          <mesh key={layer.index} geometry={layer.geometry}>
            <meshStandardMaterial
              color={layer.colour === 'bone' ? BONE : GRAPHITE}
              roughness={layer.colour === 'bone' ? 0.75 : 0.5}
              metalness={layer.colour === 'bone' ? 0.05 : 0.1}
              emissive="#ff8a3d"
              emissiveIntensity={looks[index]!.glow}
              // A layer is revealed by sliding its clipping plane across with the nozzle.
              clippingPlanes={[new THREE.Plane(SWEEP_NORMAL, looks[index]!.cut)]}
            />
          </mesh>
        ))}
        {tagVisible ? <NfcTag y={tagY} /> : null}
      </group>
      <Nozzle position={nozzle} visible={nozzleIn * nozzleOut} />
    </ThreeCanvas>
  );
}
