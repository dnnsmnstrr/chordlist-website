import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Phone, SCREEN_ASPECT, media} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {sans, paletteFor, type MotionProps} from './theme';

const copy = motionCopy.launch;

// Three screens fanned side by side — flat, never tilted — rising one after another.
const fan = ['04-Search', '02-Song-Detail', '01-Song-List'];

/** The out-now still in motion: the release line, the free limit, and the app rising into frame. */
export function LaunchCard({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, content, width, height} = layout;
  const isWide = shape === 'wide';

  const copyWidth = isWide ? content.width * 0.42 : content.width;
  const headSize = fitHeadline(layout, copy.headline, copyWidth);
  // In the portrait formats the fan stands between the copy and the footnote, never under it.
  const portraitTop = content.top + copy.headline.length * headSize * 1.14 + headSize * 1.6;
  const phoneHeight = isWide ? 820 : content.bottom - portraitTop;
  const phoneWidth = phoneHeight * SCREEN_ASPECT;
  const fanCenter = isWide ? content.right - phoneWidth * 1.4 : width / 2;
  const fanTop = isWide ? (height - phoneHeight) / 2 : portraitTop;

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        {fan.map((name, index) => {
          const rise = spring({frame: frame - 18 - index * 6, fps, config: {damping: 18, stiffness: 90}});
          const isCenter = index === 1;
          return (
            <div
              key={name}
              style={{
                position: 'absolute',
                left: fanCenter + (index - 1) * phoneWidth * 0.82 - phoneWidth / 2,
                top: fanTop + (isCenter ? 0 : phoneHeight * 0.08),
                zIndex: isCenter ? 2 : 1,
                transform: `translateY(${interpolate(rise, [0, 1], [height * 0.6, 0])}px)`,
              }}
            >
              <Phone palette={palette} height={isCenter ? phoneHeight : phoneHeight * 0.9} image={media.screen(appearance, name)} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top, width: copyWidth}}>
          <Headline layout={layout} palette={palette} lines={copy.headline} maxWidth={copyWidth} />
          <Arrive start={30} distance={12} style={{marginTop: headSize * 0.4, fontFamily: sans, fontSize: Math.round(headSize * 0.42), color: palette.muted}}>
            {copy.freeLimit}
          </Arrive>
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
