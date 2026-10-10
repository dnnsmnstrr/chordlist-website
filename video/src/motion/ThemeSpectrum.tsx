import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Phone, media, progressAt} from './primitives';
import {Caption, CopyBlock, Footer} from './scaffold';
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
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width, height} = layout;
  const vertical = shape === 'wide' || shape === 'square';

  const phone = {
    story: {h: 1060, x: (width - 1060 * 0.462) / 2, y: 470},
    portrait: {h: 820, x: (width - 820 * 0.462) / 2, y: 330},
    square: {h: 900, x: width - pad - 900 * 0.462 - 110, y: 90},
    wide: {h: 920, x: width - pad - 920 * 0.462 - 160, y: 80},
  }[shape];
  const swatch = {story: 46, portrait: 40, square: 40, wide: 46}[shape];
  const enter = progressAt(frame, 4, 24);

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill>
        <div style={{position: 'absolute', left: pad, top: vertical ? 200 : pad + 20}}>
          <CopyBlock
            layout={layout}
            palette={palette}
            eyebrow={copy.eyebrow}
            headline={copy.headline}
            scale={shape === 'square' ? 0.74 : 1}
          />
          {vertical ? (
            <div style={{marginTop: layout.headline * 0.5}}>
              <SwatchName palette={palette} size={layout.eyebrow * 1.2} />
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            left: phone.x,
            top: phone.y,
            opacity: enter,
            transform: `translateY(${interpolate(enter, [0, 1], [height * 0.08, 0])}px)`,
          }}
        >
          <Phone palette={palette} height={phone.h} video={media.colorScroll} />
        </div>
        <div
          style={
            vertical
              ? {position: 'absolute', left: phone.x + phone.h * 0.462 + swatch * 1.4, top: phone.y, height: phone.h, display: 'flex', alignItems: 'center'}
              : {position: 'absolute', left: 0, right: 0, top: phone.y + phone.h + swatch * 0.9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: swatch * 0.5}
          }
        >
          <Swatches palette={palette} size={swatch} vertical={vertical} />
          {vertical ? null : <SwatchName palette={palette} size={layout.eyebrow * 1.1} />}
        </div>
        {shape === 'story' || shape === 'portrait' ? null : (
          <Caption
            layout={layout}
            palette={palette}
            text={copy.caption}
            start={30}
            style={{position: 'absolute', left: pad, top: 200 + layout.headline * 3.6, maxWidth: shape === 'square' ? 360 : 560}}
          />
        )}
        <Footer layout={layout} palette={palette} start={40} />
      </AbsoluteFill>
    </Backdrop>
  );
}
