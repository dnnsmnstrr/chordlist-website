import type {ReactNode} from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PrintStatus} from '../ChordlinkPrint';
import {PrintScene, printTimeline} from '../chordlink/PrintScene';
import {TapLayout, tapTimeline} from '../ChordlinkTap';
import {SpinScene} from '../chordlink/SpinScene';
import {EndCardScene} from '../EndCard';
import {headlineHeight, phoneBeside, useLayout, type Layout} from '../layout';
import {Backdrop, Phone, SCREEN_ASPECT, progressAt} from '../primitives';
import {Arrive, Headline, SocialFrame, fitHeadline} from '../scaffold';
import {morningLightFile} from '../song';
import {FPS, mono, paletteFor, sans, seconds, type Palette} from '../theme';
import {mediaSrc, resolveMedia, type ResolvedMedia} from './media';
import {totalSeconds, type CustomProps, type MotionDefinition} from './schema';

type TemplateProps = {definition: MotionDefinition; layout: Layout; palette: Palette; media: ResolvedMedia};

const lines = (definition: MotionDefinition) => definition.headline.filter((line) => line.trim() !== '');

function Subline({definition, size, start}: {definition: MotionDefinition; size: number; start: number}) {
  if (!definition.subline) return null;
  return (
    <Arrive start={start} distance={12} style={{marginTop: size * 0.45, fontFamily: sans, fontSize: Math.round(size * 0.42), lineHeight: 1.3}}>
      <span style={{opacity: 0.68}}>{definition.subline}</span>
    </Arrive>
  );
}

/** `statement`: one claim, set large in the centre band. */
function Statement({definition, layout, palette}: TemplateProps) {
  const {content, shape} = layout;
  const width = shape === 'wide' ? content.width * 0.72 : content.width;
  const size = fitHeadline(layout, lines(definition), width, 1.1);
  const height = headlineHeight(layout, lines(definition).length, size / layout.headline);
  return (
    <div style={{position: 'absolute', left: content.left, top: content.top + Math.max(0, (content.height - height) / 2 - size), width, color: palette.text}}>
      <Headline layout={layout} palette={palette} lines={lines(definition)} maxWidth={width} scale={1.1} />
      <Subline definition={definition} size={size} start={20} />
    </div>
  );
}

/** The media in a phone bezel, held on its last allowed frame rather than running on. */
function PhoneMedia({media, palette, height}: {media: ResolvedMedia; palette: Palette; height: number}) {
  const frame = useCurrentFrame();
  if (media.type === 'none') return null;
  if (media.type === 'image') return <Phone palette={palette} height={height} image={media.path} />;
  const limit = media.seconds === null ? Infinity : seconds(media.seconds) - 1;
  return (
    <Freeze frame={limit} active={frame >= limit}>
      <Phone palette={palette} height={height} video={media.path} trimBefore={seconds(media.trimBefore)} />
    </Freeze>
  );
}

/** `screen`: the `screenshot` still — copy beside a phone that runs off the edge. */
function Screen(props: TemplateProps) {
  const {definition, layout, palette, media} = props;
  if (media.type === 'none') return <Statement {...props} />;
  const {phone, copy} = phoneBeside(layout, SCREEN_ASPECT);
  const size = fitHeadline(layout, lines(definition), copy.width);
  return (
    <>
      <Arrive start={4} distance={layout.height * 0.06} style={{position: 'absolute', left: phone.left, top: phone.top}}>
        <PhoneMedia media={media} palette={palette} height={phone.height} />
      </Arrive>
      <div style={{position: 'absolute', left: copy.left, top: copy.top, width: copy.width, color: palette.text}}>
        <Headline layout={layout} palette={palette} lines={lines(definition)} maxWidth={copy.width} />
        <Subline definition={definition} size={size} start={22} />
      </div>
    </>
  );
}

