import {z} from 'zod';

export const copyVariantSchema = z.enum(['open-tabs', 'play-more', 'ownership']);
const sceneCopySchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  explanation: z.string(),
});

export const copyPackSchema = z.object({
  openingHook: z.string(),
  endLine: z.string(),
  releaseLine: z.string(),
  scenes: z.object({
    collect: sceneCopySchema,
    find: sceneCopySchema,
    pace: sceneCopySchema,
    adapt: sceneCopySchema,
    'hands-free': sceneCopySchema,
    files: sceneCopySchema,
  }),
});
export const sceneIdSchema = z.enum([
  'collect',
  'find',
  'pace',
  'adapt',
  'hands-free',
]);

export const sceneSchema = z.object({
  id: sceneIdSchema,
  enabled: z.boolean(),
  clipTitles: z.array(z.string()),
  startOffsetSeconds: z.number().min(0).max(4).step(0.1),
  maxSecondsPerClip: z.number().min(0.5).max(12).step(0.1),
});

export const videoSchema = z.object({
  cut: z.enum(['short', 'standard', 'documentary']),
  appearance: z.enum(['light', 'dark']),
  copyVariant: copyVariantSchema,
  copyMode: z.enum(['preset', 'custom']),
  customCopy: copyPackSchema,
  accentColor: z.string().min(1),
  paperSeed: z.number().min(0).max(1000).step(1),
  mediaPadding: z.number().min(0).max(80).step(1),
  showShotLabels: z.boolean(),
  musicFile: z.string(),
  musicVolume: z.number().min(0).max(1).step(0.01),
  voiceoverFile: z.string(),
  voiceoverVolume: z.number().min(0).max(1).step(0.05),
  manualClipFile: z.string(),
  manualClipSeconds: z.number().min(1).max(12).step(0.1),
  scenes: z.array(sceneSchema),
});

export type VideoProps = z.infer<typeof videoSchema>;
