import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Lockup} from './primitives';
import {accentFor, sans, paletteFor, type MotionProps} from './theme';

const copy = motionCopy.endCard;

/**
 * The promo's end card on its own (EndCard in ChordlistDemo.tsx: lockup, end line, accent pill),
 * so it can close any piece and be dropped into the last seconds of a phone edit, as
 * docs/video-scripts.md asks of the launch cut's ending.
 */
export function EndCardScene({campaign}: Pick<MotionProps, 'campaign'>) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const accent = accentFor(campaign);
  const enter = spring({frame, fps, durationInFrames: 28, config: {damping: 18, stiffness: 120}});
  const size = Math.round(layout.headline * 1.1);
  const isWide = layout.shape === 'wide';

  return (
    <AbsoluteFill
      style={{
        padding: `${layout.pad + layout.safeTop}px ${layout.pad}px ${layout.pad + layout.safeBottom}px`,
        justifyContent: 'center',
        alignItems: isWide ? 'center' : 'flex-start',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        }}
      >
        <Lockup palette={palette} size={layout.mark} />
        <div
          style={{
            marginTop: size * 0.86,
            fontFamily: sans,
            fontSize: size,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: palette.text,
          }}
        >
          {copy.headline.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div
          style={{
            marginTop: size * 0.64,
            borderRadius: 999,
            padding: `${Math.round(size * 0.22)}px ${Math.round(size * 0.32)}px`,
            backgroundColor: accent,
            color: palette.background,
            fontFamily: sans,
            fontSize: Math.round(size * 0.31),
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {copy.pill}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function EndCard({campaign}: MotionProps) {
  return (
    <Backdrop palette={paletteFor(campaign)} campaign={campaign}>
      <EndCardScene campaign={campaign} />
    </Backdrop>
  );
}
