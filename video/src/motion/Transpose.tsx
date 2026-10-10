import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, ChordPill, progressAt} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {chordColumns, morningLightChart, transposeChord} from './song';
import {mono, paletteFor, sans, type MotionProps, type Palette} from './theme';

const copy = motionCopy.transpose;

// Each step: the frame it lands on and the semitones from the written key. It returns to zero so
// the piece loops seamlessly.
const steps = [
  {at: 0, semitones: 0},
  {at: 66, semitones: 2},
  {at: 141, semitones: 5},
  {at: 216, semitones: 0},
];

function useSteps() {
  const frame = useCurrentFrame();
  let current = 0;
  steps.forEach((step, index) => {
    if (frame >= step.at) current = index;
  });
  const step = steps[current]!;
  const previous = steps[Math.max(0, current - 1)]!;
  return {step, previous, sinceChange: frame - step.at};
}

/** A chord that rolls from its old spelling to its new one, like a split-flap board. */
function RollingChord({from, to, progress, height}: {from: string; to: string; progress: number; height: number}) {
  if (from === to || progress >= 1) return <span>{to}</span>;
  return (
    <span style={{display: 'inline-block', position: 'relative', height, overflow: 'hidden', verticalAlign: 'top'}}>
      <span style={{display: 'block', transform: `translateY(${-progress * 100}%)`, opacity: 1 - progress}}>{from}</span>
      <span style={{display: 'block', position: 'absolute', top: 0, transform: `translateY(${(1 - progress) * 100}%)`}}>{to}</span>
    </span>
  );
}

function Chart({palette, fontSize}: {palette: Palette; fontSize: number}) {
  const {step, previous, sinceChange} = useSteps();
  const lineHeight = fontSize * 1.45;
  let chordIndex = 0;

  return (
    <div style={{fontFamily: mono, fontSize, color: palette.text, whiteSpace: 'pre'}}>
      {morningLightChart.slice(0, morningLightChart.findIndex((line) => line.kind === 'blank')).map((line, lineIndex) => {
        if (line.kind === 'section') {
          return (
            <div key={lineIndex} style={{display: 'flex', alignItems: 'center', gap: fontSize * 0.6, marginBottom: fontSize * 0.5}}>
              <ChordPill palette={palette} size={fontSize * 0.9} style={{fontFamily: mono, fontWeight: 600}}>
                {line.text}
              </ChordPill>
              <ChordPill palette={palette} size={fontSize * 0.9}>
                {(line.progression ?? []).map((chord, index) => {
                  const progress = progressAt(sinceChange, index * 2, 12);
                  return (
                    <RollingChord
                      key={index}
                      from={transposeChord(chord, previous.semitones)}
                      to={transposeChord(chord, step.semitones)}
                      progress={progress}
                      height={fontSize * 0.9 * 1.2}
                    />
                  );
                })}
              </ChordPill>
            </div>
          );
        }
        if (line.kind === 'chords') {
          return (
            <div key={lineIndex} style={{position: 'relative', height: lineHeight, color: palette.muted, fontWeight: 600}}>
              {chordColumns(line.text).map(({chord, column}) => {
                const delay = 6 + chordIndex++ * 3;
                const progress = progressAt(sinceChange, delay, 12);
                const pulse = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
                return (
                  <span
                    key={column}
                    style={{
                      position: 'absolute',
                      left: `${column}ch`,
                      top: 0,
                      lineHeight: `${lineHeight}px`,
                      color: pulse > 0.05 ? palette.text : palette.muted,
                    }}
                  >
                    <RollingChord
                      from={transposeChord(chord, previous.semitones)}
                      to={transposeChord(chord, step.semitones)}
                      progress={progress}
                      height={lineHeight}
                    />
                  </span>
                );
              })}
            </div>
          );
        }
        return (
          <div key={lineIndex} style={{height: lineHeight, lineHeight: `${lineHeight}px`}}>
            {line.text}
          </div>
        );
      })}
    </div>
  );
}

function Stepper({palette, size}: {palette: Palette; size: number}) {
  const {step, sinceChange} = useSteps();
  const bump = interpolate(progressAt(sinceChange, 0, 10), [0, 0.4, 1], [1, 1.08, 1]);
  const key = transposeChord('G', step.semitones);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.6, fontFamily: sans}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 999,
          border: `2px solid ${palette.rule}`,
          backgroundColor: palette.panel,
          overflow: 'hidden',
          fontSize: size,
          fontWeight: 600,
          color: palette.text,
        }}
      >
        <span style={{padding: `${size * 0.3}px ${size * 0.7}px`, borderRight: `2px solid ${palette.rule}`}}>−</span>
        <span
          style={{
            padding: `${size * 0.3}px ${size * 0.8}px`,
            fontFamily: mono,
            minWidth: size * 5.6,
            textAlign: 'center',
            transform: `scale(${bump})`,
          }}
        >
          {copy.stepLabel(step.semitones)}
        </span>
        <span style={{padding: `${size * 0.3}px ${size * 0.7}px`, borderLeft: `2px solid ${palette.rule}`}}>+</span>
      </div>
      <div style={{fontFamily: mono, fontSize: size * 0.8, color: palette.muted}}>
        {copy.key} <span style={{color: palette.text, fontWeight: 600}}>{key}</span>
      </div>
    </div>
  );
}

/**
 * Transpose as typography: the verse of Morning Light shifts key twice and comes home. Each chord
 * rolls in place and keeps the column it was written in, while the words never move.
 */
export function Transpose({campaign}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, content} = layout;
  const isWide = shape === 'wide';

  const headlineWidth = isWide ? content.width * 0.36 : content.width;
  const headSize = fitHeadline(layout, copy.headline, headlineWidth);
  // The longest chart line is 37 characters, and Geist Mono advances exactly 0.6em.
  const chartWidth = isWide ? content.width * 0.58 : content.width;
  const chartFont = Math.min({story: 40, post: 34, square: 30, wide: 36}[shape], chartWidth / (37 * 0.6));
  const chartTop = isWide ? content.top + content.height * 0.08 : content.top + copy.headline.length * headSize * 1.14 + 64 * layout.scale;

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Headline
          layout={layout}
          palette={palette}
          lines={copy.headline}
          maxWidth={headlineWidth}
          style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top}}
        />
        <Arrive start={12} style={{position: 'absolute', left: isWide ? content.right - chartWidth : content.left, top: chartTop}}>
          <Chart palette={palette} fontSize={chartFont} />
          <div style={{marginTop: chartFont * 1.4}}>
            <Stepper palette={palette} size={chartFont * 1.05} />
          </div>
        </Arrive>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
