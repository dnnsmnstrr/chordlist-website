import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionCopy} from './copy';
import {headlineHeight, useLayout} from './layout';
import {Backdrop, Phone, SCREEN_ASPECT, media} from './primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from './scaffold';
import {morningLightFile} from './song';
import {mono, paletteFor, type MotionProps, type Palette} from './theme';

const copy = motionCopy.plainText;
// Frontmatter through the first verse: the excerpt the `file` still would hold, and short enough
// to read at story size.
const excerpt = morningLightFile.slice(0, morningLightFile.indexOf('[Chorus] C G D Em') - 1);
const frontmatterEnd = excerpt.indexOf('---', 1);

/** The `file` template in motion: filename over a hairline, frontmatter muted, spacing kept. */
function FileExcerpt({palette, fontSize, typedLines}: {palette: Palette; fontSize: number; typedLines: number}) {
  const frame = useCurrentFrame();
  const whole = Math.floor(typedLines);
  const partial = typedLines - whole;
  const caretOn = Math.floor(frame / 9) % 2 === 0;
  return (
    <div style={{fontFamily: mono, fontSize, lineHeight: 1.45, whiteSpace: 'pre', color: palette.text}}>
      <div style={{color: palette.muted, paddingBottom: fontSize * 0.6, marginBottom: fontSize * 0.8, borderBottom: `1px solid ${palette.rule}`}}>
        {copy.filename}
      </div>
      {excerpt.map((line, index) => {
        if (index > whole) return null;
        const shown = index === whole ? line.slice(0, Math.ceil(line.length * partial)) : line;
        return (
          <div key={index} style={{height: fontSize * 1.45, color: index <= frontmatterEnd ? palette.muted : palette.text}}>
            {shown}
            {index === whole ? (
              <span
                style={{
                  display: 'inline-block',
                  width: fontSize * 0.55,
                  height: fontSize * 1.1,
                  verticalAlign: 'middle',
                  backgroundColor: palette.text,
                  opacity: caretOn ? 0.7 : 0,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The file and the screen are the same song. The Markdown types itself out, then the app's render
 * of it slides in from the edge, bleeding off the frame the way a screenshot does in the stills.
 */
export function PlainText({campaign, appearance}: MotionProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const layout = useLayout();
  const palette = paletteFor(campaign);
  const {shape, content, width, height} = layout;
  const isWide = shape === 'wide';

  const typedLines = interpolate(frame, [20, 140], [0, excerpt.length - 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneIn = spring({frame: frame - 130, fps, config: {damping: 20, stiffness: 90}});

  const headlineWidth = isWide ? content.width * 0.36 : content.width;
  const headSize = fitHeadline(layout, copy.headline, headlineWidth);
  const fileTop = isWide ? content.top : content.top + headlineHeight(layout, copy.headline.length) * (headSize / layout.headline) + 56 * layout.scale;
  const fileLeft = isWide ? content.left + content.width * 0.4 : content.left;
  const fileFont = {story: 27, post: 23, square: 21, wide: 25}[shape];
  const phoneHeight = {story: 1180, post: 900, square: 760, wide: 1000}[shape];
  const phoneWidth = phoneHeight * SCREEN_ASPECT;
  // In the portrait formats the screen runs off the right edge, leaving the file's lines readable.
  const phoneLeft = isWide ? width - layout.pad - phoneWidth : width - phoneWidth * 0.6;
  const phoneTop = isWide ? (height - phoneHeight) / 2 : fileTop + (shape === 'story' ? 260 : 150);

  return (
    <Backdrop palette={palette} campaign={campaign}>
      <AbsoluteFill>
        <Headline
          layout={layout}
          palette={palette}
          lines={copy.headline}
          maxWidth={headlineWidth}
          style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top}}
        />
        <Arrive start={12} style={{position: 'absolute', left: fileLeft, top: fileTop}}>
          <FileExcerpt palette={palette} fontSize={fileFont} typedLines={typedLines} />
        </Arrive>
        <div
          style={{
            position: 'absolute',
            left: phoneLeft,
            top: phoneTop,
            transform: `translateX(${interpolate(phoneIn, [0, 1], [width * 0.7, 0])}px)`,
          }}
        >
          <Phone palette={palette} height={phoneHeight} image={media.screen(appearance, '02-Song-Detail')} />
        </div>
        <SocialFrame layout={layout} palette={palette} eyebrow={copy.eyebrow} footnote={copy.footnote} />
      </AbsoluteFill>
    </Backdrop>
  );
}
