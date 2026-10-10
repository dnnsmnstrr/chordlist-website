import {useVideoConfig} from 'remotion';

export type Layout = {
  width: number;
  height: number;
  shape: 'story' | 'portrait' | 'square' | 'wide';
  pad: number;
  short: number;
  /** Headline size that reads at a glance in this format. */
  headline: number;
  body: number;
  eyebrow: number;
};

export function useLayout(): Layout {
  const {width, height} = useVideoConfig();
  const ratio = width / height;
  const shape = ratio > 1.2 ? 'wide' : ratio > 0.95 ? 'square' : ratio > 0.7 ? 'portrait' : 'story';
  const short = Math.min(width, height);
  const pad = Math.round(short * (shape === 'wide' ? 0.075 : 0.072));
  const headline = {story: 104, portrait: 88, square: 78, wide: 92}[shape];
  return {
    width,
    height,
    shape,
    pad,
    short,
    headline,
    body: Math.round(headline * 0.34),
    eyebrow: Math.round(headline * 0.27),
  };
}
