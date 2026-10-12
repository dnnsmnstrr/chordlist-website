import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {PrintScene, printPhase, printTimeline} from './chordlink/PrintScene';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, progressAt} from './primitives';
import {Headline, SocialFrame} from './scaffold';
import {mono, paletteFor, FPS, type MotionProps} from './theme';

const copy = motionCopy.chordlink;

export const chordlinkPrintSeconds = printTimeline(FPS).end / FPS;

/** A mono line under the print saying what the printer is doing: the layer, the pause, the swap. */
export function PrintStatus({size, color, muted, pace = 1}: {size: number; color: string; muted: string; pace?: number}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = printPhase(frame, fps, pace);
  const text =
    phase.kind === 'printing'
      ? copy.print.layer(phase.layer, phase.total)
      : phase.kind === 'pause'
        ? copy.print.pause
        : phase.kind === 'swap'
          ? copy.print.swap
          : copy.print.done;
  const highlighted = phase.kind !== 'printing';
  return (
    <div style={{fontFamily: mono, fontSize: size, color: highlighted ? color : muted, opacity: progressAt(frame, 10, 14)}}>
      {text}
    </div>
  );
}

/**
 * The chordlink, printed: floor, pocket, a pause while the NFC tag drops in, the lid that seals
 * it, a filament change, and the graphite logo. The geometry is the configurator's, in 3D.
 */
export function ChordlinkPrint({campaign}: MotionProps) {
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {content, shape, width, height} = layout;
  const isWide = shape === 'wide';

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <PrintScene palette={palette} width={width} height={height} />
      </AbsoluteFill>
      <AbsoluteFill>
        <Headline
          layout={layout}
          palette={palette}
          lines={copy.print.headline}
          maxWidth={isWide ? content.width * 0.4 : content.width}
          style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top}}
        />
        <div style={{position: 'absolute', left: content.left, bottom: layout.pad + layout.safeBottom + layout.footnote * 2.4}}>
          <PrintStatus size={Math.round(layout.footnote * 1.15)} color={palette.text} muted={palette.muted} />
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
