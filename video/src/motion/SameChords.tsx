import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, progressAt} from './primitives';
import {Caption, CopyBlock, Footer} from './scaffold';
import {matchingSongs, romanNumerals} from './song';
import {mono, sans, paletteFor, type MotionProps, type Palette} from './theme';

const copy = motionCopy.sameChords;
const FOLD_AT = 105;

/** One library row: title first, artist second, the progression in fixed columns on the right. */
function SongRow({
  song,
  index,
  palette,
  width,
  height,
  font,
}: {
  song: (typeof matchingSongs)[number];
  index: number;
  palette: Palette;
  width: number;
  height: number;
  font: number;
}) {
  const frame = useCurrentFrame();
  const enter = progressAt(frame, 22 + index * 5, 20);
  const isSource = index === 0;
  const column = font * 2.7;
  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${font * 0.9}px`,
        borderRadius: 14,
        backgroundColor: isSource ? palette.text : palette.panel,
        color: isSource ? palette.background : palette.text,
        border: `2px solid ${isSource ? palette.text : palette.rule}`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 30}px)`,
      }}
    >
      <div style={{fontFamily: sans}}>
        <div style={{fontSize: font, fontWeight: 600, letterSpacing: -font * 0.02}}>{song.title}</div>
        <div style={{fontSize: font * 0.66, opacity: 0.62, marginTop: font * 0.12}}>{song.artist}</div>
      </div>
      <div style={{display: 'flex', fontFamily: mono, fontSize: font * 0.92, fontWeight: 600}}>
        {song.chords.map((chord, chordIndex) => {
          const fold = progressAt(frame, FOLD_AT + index * 3 + chordIndex * 2, 14);
          return (
            <span
              key={chordIndex}
              style={{
                width: column,
                textAlign: 'center',
                position: 'relative',
                height: font * 1.3,
                overflow: 'hidden',
                display: 'inline-block',
              }}
            >
              <span style={{position: 'absolute', inset: 0, transform: `translateY(${-fold * 100}%)`}}>{chord}</span>
              <span style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - fold) * 100}%)`}}>
                {romanNumerals[chordIndex]}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Seven songs from the app's own library, each in its own key. Their chords fold into Roman
 * numerals and every row turns out to read the same: the matching-progressions feature, shown.
 */
export function SameChords({campaign}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width} = layout;

  const list = {
    story: {left: pad, top: 480, width: width - pad * 2, row: 140, gap: 18, font: 40},
    portrait: {left: pad, top: 400, width: width - pad * 2, row: 96, gap: 14, font: 30},
    square: {left: pad, top: 335, width: width - pad * 2, row: 58, gap: 8, font: 22},
    wide: {left: 860, top: 150, width: 980, row: 96, gap: 14, font: 30},
  }[shape];

  const columnWidth = list.font * 2.7 * 4;
  const bandIn = progressAt(frame, FOLD_AT + 30, 24);
  const listHeight = matchingSongs.length * (list.row + list.gap) - list.gap;

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill>
        <div style={{position: 'absolute', left: pad, top: shape === 'wide' ? 200 : pad + 20}}>
          <CopyBlock layout={layout} palette={palette} eyebrow={copy.eyebrow} headline={copy.headline} />
        </div>
        <div style={{position: 'absolute', left: list.left, top: list.top, width: list.width}}>
          {/* The band that ties the folded columns together once every row reads the same. */}
          <div
            style={{
              position: 'absolute',
              right: list.font * 0.9 - list.font * 0.3,
              top: -list.gap,
              width: columnWidth + list.font * 0.6,
              height: (listHeight + list.gap * 2) * bandIn,
              borderRadius: 18,
              border: `2px solid ${palette.muted}`,
              opacity: bandIn,
            }}
          />
          <div style={{display: 'flex', flexDirection: 'column', gap: list.gap}}>
            {matchingSongs.map((song, index) => (
              <SongRow
                key={song.title}
                song={song}
                index={index}
                palette={palette}
                width={list.width}
                height={list.row}
                font={list.font}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: list.gap * 2.4,
              display: 'flex',
              justifyContent: 'flex-end',
              fontFamily: mono,
              fontSize: list.font * 1.1,
              fontWeight: 600,
              color: palette.text,
              opacity: bandIn,
              transform: `translateY(${interpolate(bandIn, [0, 1], [20, 0])}px)`,
              paddingRight: list.font * 0.9,
              width: '100%',
            }}
          >
            {copy.roman}
          </div>
        </div>
        <Caption
          layout={layout}
          palette={palette}
          text={copy.caption}
          start={FOLD_AT + 50}
          style={{
            position: 'absolute',
            left: pad,
            top: shape === 'wide' ? 200 + layout.headline * 3.3 : undefined,
            bottom: shape === 'wide' ? undefined : pad + layout.short * 0.04 + 36,
            maxWidth: shape === 'wide' ? 600 : undefined,
          }}
        />
        <Footer layout={layout} palette={palette} start={FOLD_AT + 60} />
      </AbsoluteFill>
    </Backdrop>
  );
}
