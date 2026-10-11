import {staticFile} from 'remotion';
import {chaptersFor, colorScrollDuration} from '../recording';
import type {MotionDefinition} from './schema';

declare global {
  interface Window {
    /** Set by the /motion wizard so the Player loads media through its local media route. */
    chordlistMotionMediaBase?: string;
  }
}

/**
 * A file in Remotion's public directory (video/public), as a URL. A render and Studio serve that
 * directory themselves; the wizard's in-page Player runs inside the Next app, which does not, so
 * there the same path goes through the wizard's media route instead.
 */
export function mediaSrc(path: string) {
  if (typeof window !== 'undefined' && window.chordlistMotionMediaBase) {
    return `${window.chordlistMotionMediaBase}${path}`;
  }
  return staticFile(path);
}

export type ResolvedMedia =
  | {type: 'none'}
  | {type: 'image'; path: string; frame: 'phone' | 'full'}
  | {type: 'video'; path: string; frame: 'phone' | 'full'; trimBefore: number; seconds: number | null};

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)$/i;

/** Where a definition's media lives under video/public, and how much of it may be played. */
export function resolveMedia(slug: string, definition: MotionDefinition): ResolvedMedia {
  const {media, appearance} = definition;
  switch (media.kind) {
    case 'none':
      return {type: 'none'};
    case 'screenshot':
      return {type: 'image', path: `generated/motion/screens/${appearance}/${media.name}.png`, frame: 'phone'};
    case 'recording': {
      const chapter = chaptersFor(appearance)[media.chapter];
      const start = Math.min(chapter.start + media.offset, chapter.end - 0.5);
      return {
        type: 'video',
        path: `generated/motion/press/chordlist-demo-${appearance}.mp4`,
        frame: 'phone',
        trimBefore: start,
        // Held on the chapter's last frame rather than running into the next shot.
        seconds: chapter.end - start,
      };
    }
    case 'colorScroll':
      return {type: 'video', path: 'generated/motion/press/smooth-color-scroll-light-only.mp4', frame: 'phone', trimBefore: 0, seconds: colorScrollDuration};
    case 'upload': {
      const path = `generated/motion/uploads/${slug}/${media.file}`;
      const frame = definition.template === 'photo' ? 'full' : 'phone';
      return VIDEO_EXTENSIONS.test(media.file)
        ? {type: 'video', path, frame, trimBefore: 0, seconds: null}
        : {type: 'image', path, frame};
    }
    case 'photo':
      return {type: 'image', path: `generated/motion/photos/${media.file}`, frame: 'full'};
  }
}
