import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Phone, media, progressAt} from './primitives';
import {Caption, CopyBlock, Footer} from './scaffold';
import {chaptersFor} from './recording';
import {mono, paletteFor, seconds, type MotionProps, type Palette} from './theme';

const copy = motionCopy.handsFree;

/** A running clock beside a touch count that never moves: the point of the shot, as numbers. */
function TouchCounter({palette, size, start}: {palette: Palette; size: number; start: number}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const elapsed = Math.max(0, frame - start) / fps;
  const clock = `00:${String(Math.floor(elapsed)).padStart(2, '0')}`;
  const enter = progressAt(frame, start - 10, 18);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: size * 0.8,
        fontFamily: mono,
        fontSize: size,
        color: palette.text,
        opacity: enter,
      }}
    >
      <span style={{fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{clock}</span>
      <span style={{color: palette.muted}}>
        <span style={{color: palette.text, fontWeight: 600}}>0</span> {copy.timer}
      </span>
    </div>
  );
}

/** The longest shot of the press demo — the chart travelling on its own — framed for social. */
export function HandsFree({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width, height} = layout;

  const phone = {
    story: {h: 1180, x: (width - 1180 * 0.462) / 2, y: 430},
    portrait: {h: 860, x: width - pad - 860 * 0.462, y: 380},
    square: {h: 920, x: width - pad - 920 * 0.462, y: 80},
    wide: {h: 940, x: width - pad - 940 * 0.462 - 200, y: 70},
  }[shape];
  const enter = progressAt(frame, 6, 26);
  const counterSize = {story: 34, portrait: 30, square: 28, wide: 30}[shape];

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill>
        <div style={{position: 'absolute', left: pad, top: shape === 'story' ? pad + 20 : shape === 'portrait' ? pad + 20 : 200}}>
          <CopyBlock
            layout={layout}
            palette={palette}
            eyebrow={copy.eyebrow}
            headline={copy.headline}
            scale={shape === 'square' ? 0.66 : 1}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: phone.x,
            top: phone.y,
            opacity: enter,
            transform: `translateY(${interpolate(enter, [0, 1], [height * 0.1, 0])}px)`,
          }}
        >
          <Phone
            palette={palette}
            height={phone.h}
            video={media.recording(appearance)}
            trimBefore={seconds(chaptersFor(appearance).handsFree.start)}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: pad,
            ...(shape === 'story'
              ? {bottom: pad + layout.short * 0.04 + 40, right: pad, display: 'flex', justifyContent: 'space-between'}
              : {top: 200 + layout.headline * 0.82 * 3.6}),
          }}
        >
          <TouchCounter palette={palette} size={counterSize} start={20} />
        </div>
        <Caption
          layout={layout}
          palette={palette}
          text={copy.caption}
          start={36}
          style={{
            position: 'absolute',
            left: pad,
            ...(shape === 'story'
              ? {bottom: pad + layout.short * 0.04 + 40 + counterSize * 1.8}
              : {top: 200 + layout.headline * 0.82 * 3.6 + counterSize * 2.2}),
            maxWidth: shape === 'story' ? undefined : 420,
          }}
        />
        <Footer layout={layout} palette={palette} start={50} />
      </AbsoluteFill>
    </Backdrop>
  );
}
