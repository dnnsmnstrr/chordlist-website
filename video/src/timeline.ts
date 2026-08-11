import manifestJson from './generated/asset-manifest.json';
import type {VideoProps} from './video-schema';

export const FPS = 30;
export const HOOK_FRAMES = 72;
export const END_FRAMES = 90;
export const TRANSITION_FRAMES = 8;

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

export type ResolvedScene = VideoProps['scenes'][number] & {
  clips: ResolvedClip[];
  durationInFrames: number;
};

const manifest = manifestJson as Record<'light' | 'dark', ClipAsset[]>;

export const resolveScenes = (props: VideoProps): ResolvedScene[] => {
  const clipsByTitle = new Map(
    manifest[props.appearance].map((clip) => [clip.title, clip]),
  );

  const automatedScenes = props.scenes
    .filter((scene) => scene.enabled)
    .map((scene) => {
      const clips = scene.clipTitles.flatMap((title) => {
        const clip = clipsByTitle.get(title);
        if (!clip) {
          return [];
        }

        const sourceDurationInFrames = Math.max(1, Math.round(clip.durationInSeconds * FPS));
        const settleFrames = Math.min(
          Math.round(0.5 * FPS),
          Math.max(0, sourceDurationInFrames - Math.round(0.5 * FPS)),
        );
        const settledDurationInFrames = sourceDurationInFrames - settleFrames;
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
        clips,
        durationInFrames: Math.max(
          FPS * 2,
          clips.reduce((total, clip) => total + clip.durationInFrames, 0),
        ),
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
      eyebrow: 'Yours',
      headline: 'Readable Markdown files',
      clipTitles: ['Files / Markdown reveal'],
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
  const sequenceCount = scenes.length + 2;
  const contentFrames = scenes.reduce(
    (total, scene) => total + scene.durationInFrames,
    HOOK_FRAMES + END_FRAMES,
  );

  return contentFrames - Math.max(0, sequenceCount - 1) * TRANSITION_FRAMES;
};
