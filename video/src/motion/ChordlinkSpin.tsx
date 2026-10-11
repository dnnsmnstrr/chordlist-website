import {AbsoluteFill} from 'remotion';
import {SpinScene} from './chordlink/SpinScene';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {sans, paletteFor, type MotionProps} from './theme';

const copy = motionCopy.chordlink;

/** The finished chordlink, the site's own 3D model, turning once beside what it does. */
export function ChordlinkSpin({campaign}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {content, shape, width, height} = layout;
  const isWide = shape === 'wide';
  const copyWidth = isWide ? content.width * 0.42 : content.width;
  const size = fitHeadline(layout, copy.spin.headline, copyWidth);

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        {/* On the wide frame the tag turns to the right of the copy; elsewhere below it. */}
        <SpinScene width={width} height={height} offsetX={isWide ? 16 : 0} />
      </AbsoluteFill>
      <AbsoluteFill>
        <div style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top, width: copyWidth}}>
          <Headline layout={layout} palette={palette} lines={copy.spin.headline} maxWidth={copyWidth} />
          <Arrive start={20} distance={12} style={{marginTop: size * 0.45, fontFamily: sans, fontSize: Math.round(size * 0.42), lineHeight: 1.3, color: palette.muted}}>
            {copy.spin.subline}
          </Arrive>
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
