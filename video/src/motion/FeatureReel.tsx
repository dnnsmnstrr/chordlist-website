import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Lockup, Phone, RiseText, media, progressAt} from './primitives';
import {CopyBlock} from './scaffold';
import {chaptersFor, chordKeyboardOnScreen} from './recording';
import {mono, paletteFor, seconds, type MotionProps, type Palette} from './theme';

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

/** A thirty-second tour: one feature per scene, each shown by the real app. */
export function FeatureReel({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width, height} = layout;
  const isWide = shape === 'wide';
  const sources = shotsFor(appearance);

  const phone = isWide
    ? {h: 940, x: width - pad - 940 * 0.462 - 140, y: 70}
    : {h: 1100, x: (width - 1100 * 0.462) / 2, y: 500};
  const phoneIn = progressAt(frame, INTRO - 16, 26);
  const phoneOut = progressAt(frame, OUTRO_AT - 4, 18);
  const copyTop = isWide ? 300 : pad + 40;

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill>
        <Sequence durationInFrames={INTRO} layout="none">
          <div style={{position: 'absolute', left: pad, top: isWide ? 360 : 700}}>
            <RiseText text={copy.intro} start={6} palette={palette} size={layout.headline * 1.3} exitAt={INTRO - 14} />
          </div>
        </Sequence>
        {shots.map((item, index) => (
          <Sequence key={index} from={starts[index]!} durationInFrames={seconds(item.duration)} layout="none">
            <div style={{position: 'absolute', left: pad, top: copyTop}}>
              <CopyBlock
                layout={layout}
                palette={palette}
                eyebrow={copy.scenes[index]!.eyebrow}
                headline={copy.scenes[index]!.headline}
                start={2}
                exitAt={seconds(item.duration) - 14}
              />
            </div>
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
        <div style={{position: 'absolute', left: pad, bottom: pad, width: isWide ? 560 : width - pad * 2}}>
          <ChapterTicks palette={palette} width={isWide ? 560 : width - pad * 2} />
        </div>
        <Sequence from={OUTRO_AT} layout="none">
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 56, flexDirection: 'column'}}>
            <RiseText text={copy.outro} start={8} palette={palette} size={layout.headline * 1.2} align="center" />
            <OutroLockup palette={palette} size={Math.round(layout.short * 0.06)} />
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
    </Backdrop>
  );
}

function OutroLockup({palette, size}: {palette: Palette; size: number}) {
  const frame = useCurrentFrame();
  const enter = progressAt(frame, 20, 20);
  return (
    <div style={{opacity: enter, transform: `translateY(${(1 - enter) * 16}px)`, fontFamily: mono}}>
      <Lockup palette={palette} size={size} />
    </div>
  );
}
