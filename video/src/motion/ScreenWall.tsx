import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Eyebrow, Lockup, Phone, RiseText, SCREEN_ASPECT, media, progressAt} from './primitives';
import {paletteFor, type MotionProps} from './theme';

const copy = motionCopy.wall;

const screens = [
  '01-Song-List',
  '02-Song-Detail',
  '03-Creation-Flow',
  '04-Search',
  '05-Tag-Filter',
  '06-Settings',
  '07-Song-Suggestions',
];
// The paywall is left out on purpose: its price is the store's to state, and this wall is evergreen.

/**
 * Every screen of the app drifting past in columns, alternating direction, with the tagline on a
 * solid panel in the middle. Nothing is laid over the screenshots themselves. Each column travels
 * exactly one period over the composition, so the piece loops without a seam.
 */
export function ScreenWall({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {width, shape} = layout;

  const columns = shape === 'wide' ? 7 : shape === 'story' ? 4 : 5;
  const gap = Math.round(width * 0.014);
  const phoneWidth = (width - gap * (columns + 1)) / columns;
  const phoneHeight = phoneWidth / SCREEN_ASPECT;
  const period = (phoneHeight + gap) * 4;
  const fadeIn = progressAt(frame, 0, 20);

  const panelIn = progressAt(frame, 8, 26);
  const panelWidth = shape === 'wide' ? 1040 : width * 0.84;

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill style={{opacity: fadeIn}}>
        {Array.from({length: columns}, (_, column) => {
          const direction = column % 2 === 0 ? -1 : 1;
          const offset = interpolate(frame, [0, durationInFrames], [0, period]) * direction;
          const base = -period + (column % 3) * phoneHeight * 0.33;
          return (
            <div
              key={column}
              style={{
                position: 'absolute',
                left: gap + column * (phoneWidth + gap),
                top: base + offset - (direction > 0 ? period : 0),
                display: 'flex',
                flexDirection: 'column',
                gap,
              }}
            >
              {Array.from({length: 12}, (__, row) => {
                // Each column cycles through its own four screens, so one period is four rows.
                const name = screens[(column * 2 + (row % 4)) % screens.length]!;
                return (
                  <Phone
                    key={row}
                    palette={palette}
                    height={phoneHeight}
                    image={media.screen(appearance, name)}
                    style={{boxShadow: 'none'}}
                  />
                );
              })}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            width: panelWidth,
            padding: shape === 'wide' ? '64px 72px' : '56px 56px',
            boxSizing: 'border-box',
            borderRadius: 28,
            backgroundColor: palette.background,
            border: `2px solid ${palette.rule}`,
            boxShadow: `0 24px 80px ${palette.shadow}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 40}px) scale(${interpolate(panelIn, [0, 1], [0.96, 1])})`,
          }}
        >
          <Lockup palette={palette} size={shape === 'wide' ? 56 : 52} />
          <RiseText
            text={copy.headline.replace(', as', ',\nas')}
            start={20}
            palette={palette}
            size={shape === 'wide' ? 76 : 70}
          />
          <Eyebrow palette={palette} size={layout.eyebrow}>
            {copy.eyebrow}
          </Eyebrow>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
}
