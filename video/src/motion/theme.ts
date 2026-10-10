import designTokens from '../../../design/tokens.json';
import {Easing, continueRender, delayRender, staticFile} from 'remotion';
import {z} from 'zod';

// Every motion piece is set in a named campaign theme from DESIGN.md, declared as a prop so the
// same composition can be re-rendered in another theme without touching its layout.
export const campaignSchema = z.enum(['ink', 'paper', 'blueprint', 'warm-stage']);
export type Campaign = z.infer<typeof campaignSchema>;

export const accentSchema = z.enum(['neutral', 'blue', 'green', 'orange', 'pink', 'purple', 'teal']);
export type AccentName = z.infer<typeof accentSchema>;

export const motionSchema = z.object({
  campaign: campaignSchema,
  appearance: z.enum(['light', 'dark']),
});
export type MotionProps = z.infer<typeof motionSchema>;

export type Palette = {
  background: string;
  panel: string;
  text: string;
  muted: string;
  rule: string;
  // The bezel around a screenshot: the panel colour, separated from the canvas by a hairline.
  bezelBorder: string;
  shadow: string;
  isDark: boolean;
};

export function paletteFor(campaign: Campaign): Palette {
  const theme = designTokens.campaigns[campaign];
  const isDark = campaign !== 'paper';
  return {
    ...theme,
    bezelBorder: isDark ? designTokens.core.dark.border : 'rgba(0,0,0,0.08)',
    shadow: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(40,32,20,0.18)',
    isDark,
  };
}

// The accent tokens are tuned for dark campaign backgrounds. On paper they are too light to read,
// so paper uses the ink of the theme and reserves colour for the app's own tint.
export function accentFor(campaign: Campaign, accent: AccentName = 'neutral') {
  if (campaign === 'paper') return designTokens.campaigns.paper.text;
  return designTokens.accents[accent];
}

export const accents = designTokens.accents;
export const brand = designTokens.brand;
export const radius = designTokens.radius;
export const shadows = designTokens.shadow;

// Fonts are vendored in video/public/fonts rather than fetched from Google at render time, so a
// render is hermetic like the OG and social builds. Both files are variable, covering 400–700.
export const sans = 'Geist Motion';
export const mono = 'Geist Mono Motion';

if (typeof window !== 'undefined' && 'FontFace' in window) {
  const handle = delayRender('Loading Geist');
  Promise.all(
    [
      [sans, 'fonts/Geist-Variable-latin.woff2'],
      [mono, 'fonts/GeistMono-Variable-latin.woff2'],
    ].map(async ([family, file]) => {
      const face = new FontFace(family!, `url(${staticFile(file!)}) format('woff2')`, {weight: '100 900'});
      document.fonts.add(await face.load());
    }),
  ).then(() => continueRender(handle), (error) => {
    throw error;
  });
}

export const FPS = 30;
export const seconds = (value: number) => Math.round(value * FPS);

// One curve for arrivals and one for departures keeps every piece moving with the same hand.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

export const formats = {
  story: {width: 1080, height: 1920},
  square: {width: 1080, height: 1080},
  portrait: {width: 1080, height: 1350},
  wide: {width: 1920, height: 1080},
} as const;
export type FormatName = keyof typeof formats;
