import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {useLayout} from './layout';
import {Backdrop, Phone, media, progressAt} from './primitives';
import {Caption, CopyBlock, Footer} from './scaffold';
import {morningLightFile} from './song';
import {mono, paletteFor, type MotionProps, type Palette} from './theme';

const copy = motionCopy.plainText;

function FileCard({palette, width, height, fontSize, typedLines}: {
  palette: Palette;
  width: number;
  height: number;
  fontSize: number;
  typedLines: number;
}) {
  const frame = useCurrentFrame();
  const caretOn = Math.floor(frame / 9) % 2 === 0;
  const whole = Math.floor(typedLines);
  const partial = typedLines - whole;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        backgroundColor: palette.panel,
        border: `2px solid ${palette.bezelBorder}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: fontSize * 0.6,
          padding: `${fontSize * 0.75}px ${fontSize}px`,
          borderBottom: `2px solid ${palette.rule}`,
          fontFamily: mono,
          fontSize: fontSize * 0.95,
          color: palette.muted,
        }}
      >
        <span
          style={{
            width: fontSize * 0.75,
            height: fontSize * 0.95,
            border: `2px solid ${palette.muted}`,
            borderRadius: 3,
            boxSizing: 'border-box',
          }}
        />
        {copy.filename}
      </div>
      <div
        style={{
          padding: `${fontSize * 0.8}px ${fontSize}px`,
          fontFamily: mono,
          fontSize,
          lineHeight: 1.5,
          whiteSpace: 'pre',
          color: palette.text,
        }}
      >
        {morningLightFile.map((line, index) => {
          if (index > whole) return null;
          const shown = index === whole ? line.slice(0, Math.ceil(line.length * partial)) : line;
          const isFrontmatter = index < morningLightFile.indexOf('---', 1);
          const isSection = line.startsWith('[');
          const isChord = /^[A-G]/.test(line) && !/[a-z]{3}/.test(line);
          const key = isFrontmatter && line.includes(':') ? line.slice(0, line.indexOf(':') + 1) : '';
          return (
            <div key={index} style={{height: fontSize * 1.5}}>
              {key && shown.length >= key.length ? (
                <>
                  <span style={{color: palette.muted}}>{key}</span>
                  {shown.slice(key.length)}
                </>
              ) : (
                <span
                  style={{
                    color: line === '---' || isChord ? palette.muted : palette.text,
                    fontWeight: isSection ? 600 : 400,
                  }}
                >
                  {shown}
                </span>
              )}
              {index === whole ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: fontSize * 0.55,
                    height: fontSize * 1.1,
                    verticalAlign: 'middle',
                    backgroundColor: palette.text,
                    opacity: caretOn ? 0.8 : 0,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The file and the screen are the same song. The Markdown types itself out, then the app's own
 * render of it slides in alongside, so the claim "it's just a file" is shown rather than told.
 */
export function PlainText({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, pad, width} = layout;

  const typedLines = interpolate(frame, [16, 150], [0, morningLightFile.length - 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneIn = spring({frame: frame - 120, fps, config: {damping: 20, stiffness: 90}});

  const geometry = {
    story: {card: {x: pad, y: 440, w: 760, h: 1000, font: 24}, phone: {h: 1040, x: width - pad - 490, y: 600}},
    portrait: {card: {x: pad, y: 400, w: 640, h: 860, font: 20}, phone: {h: 820, x: width - pad - 380, y: 420}},
    square: {card: {x: pad, y: 335, w: 560, h: 530, font: 17}, phone: {h: 700, x: width - pad - 325, y: 270}},
    wide: {card: {x: 760, y: 120, w: 620, h: 840, font: 19}, phone: {h: 860, x: width - pad - 398, y: 110}},
  }[shape];
  const {card, phone} = geometry;

  return (
    <Backdrop palette={palette}>
      <AbsoluteFill>
        <div style={{position: 'absolute', left: pad, top: shape === 'wide' ? 200 : pad + 20}}>
          <CopyBlock layout={layout} palette={palette} eyebrow={copy.eyebrow} headline={copy.headline} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: card.x,
            top: card.y,
            opacity: progressAt(frame, 8, 16),
            transform: `translateY(${(1 - progressAt(frame, 8, 24)) * 40}px)`,
          }}
        >
          <FileCard palette={palette} width={card.w} height={card.h} fontSize={card.font} typedLines={typedLines} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: phone.x,
            top: phone.y,
            transform: `translateX(${interpolate(phoneIn, [0, 1], [width * 0.6, 0])}px)`,
          }}
        >
          <Phone palette={palette} height={phone.h} image={media.screen(appearance, '02-Song-Detail')} />
        </div>
        <Caption
          layout={layout}
          palette={palette}
          text={copy.caption}
          start={165}
          style={{
            position: 'absolute',
            left: pad,
            top: shape === 'wide' ? 200 + layout.headline * 3.3 : undefined,
            bottom: shape === 'wide' ? undefined : pad + layout.short * 0.04 + 36,
            maxWidth: shape === 'wide' ? 560 : card.w,
          }}
        />
        <Footer layout={layout} palette={palette} start={180} />
      </AbsoluteFill>
    </Backdrop>
  );
}
