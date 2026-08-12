import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {loadFont as loadGeist} from '@remotion/google-fonts/Geist';
import {loadFont as loadGeistMono} from '@remotion/google-fonts/GeistMono';
import {paper} from '@remotion/effects/paper';
import type {ReactNode} from 'react';
import {
  AbsoluteFill,
  Freeze,
  Html5Audio,
  Img,
  OffthreadVideo,
  Series,
  Solid,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  FPS,
  getSceneTransitionFrames,
  getTimingProfile,
  resolveScenes,
  type ResolvedClip,
  type ResolvedScene,
} from './timeline';
import {resolveCopy} from './copy';
import type {VideoProps} from './video-schema';

type Palette = {
  background: string;
  panel: string;
  text: string;
  secondaryText: string;
  border: string;
  shadow: string;
};

const paletteFor = (): Palette => ({
  background: '#161411',
  panel: '#25221D',
  text: '#FAFAF8',
  secondaryText: '#A6A29A',
  border: 'rgba(255, 255, 255, 0.11)',
  shadow: 'rgba(0, 0, 0, 0.62)',
});

const {fontFamily: baseFont} = loadGeist('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const {fontFamily: monoFont} = loadGeistMono('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin'],
});

const normalizeLineBreaks = (text: string) =>
  text.replace(/\\r\\n|\\n|\\r/g, '\n');

const Background: React.FC<{
  seed: number;
}> = ({seed}) => {
  const {height, width} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: '#161411', overflow: 'hidden'}}>
      <Solid
        color="#161411"
        width={width}
        height={height}
        effects={[
          paper({
            colorFront: '#565149',
            colorBack: '#13110F',
            amount: 0.95,
            contrast: 0.42,
            roughness: 0.47,
            fiber: 0.4,
            fiberSize: 0.29,
            crumples: 0.4,
            crumpleSize: 0.43,
            folds: 0.56,
            foldCount: 6,
            drops: 0.19,
            scale: 0.72,
            seed,
          }),
        ]}
      />
    </AbsoluteFill>
  );
};

const BrandMark: React.FC<{
  palette: Palette;
}> = ({palette}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: monoFont,
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: -0.5,
      color: palette.text,
    }}
  >
    <span
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: palette.text,
        color: palette.background,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 270 613"
        fill="currentColor"
        aria-hidden="true"
        style={{width: 22, height: 32}}
      >
        <rect x="0" y="0" width="76" height="375" rx="10" />
        <rect x="35.5" y="307" width="5" height="306" />
        <rect x="194" y="0" width="76" height="375" rx="10" />
        <rect x="229.5" y="307" width="5" height="306" />
      </svg>
    </span>
    chordlist
  </div>
);

