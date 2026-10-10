import {Composition, Folder} from 'remotion';
import type {ComponentType} from 'react';
import {LogoSting} from './LogoSting';
import {PlainText} from './PlainText';
import {Transpose} from './Transpose';
import {SameChords} from './SameChords';
import {ChordKeys} from './ChordKeys';
import {HandsFree} from './HandsFree';
import {ThemeSpectrum} from './ThemeSpectrum';
import {FeatureReel, featureReelSeconds} from './FeatureReel';
import {ScreenWall} from './ScreenWall';
import {Manifesto} from './Manifesto';
import {LaunchCard} from './LaunchCard';
import {FPS, formats, motionSchema, seconds, type FormatName, type MotionProps} from './theme';

type Piece = {
  id: string;
  component: ComponentType<MotionProps>;
  durationInSeconds: number;
  formats: FormatName[];
  defaults: MotionProps;
};

// One entry per motion idea. Each is registered once per format it is designed for, so Studio
// lists e.g. Motion-LogoSting-square beside Motion-LogoSting-story.
export const motionPieces: Piece[] = [
  {
    id: 'LogoSting',
    component: LogoSting,
    durationInSeconds: 4.5,
    formats: ['square', 'story', 'wide'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
  {
    id: 'PlainText',
    component: PlainText,
    durationInSeconds: 8,
    formats: ['square', 'story', 'wide'],
    defaults: {campaign: 'paper', appearance: 'light'},
  },
  {
    id: 'Transpose',
    component: Transpose,
    durationInSeconds: 9,
    formats: ['square', 'story', 'wide'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
  {
    id: 'SameChords',
    component: SameChords,
    durationInSeconds: 8,
    formats: ['square', 'story', 'wide'],
    defaults: {campaign: 'blueprint', appearance: 'dark'},
  },
  {
    id: 'ChordKeys',
    component: ChordKeys,
    durationInSeconds: 8,
    formats: ['square', 'story', 'wide'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
  {
    id: 'HandsFree',
    component: HandsFree,
    durationInSeconds: 8,
    formats: ['story', 'square', 'wide'],
    defaults: {campaign: 'warm-stage', appearance: 'light'},
  },
  {
    id: 'ThemeSpectrum',
    component: ThemeSpectrum,
    durationInSeconds: 8,
    formats: ['story', 'square', 'wide'],
    defaults: {campaign: 'ink', appearance: 'light'},
  },
  {
    id: 'FeatureReel',
    component: FeatureReel,
    durationInSeconds: featureReelSeconds,
    formats: ['wide', 'story'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
  {
    id: 'ScreenWall',
    component: ScreenWall,
    durationInSeconds: 16,
    formats: ['wide', 'square', 'story'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
  {
    id: 'Manifesto',
    component: Manifesto,
    durationInSeconds: 6,
    formats: ['story', 'square', 'wide'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
  {
    id: 'LaunchCard',
    component: LaunchCard,
    durationInSeconds: 6,
    formats: ['square', 'story', 'wide'],
    defaults: {campaign: 'ink', appearance: 'dark'},
  },
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
