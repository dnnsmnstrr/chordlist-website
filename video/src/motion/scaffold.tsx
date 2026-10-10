import type {CSSProperties} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {Layout} from './layout';
import {Eyebrow, Lockup, RiseText, progressAt} from './primitives';
import {sans, type Palette} from './theme';

type CopyBlockProps = {
  layout: Layout;
  palette: Palette;
  eyebrow?: string;
  headline: string;
  start?: number;
  exitAt?: number;
  align?: 'left' | 'center';
  scale?: number;
  style?: CSSProperties;
};

/** Eyebrow and headline: the one idea of the asset, set before anything else moves. */
export function CopyBlock({
  layout,
  palette,
  eyebrow,
  headline,
  start = 4,
  exitAt,
  align = 'left',
  scale = 1,
  style,
}: CopyBlockProps) {
  const frame = useCurrentFrame();
  const eyebrowIn = progressAt(frame, start, 18);
  const exit = exitAt === undefined ? 0 : progressAt(frame, exitAt, 14);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', ...style}}>
      {eyebrow ? (
        <Eyebrow
          palette={palette}
          size={layout.eyebrow * scale}
          style={{
            marginBottom: layout.headline * 0.32 * scale,
            opacity: eyebrowIn * (1 - exit),
            transform: `translateY(${(1 - eyebrowIn) * 16}px)`,
          }}
        >
          {eyebrow}
        </Eyebrow>
      ) : null}
      <RiseText
        text={headline}
        start={start + 4}
        palette={palette}
        size={layout.headline * scale}
        align={align}
        exitAt={exitAt}
      />
    </div>
  );
}

type CaptionProps = {layout: Layout; palette: Palette; text: string; start: number; style?: CSSProperties};

export function Caption({layout, palette, text, start, style}: CaptionProps) {
  const frame = useCurrentFrame();
  const enter = progressAt(frame, start, 20);
  return (
    <div
      style={{
        fontFamily: sans,
        fontSize: layout.body,
        fontWeight: 450,
        lineHeight: 1.35,
        color: palette.muted,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

type FooterProps = {layout: Layout; palette: Palette; start: number; align?: 'left' | 'center'};

/** The lockup that signs every piece, in the bottom margin. */
export function Footer({layout, palette, start, align = 'left'}: FooterProps) {
  const frame = useCurrentFrame();
  const enter = progressAt(frame, start, 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: layout.pad,
        right: layout.pad,
        bottom: layout.pad,
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [14, 0])}px)`,
      }}
    >
      <Lockup palette={palette} size={Math.round(layout.short * 0.04)} />
    </div>
  );
}
