import manifestJson from './generated/asset-manifest.json';
import {resolveCopy, type SceneId} from './copy';
import type {VideoProps} from './video-schema';

export const FPS = 30;

type VideoCut = VideoProps['cut'];

const timingProfiles: Record<
  VideoCut,
  {
    hookFrames: number;
    endFrames: number;
    transitionFrames: number;
    firstSceneBlendFrames: number;
  }
> = {
  short: {
    hookFrames: 45,
    endFrames: 60,
    transitionFrames: 6,
    firstSceneBlendFrames: 12,
  },
  standard: {
    hookFrames: 90,
    endFrames: 108,
    transitionFrames: 8,
    firstSceneBlendFrames: 18,
  },
  documentary: {
    hookFrames: 108,
    endFrames: 144,
    transitionFrames: 10,
    firstSceneBlendFrames: 20,
  },
};

export const getTimingProfile = (cut: VideoCut) => timingProfiles[cut];

export const getSceneTransitionFrames = (cut: VideoCut, sceneIndex: number): number => {
  const timing = getTimingProfile(cut);
  return sceneIndex === 1 ? timing.firstSceneBlendFrames : timing.transitionFrames;
};

export type ClipAsset = {
  title: string;
  summary: string;
  durationInSeconds: number;
  file: string;
  poster: string | null;
  mediaType?: 'video' | 'image';
};

export type ResolvedClip = ClipAsset & {
  durationInFrames: number;
  trimBeforeInFrames: number;
};

export type ResolvedScene = Omit<VideoProps['scenes'][number], 'id'> & {
  id: SceneId;
  eyebrow: string;
  headline: string;
  explanation: string;
  clips: ResolvedClip[];
  durationInFrames: number;
};

type AssetManifest = Record<'light' | 'dark', ClipAsset[]> & {
  featured: {
    settingsAppearance: ClipAsset;
    colorScroll: ClipAsset;
  };
};

const manifest = manifestJson as AssetManifest;

const shortClipTitles: Record<Exclude<SceneId, 'files'>, string[]> = {
  collect: ['Song library'],
  find: ['Search'],
  pace: ['Speed control'],
  adapt: ['Transposed up a semitone'],
  'hands-free': ['Hands-free autoscroll'],
};

const resolveFrozenSource = (
  clips: ClipAsset[],
  offsetInFrames: number,
): {clip: ClipAsset; sourceFrame: number} | null => {
  let remainingOffset = offsetInFrames;

  for (const clip of clips) {
    const sourceFrames = Math.max(1, Math.round(clip.durationInSeconds * FPS));
    if (remainingOffset < sourceFrames) {
      return {clip, sourceFrame: remainingOffset};
    }
    remainingOffset -= sourceFrames;
  }

  const lastClip = clips.at(-1);
  if (!lastClip) {
    return null;
  }

  return {
    clip: lastClip,
    sourceFrame: Math.max(0, Math.round(lastClip.durationInSeconds * FPS) - 1),
  };
};

export const resolveScenes = (props: VideoProps): ResolvedScene[] => {
  const copy = resolveCopy(props.copyVariant, props.copyMode, props.customCopy);
  const clipsByTitle = new Map(
    manifest[props.appearance].map((clip) => [clip.title, clip]),
  );
  if (props.appearance === 'light') {
    clipsByTitle.set(
      manifest.featured.settingsAppearance.title,
      manifest.featured.settingsAppearance,
    );
    clipsByTitle.set(
      manifest.featured.colorScroll.title,
      manifest.featured.colorScroll,
    );
  }

  const automatedScenes = props.scenes
    .filter((scene) => scene.enabled)
    .map((scene) => {
      const configuredTitles =
        props.cut === 'short' ? shortClipTitles[scene.id] : scene.clipTitles;
      const clipTitles =
        scene.id === 'hands-free' && props.appearance === 'light'
          ? [
              manifest.featured.settingsAppearance.title,
              manifest.featured.colorScroll.title,
            ]
          : configuredTitles;
      const availableClips = clipTitles.flatMap((title) => {
        const clip = clipsByTitle.get(title);
        return clip ? [clip] : [];
      });
      let remainingSceneFrames = Math.round(scene.sceneDurationSeconds * FPS);
      const frozenSource = scene.freezeFrame
        ? resolveFrozenSource(
            availableClips,
            Math.round(scene.startOffsetSeconds * FPS),
          )
        : null;
      let remainingOffsetFrames = Math.round(scene.startOffsetSeconds * FPS);
      const clips = frozenSource
        ? [
            {
              ...frozenSource.clip,
              durationInFrames: Math.max(1, remainingSceneFrames),
              trimBeforeInFrames: frozenSource.sourceFrame,
            },
          ]
        : availableClips.flatMap((clip) => {
            if (remainingSceneFrames <= 0) {
              return [];
            }

            const sourceDurationInFrames = Math.max(
              1,
              Math.round(clip.durationInSeconds * FPS),
            );
            if (remainingOffsetFrames >= sourceDurationInFrames) {
              remainingOffsetFrames -= sourceDurationInFrames;
              return [];
            }

            const startOffsetFrames = remainingOffsetFrames;
            remainingOffsetFrames = 0;
            const durationInFrames = Math.max(
              1,
              Math.min(
                sourceDurationInFrames - startOffsetFrames,
                Math.round(scene.maxSecondsPerClip * FPS),
                remainingSceneFrames,
              ),
            );
            remainingSceneFrames -= durationInFrames;

            return [
              {
                ...clip,
                durationInFrames,
                trimBeforeInFrames: startOffsetFrames,
              },
            ];
          });

      return {
        ...scene,
        ...copy.scenes[scene.id],
        clips,
        durationInFrames:
          clips.length > 0
            ? clips.reduce((total, clip) => total + clip.durationInFrames, 0)
            : FPS * 2,
      };
    });

  if (!props.manualClipFile) {
    return automatedScenes;
  }

  const durationInFrames = Math.round(props.manualClipSeconds * FPS);
  return [
    ...automatedScenes,
    {
      enabled: true,
      freezeFrame: false,
      id: 'files',
      ...copy.scenes.files,
      clipTitles: ['Files / Markdown reveal'],
      sceneDurationSeconds: props.manualClipSeconds,
      startOffsetSeconds: 0,
      maxSecondsPerClip: props.manualClipSeconds,
      clips: [
        {
          title: 'Files / Markdown reveal',
          summary: 'The separately recorded ownership proof point.',
          durationInSeconds: props.manualClipSeconds,
          durationInFrames,
          trimBeforeInFrames: 0,
          file: `manual/${props.manualClipFile}`,
          poster: null,
        },
      ],
      durationInFrames,
    },
  ];
};

export const getDurationInFrames = (props: VideoProps): number => {
  const scenes = resolveScenes(props);
  const timing = getTimingProfile(props.cut);
  const contentFrames = scenes.reduce(
    (total, scene) => total + scene.durationInFrames,
    timing.hookFrames + timing.endFrames,
  );
  const sceneTransitionFrames = scenes.reduce(
    (total, _, sceneIndex) =>
      total + getSceneTransitionFrames(props.cut, sceneIndex),
    0,
  );

  return contentFrames - sceneTransitionFrames - timing.transitionFrames;
};
