import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {EndCardScene} from './EndCard';
import {Backdrop, Phone, media, progressAt} from './primitives';
import {Headline, SocialFrame} from './scaffold';
import {chaptersFor, chordKeyboardOnScreen} from './recording';
import {paletteFor, seconds, type MotionProps, type Palette} from './theme';

const copy = motionCopy.reel;

type Shot = {image: string; video?: never; from?: never} | {video: true; from: number; image?: never};

// Six scenes cut from the press demo master. `from` is a point inside the named chapter where the
// action of that scene is already on screen; durations are in seconds.
const shotsFor = (appearance: 'light' | 'dark'): {shot: Shot; duration: number}[] => {
  const chapters = chaptersFor(appearance);
  return [
    {shot: {image: '01-Song-List'}, duration: 3.2},
    {shot: {video: true, from: chordKeyboardOnScreen[appearance]}, duration: 3.6},
    {shot: {video: true, from: chapters.search.start + 0.6}, duration: 4.5},
    {shot: {video: true, from: chapters.matchingSongs.start + 1}, duration: 3.6},
    {shot: {video: true, from: chapters.transposeControl.start - 0.3}, duration: 4.6},
    {shot: {video: true, from: chapters.handsFree.start + 0.2}, duration: 5},
  ];
};
// Durations are the same in both appearances; only the source offsets differ.
const shots = shotsFor('light');
const INTRO = seconds(2.6);
const OUTRO = seconds(3.4);
const FADE = 8;

const starts = shots.reduce<number[]>((list, _, index) => {
  list.push(index === 0 ? INTRO : list[index - 1]! + seconds(shots[index - 1]!.duration));
  return list;
}, []);
const OUTRO_AT = starts[starts.length - 1]! + seconds(shots[shots.length - 1]!.duration);
export const featureReelSeconds = (OUTRO_AT + OUTRO) / 30;

function ChapterTicks({palette, width}: {palette: Palette; width: number}) {
  const frame = useCurrentFrame();
  const gap = 10;
  const tick = (width - gap * (shots.length - 1)) / shots.length;
  const visible = progressAt(frame, INTRO - 10, 14) * (1 - progressAt(frame, OUTRO_AT, 10));
  return (
    <div style={{display: 'flex', gap, opacity: visible}}>
      {shots.map((item, index) => {
        const fill = interpolate(frame, [starts[index]!, starts[index]! + seconds(item.duration)], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div key={index} style={{width: tick, height: 6, borderRadius: 3, backgroundColor: palette.rule, overflow: 'hidden'}}>
            <div style={{width: `${fill * 100}%`, height: '100%', backgroundColor: palette.text}} />
          </div>
        );
      })}
    </div>
  );
}

/** A thirty-second tour: one feature per scene, each shown by the real app, ending on the end card. */
export function FeatureReel({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, content, width, height, pad} = layout;
  const isWide = shape === 'wide';
  const sources = shotsFor(appearance);

  const phoneHeight = isWide ? height - pad * 1.2 : 1120;
  const phone = isWide
    ? {h: phoneHeight, x: content.right - phoneHeight * 0.462 - 120, y: (height - phoneHeight) / 2}
    : // Off the right edge like the screenshot stills, which keeps the footnote clear.
      {h: phoneHeight, x: width - phoneHeight * 0.462 * 0.86, y: content.top + layout.headline * 3.5 + 20};
  const phoneIn = progressAt(frame, INTRO - 16, 26);
  const phoneOut = progressAt(frame, OUTRO_AT - 4, 18);
  const copyLeft = content.left;
  const copyTop = isWide ? content.top + content.height * 0.3 : content.top;
  const copyWidth = isWide ? content.width * 0.42 : content.width;

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Sequence durationInFrames={INTRO} layout="none">
          <Headline
            layout={layout}
            palette={palette}
            lines={copy.intro}
            scale={1.3}
            maxWidth={copyWidth}
            exitAt={INTRO - 14}
            style={{position: 'absolute', left: copyLeft, top: content.top + content.height * 0.36}}
          />
        </Sequence>
        {shots.map((item, index) => (
          <Sequence key={index} from={starts[index]!} durationInFrames={seconds(item.duration)} layout="none">
            <Headline
              layout={layout}
              palette={palette}
              lines={copy.scenes[index]!}
              start={2}
              maxWidth={copyWidth}
              exitAt={seconds(item.duration) - 14}
              style={{position: 'absolute', left: copyLeft, top: copyTop}}
            />
          </Sequence>
        ))}
        <div
          style={{
            position: 'absolute',
            left: phone.x,
            top: phone.y,
            opacity: phoneIn * (1 - phoneOut),
            transform: `translateY(${(1 - phoneIn) * height * 0.08 - phoneOut * height * 0.05}px)`,
          }}
        >
          <Phone palette={palette} height={phone.h}>
            {sources.map((item, index) => {
              const start = starts[index]!;
              const duration = seconds(item.duration);
              // Each shot overlaps the next by FADE frames so cuts dissolve rather than jump.
              const opacity = interpolate(frame, [start - FADE, start], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <Sequence key={index} from={start - FADE} durationInFrames={duration + FADE * 2} layout="none">
                  <AbsoluteFill style={{opacity: index === 0 ? 1 : opacity}}>
                    {item.shot.image ? (
                      <Img src={staticFile(media.screen(appearance, item.shot.image))} style={{width: '100%', height: '100%'}} />
                    ) : (
                      <OffthreadVideo
                        src={staticFile(media.recording(appearance))}
                        muted
                        trimBefore={seconds(item.shot.from!)}
                        style={{width: '100%', height: '100%'}}
                      />
                    )}
                  </AbsoluteFill>
                </Sequence>
              );
            })}
          </Phone>
        </div>
        <div
          style={{
            position: 'absolute',
            left: copyLeft,
            // Wide: under the longest (three-line) headline. Story: between the lockup and the copy.
            top: isWide ? copyTop + layout.headline * 3.9 : content.top - layout.headline * 0.45,
            width: isWide ? 520 : content.width,
          }}
        >
          <ChapterTicks palette={palette} width={isWide ? 520 : content.width} />
        </div>
        <Sequence durationInFrames={OUTRO_AT} layout="none">
          <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} exitAt={OUTRO_AT - 14} />
        </Sequence>
        <Sequence from={OUTRO_AT} layout="none">
          <EndCardScene campaign={campaign} />
        </Sequence>
      </AbsoluteFill>
    </Backdrop>
  );
}
