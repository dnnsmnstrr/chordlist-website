import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Phone, SCREEN_ASPECT, media, progressAt} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {colorScrollStops} from './recording';
import {accents, paletteFor, type MotionProps, type Palette} from './theme';

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

/**
 * The app's colour-scroll master centred in the frame, with the seven tints as a row of swatches
 * beneath it, the current one ringed. No labels: the change of colour is the whole message, so
 * the screen is sized to leave the row room rather than to be as large as possible.
 */
export function ThemeSpectrum({campaign}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, content, width} = layout;
  const isWide = shape === 'wide';

  const swatch = Math.round(layout.footnote * (isWide ? 1.5 : 1.7));
  const row = swatch * 1.4;
  const gap = Math.round(40 * layout.scale);
  const copyWidth = isWide ? content.width * 0.3 : content.width;
  const headSize = fitHeadline(layout, copy.headline, copyWidth);
  const top = isWide ? content.top : content.top + copy.headline.length * headSize * 1.14 + gap;
  const phoneHeight = content.bottom - top - gap - row;
  const phoneLeft = (width - phoneHeight * SCREEN_ASPECT) / 2;

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Headline
          layout={layout}
          palette={palette}
          lines={copy.headline}
          maxWidth={copyWidth}
          style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top}}
        />
        <Arrive start={4} distance={layout.height * 0.05} style={{position: 'absolute', left: phoneLeft, top}}>
          <Phone palette={palette} height={phoneHeight} video={media.colorScroll} />
        </Arrive>
        <Arrive
          start={14}
          distance={12}
          style={{position: 'absolute', left: 0, right: 0, top: top + phoneHeight + gap, display: 'flex', justifyContent: 'center'}}
        >
          <Swatches palette={palette} size={swatch} vertical={false} />
        </Arrive>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