const HookCard: React.FC<{
  text: string;
  footer: string;
  palette: Palette;
  accentColor: string;
  paperSeed: number;
}> = ({text, footer, palette, accentColor, paperSeed}) => {
  const frame = useCurrentFrame();
  const enter = spring({
    frame,
    fps: FPS,
    durationInFrames: 28,
    config: {damping: 18, stiffness: 120},
  });

  return (
    <AbsoluteFill>
      <Background seed={paperSeed} />
      <div
        style={{
          position: 'absolute',
          inset: 76,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: baseFont,
        }}
      >
        <BrandMark palette={palette} />
        <div
          style={{
            opacity: enter,
            transform: `translateY(${interpolate(enter, [0, 1], [70, 0])}px)`,
          }}
        >
          <div
            style={{
              width: 92,
              height: 12,
              borderRadius: 6,
              backgroundColor: accentColor,
              marginBottom: 42,
            }}
          />
          <div
            style={{
              color: palette.text,
              fontSize: 102,
              fontWeight: 600,
              letterSpacing: -3.4,
              lineHeight: 1,
              maxWidth: 900,
              whiteSpace: 'pre-line',
            }}
          >
            {normalizeLineBreaks(text)}
          </div>
        </div>
        <div
          style={{
            color: palette.secondaryText,
            fontSize: 25,
            fontFamily: monoFont,
            fontWeight: 400,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
          }}
        >
          {normalizeLineBreaks(footer)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{
  clip: ResolvedClip;
  palette: Palette;
  padding: number;
  showLabel: boolean;
  slideIn: boolean;
  verticalOffset: number;
  focusProgress: number;
  fadeTowardTop: boolean;
  freezeFrame: boolean;
}> = ({
  clip,
  palette,
  padding,
  showLabel,
  slideIn,
  verticalOffset,
  focusProgress,
  fadeTowardTop,
  freezeFrame,
}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const availableHeight = height - 430;
  const videoHeight = Math.min(1390, availableHeight - padding * 2);
  const videoWidth = videoHeight * (1242 / 2688);
  const entrance = slideIn
    ? spring({
        frame,
        fps: FPS,
        durationInFrames: 28,
        config: {damping: 20, stiffness: 110, mass: 0.9},
      })
    : 1;
  const focusScale = interpolate(focusProgress, [0, 1], [1, 1.22]);
  const focusLift = interpolate(focusProgress, [0, 1], [0, -34]);
  const topFade =
    'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.18) 16%, black 38%, black 100%)';

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: videoWidth + padding * 2,
          height: videoHeight + padding * 2,
          padding,
          boxSizing: 'border-box',
          borderRadius: 58,
          backgroundColor: palette.panel,
          border: `2px solid ${palette.border}`,
          boxShadow: `0 28px 70px ${palette.shadow}`,
          opacity: interpolate(entrance, [0, 1], [0.35, 1]),
          transform: `translate(${interpolate(entrance, [0, 1], [520, 0])}px, ${verticalOffset + focusLift}px) scale(${focusScale})`,
          transformOrigin: '50% 82%',
          maskImage: fadeTowardTop ? topFade : undefined,
          WebkitMaskImage: fadeTowardTop ? topFade : undefined,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: videoWidth,
            height: videoHeight,
            borderRadius: 38,
            overflow: 'hidden',
            backgroundColor: '#000000',
          }}
        >
          {clip.mediaType === 'image' ? (
            <Img
              src={staticFile(clip.file)}
              style={{width: '100%', height: '100%', objectFit: 'contain'}}
            />
          ) : (
            // Freeze owns the video timeline, so seek with its frame instead of trimBefore.
            <Freeze
              frame={freezeFrame ? clip.trimBeforeInFrames : 0}
              active={freezeFrame}
            >
              <OffthreadVideo
                src={staticFile(clip.file)}
                volume={0}
                trimBefore={freezeFrame ? undefined : clip.trimBeforeInFrames}
                style={{width: '100%', height: '100%', objectFit: 'contain'}}
              />
            </Freeze>
          )}
          {showLabel ? (
            <div
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                bottom: 24,
                padding: '16px 20px',
                borderRadius: 22,
                backgroundColor: 'rgba(0, 0, 0, 0.72)',
                color: '#FFFFFF',
                fontFamily: baseFont,
                fontSize: 22,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {clip.title}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EmptyScene: React.FC<{
  palette: Palette;
}> = ({palette}) => (
  <AbsoluteFill
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      color: palette.secondaryText,
      fontFamily: baseFont,
      fontSize: 30,
    }}
  >
    Capture and prepare this scene to add its footage.
  </AbsoluteFill>
);

const ProductScene: React.FC<{
  scene: ResolvedScene;
  index: number;
  total: number;
  palette: Palette;
  accentColor: string;
  mediaPadding: number;
  showShotLabels: boolean;
  showExplanation: boolean;
  paperSeed: number;
}> = ({
  scene,
  index,
  total,
  palette,
  accentColor,
  mediaPadding,
  showShotLabels,
  showExplanation,
  paperSeed,
}) => {
  const frame = useCurrentFrame();
  const headingDelay = index === 1 ? 8 : 0;
  const enter = spring({
    frame: Math.max(0, frame - headingDelay),
    fps: FPS,
    durationInFrames: 20,
    config: {damping: 20, stiffness: 150},
  });
  const headingExit =
    index === 0
      ? interpolate(
          frame,
          [scene.durationInFrames - 18, scene.durationInFrames - 10],
          [1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
        )
      : 1;
  const headingOpacity = enter * headingExit;
  const transposeFocus =
    scene.id === 'adapt'
      ? spring({
          frame,
          fps: FPS,
          durationInFrames: 34,
          config: {damping: 20, stiffness: 85, mass: 1},
        })
      : 0;

  return (
    <AbsoluteFill>
      <Background seed={paperSeed} />
      {scene.clips.length > 0 ? (
        <Series>
          {scene.clips.map((clip, clipIndex) => (
            <Series.Sequence
              key={clip.file}
              name={clip.title}
              durationInFrames={clip.durationInFrames}
            >
              <Clip
                clip={clip}
                palette={palette}
                padding={mediaPadding}
                showLabel={showShotLabels}
                slideIn={index === 0 && clipIndex === 0}
                verticalOffset={showExplanation ? 90 : 0}
                focusProgress={transposeFocus}
                fadeTowardTop={scene.id === 'adapt'}
                freezeFrame={scene.freezeFrame}
              />
            </Series.Sequence>
          ))}
        </Series>
      ) : (
        <EmptyScene palette={palette} />
      )}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 72,
          right: 72,
          fontFamily: baseFont,
          opacity: headingOpacity,
          transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
        }}
      >
        <div
          style={{
            color: accentColor,
            fontSize: 25,
            lineHeight: 1,
            fontFamily: monoFont,
            fontWeight: 500,
            letterSpacing: 3.6,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          {scene.eyebrow}
        </div>
        <div
          style={{
            color: palette.text,
            fontSize: 66,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: -2.2,
            maxWidth: 900,
          }}
        >
          {scene.headline}
        </div>
        {showExplanation ? (
          <div
            style={{
              color: palette.secondaryText,
              fontSize: 29,
              lineHeight: 1.28,
              fontWeight: 400,
              letterSpacing: -0.4,
              marginTop: 18,
              maxWidth: 790,
            }}
          >
            {scene.explanation}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 74,
          right: 72,
          display: 'flex',
          gap: 10,
          opacity: headingOpacity,
        }}
      >
        {Array.from({length: total}).map((_, dotIndex) => (
          <div
            key={dotIndex}
            style={{
              width: dotIndex === index ? 34 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: dotIndex === index ? accentColor : palette.border,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{
  endLine: string;
  releaseLine: string;
  palette: Palette;
  accentColor: string;
  paperSeed: number;
}> = ({endLine, releaseLine, palette, accentColor, paperSeed}) => {
  const frame = useCurrentFrame();
  const enter = spring({
    frame,
    fps: FPS,
    durationInFrames: 28,
    config: {damping: 18, stiffness: 120},
  });

  return (
    <AbsoluteFill>
      <Background seed={paperSeed} />
      <div
        style={{
          position: 'absolute',
          inset: 76,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: baseFont,
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        }}
      >
        <BrandMark palette={palette} />
        <div
          style={{
            color: palette.text,
            fontSize: 88,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: -3.2,
            marginTop: 76,
            maxWidth: 900,
            whiteSpace: 'pre-line',
          }}
        >
          {normalizeLineBreaks(endLine)}
        </div>
        <div
          style={{
            marginTop: 56,
            display: 'inline-flex',
            alignSelf: 'flex-start',
            borderRadius: 999,
            padding: '19px 28px',
            backgroundColor: accentColor,
            color: palette.background,
            fontSize: 27,
            lineHeight: 1,
            fontWeight: 600,
          }}
        >
          {releaseLine}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const transition = (key: string, durationInFrames: number): ReactNode => (
  <TransitionSeries.Transition
    key={key}
    timing={linearTiming({durationInFrames})}
    presentation={fade()}
  />
);

export const ChordlistDemo: React.FC<VideoProps> = (props) => {
  const scenes = resolveScenes(props);
  const copy = resolveCopy(props.copyVariant, props.copyMode, props.customCopy);
  const palette = paletteFor();
  const timing = getTimingProfile(props.cut);
  const timeline: ReactNode[] = [
    <TransitionSeries.Sequence
      key="hook"
      name="Opening hook"
      durationInFrames={timing.hookFrames}
    >
      <HookCard
        text={copy.openingHook}
        footer={copy.openingFooter}
        palette={palette}
        accentColor={props.accentColor}
        paperSeed={props.paperSeed}
      />
    </TransitionSeries.Sequence>,
  ];

  scenes.forEach((scene, index) => {
    timeline.push(
      transition(
        `transition-scene-${index}`,
        getSceneTransitionFrames(props.cut, index),
      ),
    );
    timeline.push(
      <TransitionSeries.Sequence
        key={`scene-${scene.eyebrow}`}
        name={`${index + 1}. ${scene.eyebrow}`}
        durationInFrames={scene.durationInFrames}
      >
        <ProductScene
          scene={scene}
          index={index}
          total={scenes.length}
          palette={palette}
          accentColor={props.accentColor}
          mediaPadding={props.mediaPadding}
          showShotLabels={props.showShotLabels}
          showExplanation={props.cut === 'documentary'}
          paperSeed={props.paperSeed}
        />
      </TransitionSeries.Sequence>,
    );
  });

  timeline.push(transition('transition-end', timing.transitionFrames));
  timeline.push(
    <TransitionSeries.Sequence
      key="end"
      name="End card"
      durationInFrames={timing.endFrames}
    >
      <EndCard
        endLine={copy.endLine}
        releaseLine={copy.releaseLine}
        palette={palette}
        accentColor={props.accentColor}
        paperSeed={props.paperSeed}
      />
    </TransitionSeries.Sequence>,
  );

  return (
    <AbsoluteFill>
      <TransitionSeries>{timeline}</TransitionSeries>
      {props.musicFile ? (
        <Html5Audio
          src={staticFile(`audio/${props.musicFile}`)}
          volume={props.musicVolume}
          loop
        />
      ) : null}
      {props.voiceoverFile ? (
        <Html5Audio
          src={staticFile(`audio/${props.voiceoverFile}`)}
          volume={props.voiceoverVolume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
