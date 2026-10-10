import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, LogoTile, Lockup, RiseText, progressAt} from './primitives';
import {paletteFor, sans, type MotionProps} from './theme';

const copy = motionCopy.manifesto;
const BEAT = 22;
const FIRST = 12;

/**
 * Kinetic type: four short claims land on the beat, each pushing the last up and out of the way,
 * until the tagline and the lockup close it. Built to read with the sound off.
 */
export function Manifesto({campaign}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width, height} = layout;
  const size = {story: 128, portrait: 120, square: 100, wide: 132}[shape];
  const closeAt = FIRST + copy.words.length * BEAT + 16;
  const stackOut = progressAt(frame, closeAt - 8, 16);

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: pad, paddingRight: pad}}>
        <div style={{opacity: 1 - stackOut, transform: `translateY(${-stackOut * 60}px)`}}>
          {copy.words.map((word, index) => {
            const at = FIRST + index * BEAT;
            const enter = progressAt(frame, at, 16);
            const settled = index === copy.words.length - 1 ? 1 : 1 - progressAt(frame, at + BEAT, 12) * 0.62;
            const [possessive, noun] = word.split(' ');
            return (
              <div
                key={word}
                style={{
                  fontFamily: sans,
                  fontSize: size,
                  fontWeight: 650,
                  letterSpacing: -size * 0.045,
                  lineHeight: 1.02,
                  color: palette.text,
                  opacity: enter * settled,
                  transform: `translateY(${interpolate(enter, [0, 1], [size * 0.5, 0])}px)`,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{color: palette.muted}}>{possessive} </span>
                {noun}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {frame >= closeAt ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: size * 0.4}}>
          <div style={{transform: `scale(${progressAt(frame, closeAt, 18)})`}}>
            <LogoTile size={size * 1.1} />
          </div>
          <RiseText
            text={shape === 'wide' ? copy.closing : copy.closing.replace(', as', ',\nas')}
            start={closeAt + 10}
            palette={palette}
            size={size * (shape === 'wide' ? 0.38 : 0.5)}
            weight={500}
            align="center"
            stagger={2}
          />
        </AbsoluteFill>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: pad, display: 'flex', justifyContent: 'center', opacity: progressAt(frame, closeAt + 30, 16)}}>
        <Lockup palette={palette} size={Math.round(Math.min(width, height) * 0.04)} />
      </div>
    </Backdrop>
  );
}
