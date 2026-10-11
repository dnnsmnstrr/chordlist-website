import mark from '../../../design/mark.json';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {mediaSrc} from './custom/media';
import {motionCopy} from './copy';
import {useLayout, type Box, type Layout} from './layout';
import {Backdrop, LogoTile, Phone, SCREEN_ASPECT, media, progressAt} from './primitives';
import {Headline, SocialFrame, fitHeadline} from './scaffold';
import {easeInOut, mono, paletteFor, sans, type MotionProps, type Palette} from './theme';

const copy = motionCopy.chordlink;

// The tag as the camera sees it from above: bone plastic, the logo's keys in graphite, the same
// colours as public/model.html and the print piece.
const BONE = '#f7f7f8';
const GRAPHITE = '#1c1c1e';
const [, , viewWidth = 270, viewHeight = 613] = mark.viewBox.split(' ').map(Number);

/** The beats of the tap, in frames at pace 1. `pace` stretches them for a longer custom video. */
export function tapTimeline(fps: number, pace = 1) {
  const at = (value: number) => Math.round(value * fps * pace);
  return {
    tagIn: at(1.0),
    touch: at(1.9),
    unlock: at(2.9),
    launch: at(3.6),
    tagOut: at(4.2),
    end: at(9),
  };
}

function tapStep(frame: number, fps: number, pace = 1) {
  const t = tapTimeline(fps, pace);
  if (frame < t.touch) return 'locked' as const;
  if (frame < t.unlock) return 'tap' as const;
  if (frame < t.launch + 6) return 'unlock' as const;
  return 'open' as const;
}

export function TapStatus({size, color, muted, pace = 1}: {size: number; color: string; muted: string; pace?: number}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const step = tapStep(frame, fps, pace);
  return (
    <div style={{fontFamily: mono, fontSize: size, color: step === 'locked' ? muted : color, opacity: progressAt(frame, 10, 14)}}>
      {copy.tap.steps[step]}
    </div>
  );
}

/** The chordlink from above: a squircle of bone plastic with the logo's keys and strings. */
function Tag({size}: {size: number}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        backgroundColor: BONE,
        color: GRAPHITE,
        // The plate's edge, then its shadow on the surface it rests on.
        boxShadow: `0 ${size * 0.035}px 0 #d9d9dc, 0 ${size * 0.08}px ${size * 0.16}px rgba(0,0,0,0.35)`,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg viewBox={mark.viewBox} fill="currentColor" style={{height: '100%', width: (size * viewWidth) / viewHeight}}>
        {mark.shapes.map((shape, index) =>
          shape.tag === 'path' ? (
            <path key={index} d={shape.d} />
          ) : (
            <rect key={index} x={shape.x} y={Number(shape.y)} width={shape.width} height={Number(shape.height)} />
          ),
        )}
      </svg>
    </div>
  );
}

function Padlock({size, open}: {size: number; open: number}) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" fill="none">
      <path
        d="M10 22 V14 a10 10 0 0 1 20 0 V22"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        transform={`translate(${open * 10} ${-open * 5})`}
      />
      <rect x={4} y={21} width={32} height={26} rx={6} fill="#ffffff" />
    </svg>
  );
}

/** A plain lock screen: the time, a padlock, a dark wallpaper. Deliberately not a copy of iOS. */
function LockScreen({width, frame, unlockAt}: {width: number; frame: number; unlockAt: number}) {
  const open = progressAt(frame, unlockAt, 10);
  const away = progressAt(frame, unlockAt + 8, 16, easeInOut);
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(170deg, #2a2f3a 0%, #14161c 55%, #0b0c10 100%)',
        alignItems: 'center',
        opacity: 1 - away,
        transform: `translateY(${-away * width * 0.5}px)`,
      }}
    >
      <div style={{marginTop: width * 0.13}}>
        <Padlock size={width * 0.07} open={open} />
      </div>
      <div
        style={{
          marginTop: width * 0.02,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: width * 0.25,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        {copy.tap.time}
      </div>
      {/* The home indicator, rising as the screen unlocks. */}
      <div
        style={{
          position: 'absolute',
          bottom: width * 0.03,
          width: width * 0.35,
          height: width * 0.013,
          borderRadius: width,
          backgroundColor: 'rgba(255,255,255,0.8)',
        }}
      />
    </AbsoluteFill>
  );
}

type TapSceneProps = {palette: Palette; appearance: 'light' | 'dark'; box: Box; pace?: number};

/**
 * A locked phone, the chordlink touched to its top edge, the NFC ripple, the unlock, and the app
 * opening straight onto Morning Light — the real song screen, untouched.
 */
