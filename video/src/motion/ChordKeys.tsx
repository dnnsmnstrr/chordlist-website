import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, ChordPill, progressAt} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {accentFor, brand, sans, paletteFor, type MotionProps, type Palette} from './theme';

const copy = motionCopy.keyboard;

// Morning Light's progression, voiced within two octaves from C3 (MIDI 48).
const progression = [
  {name: 'G', notes: [55, 59, 62]},
  {name: 'D', notes: [62, 66, 69]},
  {name: 'Em', notes: [64, 67, 71]},
  {name: 'C', notes: [60, 64, 67]},
];
const FIRST = 48;
const LAST = 71;
const START = 30;
const EACH = 42;

const isBlack = (note: number) => [1, 3, 6, 8, 10].includes(note % 12);

function useChord() {
  const frame = useCurrentFrame();
  const index = Math.floor((frame - START) / EACH);
  const active = index >= 0 && index < progression.length ? index : -1;
  return {active, since: frame - START - Math.max(0, active) * EACH, frame};
}

/**
 * The keyboard is drawn like the mark: flat key tops, rounded bottoms, black keys that sit on the
 * whites. Pressed keys take the accent and sink by a few pixels.
 */
function Keyboard({palette, width, accent}: {palette: Palette; width: number; accent: string}) {
  const {active, since} = useChord();
  const whites: number[] = [];
  for (let note = FIRST; note <= LAST; note++) if (!isBlack(note)) whites.push(note);
  const whiteWidth = width / whites.length;
  const whiteHeight = whiteWidth * 4.6;
  const blackWidth = whiteWidth * 0.58;
  const blackHeight = whiteHeight * 0.62;
  const chord = active >= 0 ? progression[active] : undefined;

  const pressAmount = (note: number) => {
    if (!chord) return 0;
    const order = chord.notes.indexOf(note);
    if (order < 0) return 0;
    const down = progressAt(since, order * 2, 6);
    const up = progressAt(since, EACH - 8, 8);
    return down * (1 - up);
  };

  return (
    <div style={{position: 'relative', width, height: whiteHeight}}>
      {whites.map((note, index) => {
        const press = pressAmount(note);
        return (
          <div
            key={note}
            style={{
              position: 'absolute',
              left: index * whiteWidth,
              top: press * 6,
              width: whiteWidth - 4,
              height: whiteHeight,
              backgroundColor: press > 0.05 ? accent : brand.tile,
              borderRadius: `0 0 ${whiteWidth * 0.16}px ${whiteWidth * 0.16}px`,
              boxShadow: `inset 0 -${8 * (1 - press)}px 0 rgba(0,0,0,0.12)`,
            }}
          />
        );
      })}
      {Array.from({length: LAST - FIRST + 1}, (_, offset) => FIRST + offset)
        .filter(isBlack)
        .map((note) => {
          const whitesBefore = whites.filter((white) => white < note).length;
          const press = pressAmount(note);
          return (
            <div
              key={note}
              style={{
                position: 'absolute',
                left: whitesBefore * whiteWidth - blackWidth / 2 - 2,
                top: press * 4,
                width: blackWidth,
                height: blackHeight,
                backgroundColor: press > 0.05 ? accent : brand.glyph,
                border: `2px solid ${palette.isDark ? palette.background : brand.glyph}`,
                borderTop: 'none',
                borderRadius: `0 0 ${blackWidth * 0.18}px ${blackWidth * 0.18}px`,
              }}
            />
          );
        })}
    </div>
  );
}

/** The chord name, landing with a little weight each time the hand changes shape. */
function ChordName({size, palette}: {size: number; palette: Palette}) {
  const {active, since} = useChord();
  const {fps} = useVideoConfig();
  const chord = active >= 0 ? progression[active] : undefined;
  const land = spring({frame: since, fps, config: {damping: 14, stiffness: 180}});
  const leave = progressAt(since, EACH - 8, 8);
  return (
    <div
      style={{
        height: size * 1.1,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: -size * 0.04,
        color: palette.text,
        lineHeight: 1,
        opacity: chord ? land * (1 - leave) : 0,
        transform: `translateY(${interpolate(land, [0, 1], [size * 0.25, 0]) - leave * size * 0.15}px)`,
      }}
    >
      {chord?.name ?? ''}
    </div>
  );
}

function Progress({palette, size}: {palette: Palette; size: number}) {
  const {active, frame} = useChord();
  const filled = frame >= START + EACH * progression.length ? progression.length : active + 1;
  return (
    <ChordPill palette={palette} size={size} style={{minWidth: size * 6, justifyContent: 'center'}}>
      {progression.map((chord, index) => (
        <span key={chord.name} style={{opacity: index < filled ? 1 : 0.18}}>
          {chord.name}
        </span>
      ))}
    </ChordPill>
  );
}

/** Morning Light played on the chord keyboard, one chord at a time, as it is entered in the app. */
export function ChordKeys({campaign}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const accent = accentFor(campaign, campaign === 'ink' ? 'blue' : 'neutral');
  const {shape, content} = layout;
  const isWide = shape === 'wide';

  const headlineWidth = isWide ? content.width * 0.36 : content.width;
  const headSize = fitHeadline(layout, copy.headline, headlineWidth);
  const stageWidth = isWide ? content.width * 0.56 : content.width;
  const name = {story: 300, post: 190, square: 150, wide: 230}[shape];
  // Name, keyboard (14 white keys at 4.6:1) and progression pill, centred in what the copy leaves.
  const stageHeight = name * 1.1 + name * 0.32 + (stageWidth / 14) * 4.6 + name * 0.45;
  const spaceTop = isWide ? content.top : content.top + copy.headline.length * headSize * 1.14;
  const stageTop = spaceTop + Math.max(0, (content.bottom - spaceTop - stageHeight) / 2);

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
        <Arrive
          start={10}
          style={{
            position: 'absolute',
            left: isWide ? content.right - stageWidth : content.left,
            top: stageTop,
            width: stageWidth,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: name * 0.16,
          }}
        >
          <ChordName size={name} palette={palette} />
          <Keyboard palette={palette} width={stageWidth} accent={accent} />
          <div style={{marginTop: name * 0.1}}>
            <Progress palette={palette} size={Math.round(name * 0.16)} />
          </div>
        </Arrive>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
