import manifestJson from './generated/asset-manifest.json';
import {getCopy, type SceneId} from './copy';
import type {VideoProps} from './video-schema';

export const FPS = 30;
export const HOOK_FRAMES = 72;
export const END_FRAMES = 90;
export const TRANSITION_FRAMES = 8;
export const FIRST_SCENE_BLEND_FRAMES = 18;

export const getSceneTransitionFrames = (sceneIndex: number): number =>
  sceneIndex === 1 ? FIRST_SCENE_BLEND_FRAMES : TRANSITION_FRAMES;

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
  clips: ResolvedClip[];
  durationInFrames: number;
};

const manifest = manifestJson as Record<'light' | 'dark', ClipAsset[]>;

export const resolveScenes = (props: VideoProps): ResolvedScene[] => {
  const copy = getCopy(props.copyVariant);
  const clipsByTitle = new Map(
    manifest[props.appearance].map((clip) => [clip.title, clip]),
  );

  const automatedScenes = props.scenes
    .filter((scene) => scene.enabled)
    .map((scene, sceneIndex) => {
      const firstAvailableTitle = scene.clipTitles.find((title) => clipsByTitle.has(title));
      const clips = scene.clipTitles.flatMap((title) => {
        const clip = clipsByTitle.get(title);
        if (!clip) {
          return [];
        }

        const sourceDurationInFrames = Math.max(1, Math.round(clip.durationInSeconds * FPS));
        const isOpeningClip = sceneIndex === 0 && title === firstAvailableTitle;
        const startOffsetFrames = isOpeningClip
          ? 0
          : Math.min(
              Math.round(scene.startOffsetSeconds * FPS),
              Math.max(0, sourceDurationInFrames - Math.round(0.5 * FPS)),
            );
        const settledDurationInFrames = sourceDurationInFrames - startOffsetFrames;
        const durationInFrames = Math.max(
            1,
            Math.min(settledDurationInFrames, Math.round(scene.maxSecondsPerClip * FPS)),
        );

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
  const contentFrames = scenes.reduce(
    (total, scene) => total + scene.durationInFrames,
    HOOK_FRAMES + END_FRAMES,
  );
  const sceneTransitionFrames = scenes.reduce(
    (total, _, sceneIndex) => total + getSceneTransitionFrames(sceneIndex),
    0,
  );

  return contentFrames - sceneTransitionFrames - TRANSITION_FRAMES;
};
