import mark from '../../../design/mark.json';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {progressAt} from './primitives';
import {brand, shadows} from './theme';

const [, , viewWidth = 270, viewHeight = 613] = mark.viewBox.split(' ').map(Number);

/**
 * The canonical tile assembling itself from `start`: it scales in, the two keys drop onto it like
 * hammers, and their strings draw down. It settles on exactly the standard logo.
 */
export function AssemblingTile({size, start = 0}: {size: number; start?: number}) {
  const frame = useCurrentFrame() - start;
  const {fps} = useVideoConfig();
  const tileIn = spring({frame, fps, config: {damping: 16, stiffness: 140}, durationInFrames: 24});
  const keyDrop = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 160, mass: 0.8}});

  const shapes = mark.shapes.map((shape, index) => {
    const side = index < 2 ? 0 : 1;
    if (shape.tag === 'path') {
      const drop = keyDrop(10 + side * 6);
      return <path key={index} d={shape.d} transform={`translate(0 ${interpolate(drop, [0, 1], [-viewHeight * 0.9, 0])})`} />;
    }
    const draw = progressAt(frame, 22 + side * 6, 16);
    return <rect key={index} x={shape.x} y={Number(shape.y)} width={shape.width} height={Number(shape.height) * draw} />;
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        backgroundColor: brand.tile,
        color: brand.glyph,
        boxShadow: shadows.logo,
        overflow: 'hidden',
        transform: `scale(${tileIn})`,
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg viewBox={mark.viewBox} fill="currentColor" style={{height: '100%', width: (size * viewWidth) / viewHeight, overflow: 'hidden'}}>
        {shapes}
      </svg>
    </div>
  );
}
