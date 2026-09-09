import designTokens from '../../design/tokens.json';
import {z} from 'zod';

export const copyVariantSchema = z.enum([
  'open-tabs',
  'play-more',
  'ownership',
  'customization',
  'songwriting',
  'shuffle',
  'chord-matching',
]);
const sceneCopySchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  explanation: z.string(),
});

export const copyPackSchema = z.object({
  openingHook: z.string(),
  openingFooter: z.string(),
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
  freezeFrame: z.boolean(),
  clipTitles: z.array(z.string()),
  sceneDurationSeconds: z.number().min(0.5).max(30).step(0.1),
  startOffsetSeconds: z.number().min(0).max(30).step(0.1),
  maxSecondsPerClip: z.number().min(0.5).max(12).step(0.1),
});

export const videoSchema = z.object({
  cut: z.enum(['short', 'standard', 'documentary']),
  appearance: z.enum(['light', 'dark']),
  copyVariant: copyVariantSchema,
  copyMode: z.enum(['preset', 'custom']),
  customCopy: copyPackSchema,
  accentPreset: z.enum(['neutral', 'blue', 'green', 'orange', 'pink', 'purple', 'teal', 'custom']).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour'),
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
}).superRefine((props, context) => {
  const accent = props.accentPreset && props.accentPreset !== 'custom'
    ? designTokens.accents[props.accentPreset]
    : props.accentColor;
  if (!/^#[0-9a-fA-F]{6}$/.test(accent)) return;
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((offset) => {
      const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  };
  const values = [luminance(accent), luminance(designTokens.campaigns['warm-stage'].background)].sort((a, b) => a - b);
  if ((values[1]! + 0.05) / (values[0]! + 0.05) < 4.5) {
    context.addIssue({code: 'custom', path: ['accentColor'], message: 'Accent must contrast at least 4.5:1 with the video background'});
  }
});

export type VideoProps = z.infer<typeof videoSchema>;
