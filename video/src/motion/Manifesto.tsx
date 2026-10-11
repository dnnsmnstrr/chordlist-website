import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {LogoBlock} from './LogoReveal';
import {Backdrop, progressAt} from './primitives';
import {paletteFor, sans, type MotionProps} from './theme';

const copy = motionCopy.manifesto;
const BEAT = 22;
const FIRST = 12;

/**
 * Kinetic type: four short claims land on the beat, each pushing the last up and out of the way,
 * until the logo, the name and the address close it. Built to read with the sound off.
 */
export function Manifesto({campaign}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad} = layout;
  const size = {story: 128, post: 116, square: 100, wide: 132}[shape];
  const closeAt = FIRST + copy.words.length * BEAT + 16;
  const stackOut = progressAt(frame, closeAt - 8, 16);

  return (
    <Backdrop palette={palette} campaign={campaign}>
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
                  fontWeight: 700,
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
      {/* The close is the logo and the name alone, the address centred under them: no frame. */}
      <Sequence from={closeAt} layout="none">
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <LogoBlock palette={palette} tile={Math.round(Math.min(layout.width, layout.height) * 0.26)} link={copy.footnote} />
        </AbsoluteFill>
      </Sequence>
    </Backdrop>
  );
}
