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
    colorScroll: ClipAsset;
  };
};

const manifest = manifestJson as AssetManifest;

const sceneBudgetsInSeconds: Record<
  VideoCut,
  Record<Exclude<SceneId, 'files'>, number>
> = {
  short: {
    collect: 1.5,
    find: 2,
    pace: 2.5,
    adapt: 2,
    'hands-free': 4.5,
  },
  standard: {
    collect: 4,
    find: 3.5,
    pace: 6,
    adapt: 4,
    'hands-free': 8,
  },
  documentary: {
    collect: 9,
    find: 8,
    pace: 8.5,
    adapt: 6.5,
    'hands-free': 8,
  },
};

const shortClipTitles: Record<Exclude<SceneId, 'files'>, string[]> = {
  collect: ['Song library'],
  find: ['Search'],
  pace: ['Speed control'],
  adapt: ['Transposed up a semitone'],
  'hands-free': ['Hands-free autoscroll'],
};

export const resolveScenes = (props: VideoProps): ResolvedScene[] => {
  const copy = resolveCopy(props.copyVariant, props.copyMode, props.customCopy);
  const clipsByTitle = new Map(
    manifest[props.appearance].map((clip) => [clip.title, clip]),
  );
  if (props.appearance === 'light') {
    clipsByTitle.set(manifest.featured.colorScroll.title, manifest.featured.colorScroll);
  }

  const automatedScenes = props.scenes
    .filter((scene) => scene.enabled)
    .map((scene, sceneIndex) => {
      const configuredTitles =
        props.cut === 'short' ? shortClipTitles[scene.id] : scene.clipTitles;
      const clipTitles =
        scene.id === 'hands-free' && props.appearance === 'light'
          ? [manifest.featured.colorScroll.title]
          : configuredTitles;
      const firstAvailableTitle = clipTitles.find((title) => clipsByTitle.has(title));
      let remainingSceneFrames = Math.round(
        sceneBudgetsInSeconds[props.cut][scene.id] * FPS,
      );
      const clips = clipTitles.flatMap((title) => {
        const clip = clipsByTitle.get(title);
        if (!clip || remainingSceneFrames <= 0) {
          return [];
        }

        const sourceDurationInFrames = Math.max(1, Math.round(clip.durationInSeconds * FPS));
        const isOpeningClip = sceneIndex === 0 && title === firstAvailableTitle;
        const startOffsetFrames = isOpeningClip || props.cut === 'documentary'
          ? 0
          : Math.min(
              Math.round(scene.startOffsetSeconds * FPS),
              Math.max(0, sourceDurationInFrames - Math.round(0.5 * FPS)),
            );
        const settledDurationInFrames = sourceDurationInFrames - startOffsetFrames;
        const perClipLimit =
          props.cut === 'documentary'
            ? settledDurationInFrames
            : Math.round(scene.maxSecondsPerClip * FPS);
        const durationInFrames = Math.max(
          1,
          Math.min(settledDurationInFrames, perClipLimit, remainingSceneFrames),
        );
        remainingSceneFrames -= durationInFrames;

        return [{
          ...clip,
          durationInFrames,
          trimBeforeInFrames: Math.max(0, sourceDurationInFrames - durationInFrames),
        }];
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
      id: 'files',
      ...copy.scenes.files,
      clipTitles: ['Files / Markdown reveal'],
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
