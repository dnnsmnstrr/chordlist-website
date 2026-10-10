import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Lockup, Phone, media, progressAt} from './primitives';
import {Caption, CopyBlock} from './scaffold';
import {mono, paletteFor, type MotionProps} from './theme';

const copy = motionCopy.launch;

// Three screens fanned side by side — flat, never tilted — rising one after another.
const fan = ['04-Search', '02-Song-Detail', '01-Song-List'];

/** The launch announcement: what it is, where to get it, and what it costs to start. */
export function LaunchCard({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width, height} = layout;

  const phoneHeight = {story: 820, portrait: 640, square: 560, wide: 760}[shape];
  const phoneWidth = phoneHeight * 0.462;
  const fanCenter = shape === 'wide' ? width - pad - phoneWidth * 1.5 - 40 : width / 2;
  const fanTop = {story: 900, portrait: 760, square: 660, wide: 150}[shape];

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill>
        {fan.map((name, index) => {
          const rise = spring({frame: frame - 18 - index * 6, fps, config: {damping: 18, stiffness: 90}});
          const offset = (index - 1) * phoneWidth * 0.82;
          const isCenter = index === 1;
          return (
            <div
              key={name}
              style={{
                position: 'absolute',
                left: fanCenter + offset - phoneWidth / 2,
                top: fanTop + (isCenter ? 0 : phoneHeight * 0.08),
                zIndex: isCenter ? 2 : 1,
                transform: `translateY(${interpolate(rise, [0, 1], [height * 0.6, 0])}px)`,
              }}
            >
              <Phone palette={palette} height={isCenter ? phoneHeight : phoneHeight * 0.9} image={media.screen(appearance, name)} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: pad, top: shape === 'wide' ? 170 : pad + 20, right: pad}}>
          <div style={{marginBottom: layout.headline * 0.5, opacity: progressAt(frame, 0, 16)}}>
            <Lockup palette={palette} size={Math.round(layout.short * 0.05)} />
          </div>
          <CopyBlock layout={layout} palette={palette} eyebrow={copy.eyebrow} headline={copy.headline} start={8} scale={1.08} />
          <Caption layout={layout} palette={palette} text={copy.freeLimit} start={34} style={{marginTop: layout.headline * 0.4, color: palette.text}} />
          <Caption layout={layout} palette={palette} text={copy.detail} start={40} style={{marginTop: 8, fontSize: layout.body * 0.8}} />
          <div
            style={{
              marginTop: layout.headline * 0.4,
              fontFamily: mono,
              fontSize: layout.eyebrow,
              letterSpacing: layout.eyebrow * 0.08,
              color: palette.muted,
              opacity: progressAt(frame, 48, 16),
            }}
          >
            {copy.platforms}
          </div>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
}