export function TapScene({palette, appearance, box, pace = 1}: TapSceneProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = tapTimeline(fps, pace);

  // The tag peeks out from behind the phone's top edge: with the sizes below it stands about 0.12
  // of the phone's height above it, and a fifth of its width to the right.
  const tagShare = 0.34;
  const fitByHeight = box.height / 1.13;
  const fitByWidth = box.width / (SCREEN_ASPECT * 1.3);
  const phoneHeight = Math.min(fitByHeight, fitByWidth, 1400);
  const phoneWidth = phoneHeight * SCREEN_ASPECT;
  const tagSize = phoneWidth * tagShare * 1.4;
  // The tag stays inside the phone's width, so the phone itself is centred in the box.
  const phoneLeft = box.left + (box.width - phoneWidth) / 2;
  const phoneTop = box.top + box.height - phoneHeight;
  const screenWidth = phoneWidth * 0.976;

  const phoneIn = spring({frame: frame - 4, fps, config: {damping: 18, stiffness: 90}});
  const tagIn = spring({frame: frame - t.tagIn, fps, config: {damping: 15, stiffness: 80}});
  const tagOut = progressAt(frame, t.tagOut, 20, easeInOut);
  // The tag rests against the top of the phone, where an iPhone reads NFC.
  const contact = {x: phoneLeft + phoneWidth * 0.62, y: phoneTop + phoneHeight * 0.015};
  // It slides in and out from the side, level with the phone's top, clear of the headline.
  const tagX = contact.x - tagSize * 0.3 + (1 - tagIn) * tagSize * 2.4 + tagOut * tagSize * 2.4;
  const tagY = contact.y - tagSize * 0.62;
  const tagTurn = interpolate(tagIn, [0, 1], [18, -8]) + tagOut * 18;

  // A small haptic buzz on the read.
  const buzz = frame >= t.touch && frame < t.touch + 8 ? Math.sin((frame - t.touch) * 2.6) * phoneWidth * 0.006 : 0;

  // The app opens from the middle of the screen, the logo first, then the song.
  const launch = progressAt(frame, t.launch, 16);
  const logoFade = interpolate(frame, [t.launch + 6, t.launch + 18], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: tagX, top: tagY, transform: `rotate(${tagTurn}deg)`, opacity: 1 - tagOut}}>
        <Tag size={tagSize} />
      </div>
      <Phone
        palette={palette}
        height={phoneHeight}
        style={{
          position: 'absolute',
          left: phoneLeft + buzz,
          top: phoneTop + (1 - phoneIn) * phoneHeight * 0.3,
          opacity: phoneIn,
        }}
      >
        {launch > 0 ? (
          <AbsoluteFill
            style={{
              transform: `scale(${interpolate(launch, [0, 1], [0.25, 1])})`,
              borderRadius: screenWidth * (0.22 - launch * 0.08),
              overflow: 'hidden',
              opacity: Math.min(1, launch * 3),
            }}
          >
            <Img src={mediaSrc(media.screen(appearance, '02-Song-Detail'))} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', backgroundColor: appearance === 'dark' ? '#000' : '#fff', opacity: logoFade}}>
              <LogoTile size={screenWidth * 0.26} />
            </AbsoluteFill>
          </AbsoluteFill>
        ) : null}
        {frame < t.launch + 24 ? <LockScreen width={screenWidth} frame={frame} unlockAt={t.unlock} /> : null}
      </Phone>
      {/* The read: rings spreading from where the tag meets the phone. */}
      {[0, 1, 2].map((ring) => {
        const p = progressAt(frame, t.touch + ring * 7, 26);
        if (p <= 0 || p >= 1) return null;
        const r = tagSize * (0.3 + p * 1.1);
        return (
          <div
            key={ring}
            style={{
              position: 'absolute',
              left: contact.x - r,
              top: contact.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `${Math.max(2, tagSize * 0.02)}px solid ${palette.text}`,
              opacity: (1 - p) * 0.8,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

type TapLayoutProps = {
  layout: Layout;
  palette: Palette;
  appearance: 'light' | 'dark';
  lines: readonly string[];
  pace?: number;
  /** Whether the frame shows a footnote; without one the portrait phone grows into its place. */
  footnote?: boolean;
};

/** The tap with its headline and status: the piece's layout, shared with the wizard's template. */
export function TapLayout({layout, palette, appearance, lines, pace = 1, footnote = true}: TapLayoutProps) {
  const {content, shape} = layout;
  const isWide = shape === 'wide';
  const statusSize = Math.round(layout.footnote * 1.15);

  if (isWide) {
    const copyWidth = content.width * 0.42;
    return (
      <>
        <TapScene
          pace={pace}
          palette={palette}
          appearance={appearance}
          box={{
            left: content.left + copyWidth,
            right: content.right,
            width: content.width - copyWidth,
            top: layout.pad * 0.6,
            bottom: layout.height - layout.pad * 0.6,
            height: layout.height - layout.pad * 1.2,
          }}
        />
        <div style={{position: 'absolute', left: content.left, top: content.top + content.height * 0.3, width: copyWidth}}>
          <Headline layout={layout} palette={palette} lines={lines} maxWidth={copyWidth} />
          <div style={{marginTop: layout.headline * 0.6}}>
            <TapStatus size={statusSize} color={palette.text} muted={palette.muted} pace={pace} />
          </div>
        </div>
      </>
    );
  }

  // The status sits under the headline, so the phone can take everything down to the footnote.
  const size = fitHeadline(layout, lines, content.width);
  const statusTop = content.top + size * 1.14 * lines.length + size * 0.35;
  const sceneTop = statusTop + statusSize * 1.3 + size * 0.5;
  const sceneBottom = footnote ? content.bottom : layout.height - layout.pad - layout.safeBottom;
  return (
    <>
      <TapScene
        pace={pace}
        palette={palette}
        appearance={appearance}
        box={{top: sceneTop, bottom: sceneBottom, left: content.left, right: content.right, width: content.width, height: sceneBottom - sceneTop}}
      />
      <Headline layout={layout} palette={palette} lines={lines} maxWidth={content.width} style={{position: 'absolute', left: content.left, top: content.top}} />
      <div style={{position: 'absolute', left: content.left, top: statusTop}}>
        <TapStatus size={statusSize} color={palette.text} muted={palette.muted} pace={pace} />
      </div>
    </>
  );
}

/** Tap the chordlink against a locked phone and land in a song. */
export function ChordlinkTap({campaign, appearance}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const isStory = layout.shape === 'story';
  return (
    <Backdrop palette={palette} campaign={campaign}>
      {/* The reel drops the address so the phone can be as large as the frame allows. */}
      <TapLayout layout={layout} palette={palette} appearance={appearance} lines={copy.tap.headline} footnote={!isStory} />
      <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={isStory ? undefined : copy.footnote} />
    </Backdrop>
  );
}
