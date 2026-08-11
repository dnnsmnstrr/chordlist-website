import {zColor} from '@remotion/zod-types';
import {z} from 'zod';

export const sceneSchema = z.object({
  enabled: z.boolean(),
  eyebrow: z.string(),
  headline: z.string(),
  clipTitles: z.array(z.string()),
  maxSecondsPerClip: z.number().min(0.5).max(12).step(0.1),
});

export const videoSchema = z.object({
  appearance: z.enum(['light', 'dark']),
  accentColor: zColor() as unknown as z.ZodType<string>,
  openingHook: z.string(),
  endLine: z.string(),
  releaseLine: z.string(),
  mediaPadding: z.number().min(0).max(80).step(1),
  showShotLabels: z.boolean(),
  musicFile: z.string(),
  musicVolume: z.number().min(0).max(1).step(0.05),
  voiceoverFile: z.string(),
  voiceoverVolume: z.number().min(0).max(1).step(0.05),
  manualClipFile: z.string(),
  manualClipSeconds: z.number().min(1).max(12).step(0.1),
  scenes: z.array(sceneSchema),
});

export type VideoProps = z.infer<typeof videoSchema>;
