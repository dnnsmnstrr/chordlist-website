import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {phoneBeside, useLayout} from './layout';
import {Backdrop, Phone, SCREEN_ASPECT, media} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {chaptersFor} from './recording';
import {mono, paletteFor, seconds, type MotionProps, type Palette} from './theme';

const copy = motionCopy.handsFree;

/** A running clock beside a touch count that never moves: the point of the shot, as numbers. */
function TouchCounter({palette, size, start}: {palette: Palette; size: number; start: number}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const elapsed = Math.max(0, frame - start) / fps;
  const clock = `00:${String(Math.floor(elapsed)).padStart(2, '0')}`;
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: size * 0.8, fontFamily: mono, fontSize: size, color: palette.text}}>
      <span style={{fontVariantNumeric: 'tabular-nums'}}>{clock}</span>
      <span style={{color: palette.muted}}>
        <span style={{color: palette.text}}>0</span> {copy.touches}
      </span>
    </div>
  );
}

/** The longest shot of the press demo, the chart travelling on its own, set like a screenshot still. */
export function HandsFree({campaign, appearance}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {phone, copy: column} = phoneBeside(layout, SCREEN_ASPECT);
  const headSize = fitHeadline(layout, copy.headline, column.width);
  const counterSize = Math.round(layout.footnote * 1.3);

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Arrive start={4} distance={layout.height * 0.06} style={{position: 'absolute', left: phone.left, top: phone.top}}>
          <Phone
            palette={palette}
            height={phone.height}
            video={media.recording(appearance)}
            trimBefore={seconds(chaptersFor(appearance).handsFree.start)}
          />
        </Arrive>
        <div style={{position: 'absolute', left: column.left, top: column.top, width: column.width}}>
          <Headline layout={layout} palette={palette} lines={copy.headline} maxWidth={column.width} />
          <Arrive start={24} distance={12} style={{marginTop: headSize * 0.5}}>
            <TouchCounter palette={palette} size={counterSize} start={24} />
          </Arrive>
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
