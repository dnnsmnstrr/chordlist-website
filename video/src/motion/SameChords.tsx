import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, progressAt} from './primitives';
import {Headline, SocialFrame, fitHeadline} from './scaffold';
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
 * numerals and every row turns out to read the same: the matching-progressions still, in motion.
 */
export function SameChords({campaign}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, content} = layout;
  const isWide = shape === 'wide';

  const headlineWidth = isWide ? content.width * 0.36 : content.width;
  const headSize = fitHeadline(layout, copy.headline, headlineWidth, shape === 'story' ? 0.86 : 1);
  const listWidth = isWide ? content.width * 0.58 : content.width;
  const listTop = isWide ? content.top : content.top + copy.headline.length * headSize * 1.14 + 48 * layout.scale;
  const room = content.bottom - listTop;
  const gap = Math.round(8 * layout.scale);
  const row = Math.min(Math.round(84 * layout.scale), Math.floor((room - gap * (matchingSongs.length - 1)) / matchingSongs.length));
  const font = Math.round(row * 0.36);

  const columnWidth = font * 2.7 * 4;
  const bandIn = progressAt(frame, FOLD_AT + 30, 24);
  const listHeight = matchingSongs.length * (row + gap) - gap;

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Headline
          layout={layout}
          palette={palette}
          lines={copy.headline}
          maxWidth={headlineWidth}
          scale={shape === 'story' ? 0.86 : 1}
          style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.28 : content.top}}
        />
        <div style={{position: 'absolute', left: isWide ? content.right - listWidth : content.left, top: listTop, width: listWidth}}>
          {/* The band that ties the folded columns together once every row reads the same. */}
          <div
            style={{
              position: 'absolute',
              right: font * 0.6,
              top: -gap,
              width: columnWidth + font * 0.6,
              height: (listHeight + gap * 2) * bandIn,
              borderRadius: 14,
              border: `2px solid ${palette.muted}`,
              opacity: bandIn,
            }}
          />
          <div style={{display: 'flex', flexDirection: 'column', gap}}>
            {matchingSongs.map((song, index) => (
              <SongRow key={song.title} song={song} index={index} palette={palette} width={listWidth} height={row} font={font} />
            ))}
          </div>
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
