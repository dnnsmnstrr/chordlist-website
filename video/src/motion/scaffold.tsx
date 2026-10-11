import type {CSSProperties, ReactNode} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {Layout} from './layout';
import {Lockup, RiseText, progressAt} from './primitives';
import {mono, type Palette} from './theme';

type FrameProps = {layout: Layout; palette: Palette; eyebrow?: string; footnote?: string; exitAt?: number};

/**
 * The frame every social still shares (social-templates.mjs `frame`): the lockup with its lowercase
 * label at the top, the footnote at the bottom, both inside the story's safe areas. It is drawn
 * over the piece so a subject may bleed under it, exactly as a screenshot does in the stills.
 */
export function SocialFrame({layout, palette, eyebrow, footnote, exitAt}: FrameProps) {
  const frame = useCurrentFrame();
  const top = progressAt(frame, 0, 14);
  const bottom = progressAt(frame, 12, 16);
  const exit = exitAt === undefined ? 0 : progressAt(frame, exitAt, 12);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: layout.pad,
          top: layout.pad + layout.safeTop,
          opacity: top * (1 - exit),
          transform: `translateY(${(1 - top) * -10}px)`,
        }}
      >
        <Lockup palette={palette} size={layout.mark} label={eyebrow} />
      </div>
      {footnote ? (
        <div
          style={{
            position: 'absolute',
            left: layout.pad,
            bottom: layout.pad + layout.safeBottom,
            fontFamily: mono,
            fontSize: layout.footnote,
            color: palette.muted,
            opacity: bottom * (1 - exit),
          }}
        >
          {footnote}
        </div>
      ) : null}
    </>
  );
}

type HeadlineProps = {
  layout: Layout;
  palette: Palette;
  lines: readonly string[];
  start?: number;
  exitAt?: number;
  scale?: number;
  align?: 'left' | 'center';
  /** Shrink to fit this width rather than wrap, as the still build's fitSize does. */
  maxWidth?: number;
  style?: CSSProperties;
};

// An estimate of Geist Bold's average advance at -0.025em tracking; generous, so a fitted line
// comes out a little narrow rather than overflowing. Check the render.
const ADVANCE = 0.53;

export function fitHeadline(layout: Layout, lines: readonly string[], maxWidth?: number, scale = 1) {
  const size = layout.headline * scale;
  if (!maxWidth) return Math.round(size);
  const longest = Math.max(...lines.map((line) => line.length));
  return Math.round(Math.min(size, maxWidth / (longest * ADVANCE)));
}

/** The headline, set like the `statement` template: Geist 700, authored line breaks. */
export function Headline({layout, palette, lines, start = 6, exitAt, scale = 1, align = 'left', maxWidth, style}: HeadlineProps) {
  return (
    <div style={style}>
      <RiseText
        text={lines}
        start={start}
        palette={palette}
        size={fitHeadline(layout, lines, maxWidth, scale)}
        align={align}
        exitAt={exitAt}
      />
    </div>
  );
}

/** Fades and lifts its children in, for a subject that arrives after the headline. */
export function Arrive({start, children, distance = 30, style}: {start: number; children: ReactNode; distance?: number; style?: CSSProperties}) {
  const frame = useCurrentFrame();
  const enter = progressAt(frame, start, 24);
  return (
    <div style={{opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [distance, 0])}px)`, ...style}}>
      {children}
    </div>
  );
}