/** `progression`: a chord row over its Roman numerals, the headline a full step below. */
function Progression({definition, layout, palette}: TemplateProps) {
  const frame = useCurrentFrame();
  const {content, scale} = layout;
  const chords = definition.chords.length > 0 ? definition.chords : ['G', 'D', 'Em', 'C'];
  const gap = Math.round(44 * scale);
  // Geist Mono advances exactly 0.6em, so the largest size that fits is solvable.
  const characters = chords.reduce((total, chord) => total + chord.length, 0);
  const size = Math.round(Math.min(104 * scale * 1.3, (content.width * 0.9 - gap * (chords.length - 1)) / (characters * 0.6)));
  const headSize = fitHeadline(layout, lines(definition), content.width);
  const blockHeight = size * 1.1 + size * 0.5 + headlineHeight(layout, lines(definition).length, headSize / layout.headline) + size * 0.6;
  const numeralsIn = progressAt(frame, 14 + chords.length * 5, 18);
  return (
    <div style={{position: 'absolute', left: content.left, top: content.top + Math.max(0, (content.height - blockHeight) / 2), width: content.width}}>
      <div style={{display: 'flex', gap, fontFamily: mono, fontSize: size, lineHeight: 1.1, color: palette.text}}>
        {chords.map((chord, index) => {
          const enter = progressAt(frame, 6 + index * 5, 18);
          return (
            <span key={index} style={{display: 'inline-block', opacity: enter, transform: `translateY(${(1 - enter) * size * 0.4}px)`}}>
              {chord}
            </span>
          );
        })}
      </div>
      {definition.numerals ? (
        <div style={{marginTop: size * 0.2, fontFamily: mono, fontSize: Math.round(size * 0.3), color: palette.muted, opacity: numeralsIn}}>
          {definition.numerals}
        </div>
      ) : null}
      <Headline
        layout={layout}
        palette={palette}
        lines={lines(definition)}
        maxWidth={content.width}
        start={24 + chords.length * 5}
        style={{marginTop: size * 0.6}}
      />
    </div>
  );
}

/** `file`: a song as it sits on disk, typed out with its spacing kept. */
function File({definition, layout, palette}: TemplateProps) {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {content, shape} = layout;
  const isWide = shape === 'wide';
  const body = definition.fileLines.length > 0 ? definition.fileLines : morningLightFile.slice(0, 20);
  const headline = lines(definition);
  const copyWidth = isWide ? content.width * 0.38 : content.width;
  const headSize = fitHeadline(layout, headline, copyWidth);
  const fileWidth = isWide ? content.width * 0.56 : content.width;
  const longest = Math.max(24, ...body.map((row) => row.length));
  const fileTop = isWide ? content.top : content.top + headlineHeight(layout, headline.length, headSize / layout.headline) + 48 * layout.scale;
  // Fitted by width (Geist Mono advances 0.6em) and by height (each row is 1.45em, plus about
  // 2.6em for the filename and its rule), so a long excerpt shrinks instead of reaching the footnote.
  const rows = body.length * 1.45 + (definition.filename ? 2.6 : 0);
  const font = Math.round(Math.min(38 * layout.scale, fileWidth / (longest * 0.6), (content.bottom - fileTop) / rows));
  // Typed over the first half of the piece, whatever its length, so the rest of it reads at rest.
  const typed = interpolate(frame, [16, Math.max(40, durationInFrames * 0.5)], [0, body.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const frontmatterEnd = body[0] === '---' ? body.indexOf('---', 1) : -1;
  return (
    <>
      <Headline
        layout={layout}
        palette={palette}
        lines={headline}
        maxWidth={copyWidth}
        style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top}}
      />
      <Arrive start={10} style={{position: 'absolute', left: isWide ? content.right - fileWidth : content.left, top: fileTop}}>
        <div style={{fontFamily: mono, fontSize: font, lineHeight: 1.45, whiteSpace: 'pre', color: palette.text}}>
          {definition.filename ? (
            <div style={{color: palette.muted, paddingBottom: font * 0.6, marginBottom: font * 0.8, borderBottom: `1px solid ${palette.rule}`}}>
              {definition.filename}
            </div>
          ) : null}
          {body.map((row, index) => {
            const shown = index < Math.floor(typed) ? row : index === Math.floor(typed) ? row.slice(0, Math.ceil(row.length * (typed % 1))) : '';
            return (
              <div key={index} style={{height: font * 1.45, color: index <= frontmatterEnd ? palette.muted : palette.text}}>
                {shown}
              </div>
            );
          })}
        </div>
      </Arrive>
    </>
  );
}

// The social build's photo scrim (CONFIG.colors.scrim), which buys back contrast over blown highlights.
const SCRIM =
  'linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.55) 38%, rgba(10,10,10,0.62) 62%, rgba(10,10,10,0.92) 100%)';

