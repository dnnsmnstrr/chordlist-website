import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {phoneBeside, useLayout} from './layout';
import {Backdrop, Phone, SCREEN_ASPECT, media, progressAt} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {colorScrollStops} from './recording';
import {accents, mono, paletteFor, type MotionProps, type Palette} from './theme';

const copy = motionCopy.themes;

function useActiveStop() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  let active = 0;
  colorScrollStops.forEach((stop, index) => {
    if (time >= stop.start) active = index;
  });
  return {active, since: frame - Math.round(colorScrollStops[active]!.start * fps)};
}

/** The seven tints as swatches. The current one carries a ring and its name, not colour alone. */
function Swatches({palette, size, vertical}: {palette: Palette; size: number; vertical: boolean}) {
  const {active, since} = useActiveStop();
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: size * 0.5, alignItems: 'center'}}>
      {colorScrollStops.map((stop, index) => {
        const isActive = index === active;
        const enter = progressAt(frame, 10 + index * 3, 16);
        const pop = isActive ? interpolate(progressAt(since, 0, 10), [0, 0.5, 1], [1, 1.25, 1.12]) : 1;
        return (
          <div
            key={stop.accent}
            style={{
              width: size,
              height: size,
              borderRadius: 999,
              backgroundColor: accents[stop.accent],
              boxShadow: isActive
                ? `0 0 0 ${size * 0.1}px ${palette.background}, 0 0 0 ${size * 0.18}px ${palette.text}`
                : 'none',
              transform: `scale(${pop * enter})`,
            }}
          />
        );
      })}
    </div>
  );
}

function SwatchName({palette, size}: {palette: Palette; size: number}) {
  const {active, since} = useActiveStop();
  const enter = progressAt(since, 0, 12);
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: size * 0.08,
        textTransform: 'uppercase',
        color: palette.text,
        height: size * 1.3,
        overflow: 'hidden',
      }}
    >
      <div style={{transform: `translateY(${(1 - enter) * 100}%)`}}>{colorScrollStops[active]!.accent}</div>
    </div>
  );
}

/** The app's colour-scroll master, with the tint it is showing named beside it. */
export function ThemeSpectrum({campaign}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {phone, copy: column} = phoneBeside(layout, SCREEN_ASPECT);
  const headSize = fitHeadline(layout, copy.headline, column.width);
  const swatch = Math.round(layout.footnote * 1.6);

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Arrive start={4} distance={layout.height * 0.06} style={{position: 'absolute', left: phone.left, top: phone.top}}>
          <Phone palette={palette} height={phone.height} video={media.colorScroll} />
        </Arrive>
        <div style={{position: 'absolute', left: column.left, top: column.top, width: column.width}}>
          <Headline layout={layout} palette={palette} lines={copy.headline} maxWidth={column.width} />
          <Arrive start={16} distance={12} style={{marginTop: headSize * 0.6, display: 'flex', flexDirection: 'column', gap: swatch * 0.6}}>
            <Swatches palette={palette} size={swatch} vertical={false} />
            <SwatchName palette={palette} size={layout.footnote} />
          </Arrive>
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
