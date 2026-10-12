import {useVideoConfig} from 'remotion';
import {formats, socialType, type FormatName} from './theme';

export type Box = {top: number; bottom: number; left: number; right: number; width: number; height: number};

export type Layout = {
  width: number;
  height: number;
  shape: FormatName;
  scale: number;
  pad: number;
  safeTop: number;
  safeBottom: number;
  headline: number;
  footnote: number;
  wordmark: number;
  mark: number;
  /** The area between the lockup and the footnote, where each piece sets its subject. */
  content: Box;
};

const box = (top: number, bottom: number, left: number, right: number): Box => ({
  top,
  bottom,
  left,
  right,
  width: right - left,
  height: bottom - top,
});

/** The social frame's metrics for the current composition, matched to its nearest named format. */
export function useLayout(): Layout {
  const {width, height} = useVideoConfig();
  const shape = (Object.keys(formats) as FormatName[]).reduce((best, name) =>
    Math.abs(formats[name].width / formats[name].height - width / height) <
    Math.abs(formats[best].width / formats[best].height - width / height)
      ? name
      : best,
  );
  const {scale, safeTop, safeBottom} = formats[shape];
  const pad = socialType.padding;
  const mark = Math.round(socialType.lockupMark * scale);
  const footnote = Math.round(socialType.footnote * scale);
  const gap = Math.round(48 * scale);
  return {
    width,
    height,
    shape,
    scale,
    pad,
    safeTop,
    safeBottom,
    headline: Math.round(socialType.headline * scale),
    footnote,
    wordmark: Math.round(socialType.wordmark * scale),
    mark,
    content: box(pad + safeTop + mark + gap, height - pad - safeBottom - footnote * 1.4 - gap, pad, width - pad),
  };
}

/** Height of a headline block of `lines` lines at the social line height. */
export const headlineHeight = (layout: Layout, lines: number, scale = 1) => lines * layout.headline * scale * 1.14;

/**
 * The `screenshot` still's composition: copy on the left, the phone large on the right and
 * running off the edge in the portrait formats, whole and inside the frame on the wide one.
 */
export function phoneBeside(layout: Layout, aspect: number) {
  const {shape, content, width, height, pad} = layout;
  if (shape === 'wide') {
    const phoneHeight = height - pad * 1.2;
    return {
      phone: {left: content.right - phoneHeight * aspect - 120, top: (height - phoneHeight) / 2, height: phoneHeight},
      copy: {left: content.left, top: content.top + content.height * 0.3, width: content.width * 0.42},
    };
  }
  // Sized so the story footnote, the longest of which runs about 500px, stays clear of the screen.
  const phoneHeight = {story: 1220, post: 1160, square: 980}[shape];
  const phoneWidth = phoneHeight * aspect;
  const left = width - phoneWidth * 0.86;
  const top = shape === 'story' ? content.top + content.height * 0.3 : content.top - 20;
  return {
    phone: {left, top, height: phoneHeight},
    copy: shape === 'story'
      ? {left: content.left, top: content.top, width: content.width}
      : {left: content.left, top: content.top + content.height * 0.3, width: left - content.left - 48},
  };
}
