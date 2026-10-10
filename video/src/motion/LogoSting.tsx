import mark from '../../../design/mark.json';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {Backdrop, RiseText, progressAt} from './primitives';
import {brand, easeInOut, mono, paletteFor, shadows, type MotionProps} from './theme';

const [, , viewWidth = 270, viewHeight = 613] = mark.viewBox.split(' ').map(Number);

/**
 * The mark assembles itself: the two keys drop onto the tile like hammers, their strings draw
 * down from them, and the mono wordmark types out beside it. Geometry is the canonical mark.
 */
export function LogoSting({campaign}: MotionProps) {
  // The sting is the lockup itself, so it carries no frame of its own.
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const palette = paletteFor(campaign);
  const short = Math.min(width, height);
  const tile = short * 0.15;

  const tileIn = spring({frame, fps, config: {damping: 16, stiffness: 140}, durationInFrames: 24});
  const keyDrop = (delay: number) =>
    spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 160, mass: 0.8}});
  const stringDraw = (delay: number) => progressAt(frame, delay, 16);
  const slide = progressAt(frame, 40, 22, easeInOut);

  const word = 'chordlist';
  const typed = Math.floor(interpolate(frame, [52, 52 + word.length * 2.2], [0, word.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));
  const caretOn = frame < 52 + word.length * 2.2 + 18 ? Math.floor(frame / 8) % 2 === 0 || typed < word.length : false;
  const fontSize = tile * 0.62;
  const wordWidth = fontSize * 0.6 * word.length + tile * 0.36;

  const shapes = mark.shapes.map((shape, index) => {
    const isKey = shape.tag === 'path';
    const side = index < 2 ? 0 : 1;
    if (isKey) {
      const drop = keyDrop(10 + side * 6);
      return (
        <path
          key={index}
          d={shape.d}
          transform={`translate(0 ${interpolate(drop, [0, 1], [-viewHeight * 0.9, 0])})`}
        />
      );
    }
    const draw = stringDraw(22 + side * 6);
    const y = Number(shape.y);
    const h = Number(shape.height);
    return <rect key={index} x={shape.x} y={y} width={shape.width} height={h * draw} />;
  });

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            transform: `translateX(${interpolate(slide, [0, 1], [wordWidth / 2, 0])}px)`,
          }}
        >
          <div
            style={{
              width: tile,
              height: tile,
              borderRadius: tile * 0.225,
              backgroundColor: brand.tile,
              color: brand.glyph,
              boxShadow: shadows.logo,
              overflow: 'hidden',
              transform: `scale(${tileIn})`,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox={mark.viewBox}
              fill="currentColor"
              style={{height: '100%', width: (tile * viewWidth) / viewHeight, overflow: 'hidden'}}
            >
              {shapes}
            </svg>
          </div>
          <div
            style={{
              width: wordWidth,
              paddingLeft: tile * 0.36,
              fontFamily: mono,
              fontWeight: 400,
              fontSize,
              letterSpacing: '-0.03em',
              color: palette.text,
              whiteSpace: 'pre',
              opacity: slide,
            }}
          >
            {word.slice(0, typed)}
            <span
              style={{
                display: 'inline-block',
                width: fontSize * 0.08,
                height: fontSize * 0.9,
                marginLeft: fontSize * 0.04,
                verticalAlign: 'middle',
                backgroundColor: palette.muted,
                opacity: caretOn ? 1 : 0,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: height * (width > height ? 0.16 : 0.2),
        }}
      >
        <RiseText
          text={motionCopy.logoSting.tagline}
          start={82}
          palette={palette}
          size={short * 0.036}
          weight={400}
          color={palette.muted}
          stagger={2}
          align="center"
        />
      </AbsoluteFill>
    </Backdrop>
  );
}
