import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {mediaSrc} from './custom/media';
import {AssemblingTile} from './mark';
import {Backdrop, progressAt} from './primitives';
import {mono, paletteFor, type MotionProps, type Palette} from './theme';

type LogoBlockProps = {
  palette: Palette;
  tile: number;
  start?: number;
  /** A line under the name, such as the site address. */
  link?: string;
  badge?: boolean;
};

const fadeUp = (enter: number, distance: number) => ({
  opacity: enter,
  transform: `translateY(${interpolate(enter, [0, 1], [distance, 0])}px)`,
});

/**
 * The logo assembling itself large and centred, the name fading in beneath it, and below that,
 * optionally, a link and Apple's App Store badge. The badge is the official artwork, unmodified:
 * white on the dark campaigns, black on paper, as the site hero picks it by colour scheme.
 */
export function LogoBlock({palette, tile, start = 0, link, badge}: LogoBlockProps) {
  const frame = useCurrentFrame() - start;
  const name = progressAt(frame, 34, 24);
  const below = progressAt(frame, 52, 24);
  const fontSize = Math.round(tile * 0.34);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <AssemblingTile size={tile} start={start} />
      <div style={{marginTop: tile * 0.26, fontFamily: mono, fontSize, letterSpacing: '-0.03em', color: palette.text, ...fadeUp(name, tile * 0.08)}}>
        chordlist
      </div>
      {link ? (
        <div style={{marginTop: tile * 0.14, fontFamily: mono, fontSize: Math.round(fontSize * 0.5), color: palette.muted, ...fadeUp(below, tile * 0.06)}}>
          {link}
        </div>
      ) : null}
      {badge ? (
        <Img
          src={mediaSrc(`badges/app-store-${palette.isDark ? 'white' : 'black'}.svg`)}
          style={{marginTop: tile * 0.3, height: tile * 0.3, width: 'auto', ...fadeUp(below, tile * 0.06)}}
        />
      ) : null}
    </div>
  );
}

function Reveal({campaign, badge}: MotionProps & {badge: boolean}) {
  const {width, height} = useVideoConfig();
  const palette = paletteFor(campaign);
  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <LogoBlock palette={palette} tile={Math.min(width, height) * 0.3} badge={badge} />
      </AbsoluteFill>
    </Backdrop>
  );
}

export function LogoReveal(props: MotionProps) {
  return <Reveal {...props} badge={false} />;
}

export function LogoRevealBadge(props: MotionProps) {
  return <Reveal {...props} badge />;
}
