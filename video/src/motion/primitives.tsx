import {ChordlistIcon} from '../../../components/chordlist-icon';
import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand, easeOut, mono, sans, shadows, type Palette} from './theme';

/** 0 → 1 over `duration` frames starting at `start`, on the shared arrival curve. */
export function useProgress(start: number, duration: number, easing = easeOut) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function progressAt(frame: number, start: number, duration: number, easing = easeOut) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

/** Base canvas: flat, per DESIGN.md §6. A campaign may add rules, never texture over product. */
export function Backdrop({palette, children}: {palette: Palette; children?: ReactNode}) {
  return <AbsoluteFill style={{backgroundColor: palette.background, overflow: 'hidden'}}>{children}</AbsoluteFill>;
}

type TileProps = {size: number; style?: CSSProperties};

/** The canonical logo: fixed #FAFAFA tile and #0A0A0A glyph in every campaign. */
export function LogoTile({size, style}: TileProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        backgroundColor: brand.tile,
        color: brand.glyph,
        boxShadow: shadows.logo,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      <ChordlistIcon style={{width: '100%', height: '100%'}} />
    </span>
  );
}

type LockupProps = {palette: Palette; size?: number; style?: CSSProperties};

export function Lockup({palette, size = 44, style}: LockupProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.36,
        fontFamily: mono,
        fontSize: size * 0.64,
        fontWeight: 600,
        letterSpacing: -size * 0.012,
        color: palette.text,
        ...style,
      }}
    >
      <LogoTile size={size} />
      chordlist
    </div>
  );
}

type EyebrowProps = {children: ReactNode; palette: Palette; size?: number; style?: CSSProperties};

/** Mono is the site's accent voice: eyebrows, filenames, compact labels. */
export function Eyebrow({children, palette, size = 26, style}: EyebrowProps) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: size * 0.08,
        textTransform: 'uppercase',
        color: palette.muted,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type RiseTextProps = {
  text: string;
  start: number;
  palette: Palette;
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  font?: string;
  align?: CSSProperties['textAlign'];
  maxWidth?: number;
  lineHeight?: number;
  exitAt?: number;
};

/**
 * A heading revealed word by word from behind its own baseline. Line breaks in `text` are kept,
 * so wrapping is chosen deliberately rather than left to the renderer.
 */
export function RiseText({
  text,
  start,
  palette,
  size,
  weight = 600,
  color,
  stagger = 3,
  font = sans,
  align = 'left',
  maxWidth,
  lineHeight = 1.04,
  exitAt,
}: RiseTextProps) {
  const frame = useCurrentFrame();
  const lines = text.split('\n');
  let index = 0;
  const exit = exitAt === undefined ? 0 : progressAt(frame, exitAt, 14);

  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: font === sans ? -size * 0.034 : -size * 0.01,
        lineHeight,
        color: color ?? palette.text,
        textAlign: align,
        maxWidth,
      }}
    >
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{display: 'block', whiteSpace: 'nowrap'}}>
          {line.split(' ').map((word, wordIndex) => {
            const delay = start + index++ * stagger;
            const enter = progressAt(frame, delay, 22);
            return (
              <span
                key={wordIndex}
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  paddingBottom: size * 0.12,
                  marginBottom: -size * 0.12,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${(1 - enter) * 105 - exit * 105}%)`,
                  }}
                >
                  {word}
                  {wordIndex < line.split(' ').length - 1 ? ' ' : ''}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

type PhoneProps = {
  palette: Palette;
  height: number;
  image?: string;
  video?: string;
  trimBefore?: number;
  playbackRate?: number;
  style?: CSSProperties;
  children?: ReactNode;
};

// Captures are 1242 × 2688. The bezel is the theme's panel colour; the pixels inside are never
// filtered, tilted, or recoloured (DESIGN.md §7).
export const SCREEN_ASPECT = 1242 / 2688;

export function Phone({palette, height, image, video, trimBefore, playbackRate, style, children}: PhoneProps) {
  const padding = Math.round(height * 0.012);
  const innerHeight = height - padding * 2;
  const innerWidth = Math.round(innerHeight * SCREEN_ASPECT);
  return (
    <div
      style={{
        position: 'relative',
        width: innerWidth + padding * 2,
        height,
        padding,
        boxSizing: 'border-box',
        borderRadius: innerWidth * 0.14 + padding,
        backgroundColor: palette.panel,
        border: `2px solid ${palette.bezelBorder}`,
        boxShadow: `0 ${height * 0.02}px ${height * 0.05}px ${palette.shadow}`,
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: innerWidth,
          height: innerHeight,
          borderRadius: innerWidth * 0.14,
          overflow: 'hidden',
          backgroundColor: palette.isDark ? '#000000' : '#FFFFFF',
        }}
      >
        {image ? <Img src={staticFile(image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
        {video ? (
          <OffthreadVideo
            src={staticFile(video)}
            muted
            trimBefore={trimBefore}
            playbackRate={playbackRate}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}

type PillProps = {children: ReactNode; palette: Palette; size?: number; style?: CSSProperties};

/** Chord capsules illustrate native UI, so they use the rounded, bold presentation. */
export function ChordPill({children, palette, size = 34, style}: PillProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.32,
        padding: `${size * 0.32}px ${size * 0.62}px`,
        borderRadius: 999,
        backgroundColor: palette.panel,
        border: `2px solid ${palette.rule}`,
        color: palette.text,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: -size * 0.01,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export const media = {
  screen: (appearance: 'light' | 'dark', name: string) => `generated/motion/screens/${appearance}/${name}.png`,
  recording: (appearance: 'light' | 'dark') => `generated/motion/press/chordlist-demo-${appearance}.mp4`,
  colorScroll: 'generated/motion/press/smooth-color-scroll-light-only.mp4',
  themeScroll: (appearance: 'light' | 'dark', accent: string) =>
    `generated/motion/press/chordlist-autoscroll-${appearance}-${accent}.mp4`,
};
