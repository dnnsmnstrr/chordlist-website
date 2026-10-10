import {ChordlistIcon} from '../../../components/chordlist-icon';
import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PaperBackground} from '../ChordlistDemo';
import {brand, easeOut, mono, sans, shadows, type Campaign, type Palette} from './theme';

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

/**
 * Base canvas: flat, per DESIGN.md §6, except warm-stage, which is the promo's campaign and keeps
 * its paper texture (the same effect and settings as ChordlistDemo) so a motion piece cut next to
 * the promo sits on the same ground. The seed is fixed, so the texture never shimmers.
 */
export function Backdrop({palette, campaign, children}: {palette: Palette; campaign?: Campaign; children?: ReactNode}) {
  return (
    <AbsoluteFill style={{backgroundColor: palette.background, overflow: 'hidden'}}>
      {campaign === 'warm-stage' ? <PaperBackground seed={185} /> : null}
      {children}
    </AbsoluteFill>
  );
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

type LockupProps = {palette: Palette; size?: number; label?: string; style?: CSSProperties};

/**
 * The social lockup (scripts/lib/social-templates.mjs): tile, mono wordmark at regular weight, and
 * an optional lowercase label in the footnote size beside it.
 */
export function Lockup({palette, size = 56, label, style}: LockupProps) {
  const scale = size / 56;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: Math.round(18 * scale), ...style}}>
      <LogoTile size={size} />
      <span style={{fontFamily: mono, fontSize: Math.round(34 * scale), letterSpacing: '-0.03em', color: palette.text}}>
        chordlist
      </span>
      {label ? (
        <span style={{fontFamily: mono, fontSize: Math.round(24 * scale), color: palette.muted}}>{label.toLowerCase()}</span>
      ) : null}
    </div>
  );
}

type RiseTextProps = {
  text: string | readonly string[];
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
 * A heading revealed word by word from behind its own baseline. Lines are authored, as in a social
 * definition, so wrapping is an editorial decision rather than the renderer's.
 */
export function RiseText({
  text,
  start,
  palette,
  size,
  weight = 700,
  color,
  stagger = 3,
  font = sans,
  align = 'left',
  maxWidth,
  lineHeight = 1.14,
  exitAt,
}: RiseTextProps) {
  const frame = useCurrentFrame();
  const lines = typeof text === 'string' ? text.split('\n') : text;
  let index = 0;
  const exit = exitAt === undefined ? 0 : progressAt(frame, exitAt, 14);

  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: font === sans ? '-0.025em' : '-0.01em',
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