/** `photo`: a photography master full bleed, drifting slowly, with the type set over a scrim. */
function Photo(props: TemplateProps) {
  const {media} = props;
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (media.type === 'none') return <Statement {...props} />;
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  return (
    <>
      <AbsoluteFill style={{transform: `scale(${drift})`}}>
        {media.type === 'image' ? (
          <Img src={mediaSrc(media.path)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <OffthreadVideo
            src={mediaSrc(media.path)}
            muted
            trimBefore={seconds(media.trimBefore)}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: SCRIM}} />
      <Statement {...props} />
    </>
  );
}

/** `chordlink-print`: the tag printed in 3D, its pace stretched to the definition's length. */
function ChordlinkPrintTemplate({definition, layout, palette}: TemplateProps) {
  const {content, shape, width, height} = layout;
  const isWide = shape === 'wide';
  const pace = (definition.duration * FPS) / printTimeline(FPS).end;
  return (
    <>
      <AbsoluteFill>
        <PrintScene palette={palette} width={width} height={height} pace={pace} />
      </AbsoluteFill>
      <Headline
        layout={layout}
        palette={palette}
        lines={lines(definition)}
        maxWidth={isWide ? content.width * 0.4 : content.width}
        style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top}}
      />
      <div style={{position: 'absolute', left: content.left, bottom: layout.pad + layout.safeBottom + layout.footnote * 2.4}}>
        <PrintStatus size={Math.round(layout.footnote * 1.15)} color={palette.text} muted={palette.muted} pace={pace} />
      </div>
    </>
  );
}

/** `chordlink-model`: the site's 3D model of the tag turning once beside the copy. */
function ChordlinkModelTemplate({definition, layout, palette}: TemplateProps) {
  const {content, shape, width, height} = layout;
  const isWide = shape === 'wide';
  const copyWidth = isWide ? content.width * 0.42 : content.width;
  const size = fitHeadline(layout, lines(definition), copyWidth);
  return (
    <>
      <AbsoluteFill>
        <SpinScene width={width} height={height} offsetX={isWide ? 16 : 0} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: content.left, top: isWide ? content.top + content.height * 0.3 : content.top, width: copyWidth, color: palette.text}}>
        <Headline layout={layout} palette={palette} lines={lines(definition)} maxWidth={copyWidth} />
        <Subline definition={definition} size={size} start={20} />
      </div>
    </>
  );
}

/** `chordlink-tap`: a locked phone, the tag, and the app opening onto a song, paced to the duration. */
function ChordlinkTapTemplate({definition, layout, palette}: TemplateProps) {
  const pace = (definition.duration * FPS) / tapTimeline(FPS).end;
  return <TapLayout layout={layout} palette={palette} appearance={definition.appearance} lines={lines(definition)} pace={pace} />;
}

const templates: Record<MotionDefinition['template'], (props: TemplateProps) => ReactNode> = {
  statement: Statement,
  screen: Screen,
  progression: Progression,
  file: File,
  photo: Photo,
  'chordlink-print': ChordlinkPrintTemplate,
  'chordlink-model': ChordlinkModelTemplate,
  'chordlink-tap': ChordlinkTapTemplate,
};

/**
 * One composition for every definition in content/motion: the template it names, inside the social
 * frame, optionally followed by the promo's end card. Registered once per format as
 * Motion-Custom-<format>, its length set from the definition.
 */
export function CustomVideo({slug, definition}: CustomProps) {
  const layout = useLayout();
  // Photography keeps ink for white type over the scrim, as the photo stills do.
  const palette = paletteFor(definition.template === 'photo' ? 'ink' : definition.campaign);
  const media = resolveMedia(slug, definition);
  const Template = templates[definition.template];
  const main = seconds(definition.duration);

  return (
    <Backdrop palette={palette} campaign={definition.template === 'photo' ? 'ink' : definition.campaign}>
      <Sequence durationInFrames={main} layout="none">
        <AbsoluteFill>
          <Template definition={definition} layout={layout} palette={palette} media={media} />
          <SocialFrame
            layout={layout}
            palette={palette}
            eyebrow={definition.eyebrow || undefined}
            footnote={definition.footnote || undefined}
            exitAt={definition.endCard ? main - 12 : undefined}
          />
        </AbsoluteFill>
      </Sequence>
      {definition.endCard ? (
        <Sequence from={main} layout="none">
          <EndCardScene campaign={definition.campaign} />
        </Sequence>
      ) : null}
    </Backdrop>
  );
}

export const customDuration = (definition: MotionDefinition) => seconds(totalSeconds(definition));
