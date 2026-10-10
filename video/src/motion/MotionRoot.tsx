import {Composition, Folder} from 'remotion';
import type {ComponentType} from 'react';
import {ChordKeys} from './ChordKeys';
import {EndCard} from './EndCard';
import {FeatureReel, featureReelSeconds} from './FeatureReel';
import {HandsFree} from './HandsFree';
import {LaunchCard} from './LaunchCard';
import {LogoSting} from './LogoSting';
import {Manifesto} from './Manifesto';
import {PlainText} from './PlainText';
import {SameChords} from './SameChords';
import {ScreenWall} from './ScreenWall';
import {ThemeSpectrum} from './ThemeSpectrum';
import {Transpose} from './Transpose';
import {FPS, formats, motionSchema, seconds, type FormatName, type MotionProps} from './theme';

type Piece = {
  id: string;
  component: ComponentType<MotionProps>;
  durationInSeconds: number;
  formats: FormatName[];
  defaults: MotionProps;
};

// The social matrix's portrait formats plus a 16:9 master. `square` is laid out too (it is the
// Mastodon/Bluesky/Threads size in docs/social-media-system.md) and can be added per piece.
const all: FormatName[] = ['story', 'post', 'wide'];
// Social stills default to ink with dark screenshots; warm-stage is the promo's campaign.
const ink: MotionProps = {campaign: 'ink', appearance: 'dark'};

// One entry per motion idea, registered once per format, so Studio lists Motion-Transpose-story
// beside Motion-Transpose-post.
export const motionPieces: Piece[] = [
  {id: 'LogoSting', component: LogoSting, durationInSeconds: 4.5, formats: all, defaults: ink},
  {id: 'PlainText', component: PlainText, durationInSeconds: 8, formats: all, defaults: {campaign: 'paper', appearance: 'light'}},
  {id: 'Transpose', component: Transpose, durationInSeconds: 9, formats: all, defaults: ink},
  {id: 'SameChords', component: SameChords, durationInSeconds: 8, formats: all, defaults: {campaign: 'blueprint', appearance: 'dark'}},
  {id: 'ChordKeys', component: ChordKeys, durationInSeconds: 8, formats: all, defaults: ink},
  {id: 'HandsFree', component: HandsFree, durationInSeconds: 8, formats: all, defaults: {campaign: 'warm-stage', appearance: 'light'}},
  {id: 'ThemeSpectrum', component: ThemeSpectrum, durationInSeconds: 8, formats: all, defaults: {campaign: 'ink', appearance: 'light'}},
  {id: 'FeatureReel', component: FeatureReel, durationInSeconds: featureReelSeconds, formats: ['wide', 'story'], defaults: ink},
  {id: 'ScreenWall', component: ScreenWall, durationInSeconds: 16, formats: all, defaults: ink},
  {id: 'Manifesto', component: Manifesto, durationInSeconds: 6, formats: all, defaults: ink},
  {id: 'LaunchCard', component: LaunchCard, durationInSeconds: 6, formats: all, defaults: ink},
  {id: 'EndCard', component: EndCard, durationInSeconds: 3, formats: all, defaults: {campaign: 'warm-stage', appearance: 'light'}},
];

export const MotionCompositions: React.FC = () => (
  <Folder name="Motion">
    {motionPieces.flatMap((piece) =>
      piece.formats.map((format) => (
        <Composition
          key={`${piece.id}-${format}`}
          id={`Motion-${piece.id}-${format}`}
          component={piece.component}
          durationInFrames={seconds(piece.durationInSeconds)}
          fps={FPS}
          width={formats[format].width}
          height={formats[format].height}
          schema={motionSchema}
          defaultProps={piece.defaults}
        />
      )),
    )}
  </Folder>
);
