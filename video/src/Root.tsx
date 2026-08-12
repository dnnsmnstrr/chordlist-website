import {Composition} from 'remotion';
import {ChordlistDemo} from './ChordlistDemo';
import {FPS, getDurationInFrames} from './timeline';
import {videoSchema, type VideoProps} from './video-schema';

const baseDefaultProps: Omit<VideoProps, 'cut'> = {
  appearance: 'light',
  copyVariant: 'play-more',
  accentColor: '#FAFAFA',
  mediaPadding: 28,
  showShotLabels: false,
  musicFile: '',
  musicVolume: 0.18,
  voiceoverFile: '',
  voiceoverVolume: 1,
  manualClipFile: '',
  manualClipSeconds: 3,
  scenes: [
    {
      id: 'collect',
      enabled: true,
      clipTitles: [
        'Song library',
        'Link import',
        'Imported song draft',
        'Chord keyboard',
        'Song opens',
      ],
      startOffsetSeconds: 0.5,
      maxSecondsPerClip: 2.8,
    },
    {
      id: 'find',
      enabled: true,
      clipTitles: [
        'Shuffle',
        'Search',
        'Matching songs',
        'Matching song selected',
        'Next song',
      ],
      startOffsetSeconds: 0.5,
      maxSecondsPerClip: 3.5,
    },
    {
      id: 'pace',
      enabled: true,
      clipTitles: [
        'Autoscroll starts',
        'Speed control',
        'Speed raised to maximum',
      ],
      startOffsetSeconds: 0.5,
      maxSecondsPerClip: 3.2,
    },
    {
      id: 'adapt',
      enabled: true,
      clipTitles: ['Transpose control', 'Transposed up a semitone'],
      startOffsetSeconds: 1.1,
      maxSecondsPerClip: 3.2,
    },
    {
      id: 'hands-free',
      enabled: true,
      clipTitles: ['Hands-free autoscroll'],
      startOffsetSeconds: 0,
      maxSecondsPerClip: 8,
    },
  ],
};

const defaultsFor = (cut: VideoProps['cut']): VideoProps => ({
  ...baseDefaultProps,
  cut,
});

const calculateMetadata = ({props}: {props: VideoProps}) => ({
  durationInFrames: getDurationInFrames(props),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChordlistPromoShort"
        component={ChordlistDemo}
        durationInFrames={450}
        fps={FPS}
        width={1080}
        height={1920}
        schema={videoSchema}
        calculateMetadata={calculateMetadata}
        defaultProps={defaultsFor('short')}
      />
      <Composition
        id="ChordlistDemo"
        component={ChordlistDemo}
        durationInFrames={900}
        fps={FPS}
        width={1080}
        height={1920}
        schema={videoSchema}
        calculateMetadata={calculateMetadata}
        defaultProps={defaultsFor('standard')}
      />
      <Composition
        id="ChordlistPromoDocumentary"
        component={ChordlistDemo}
        durationInFrames={1350}
        fps={FPS}
        width={1080}
        height={1920}
        schema={videoSchema}
        calculateMetadata={calculateMetadata}
        defaultProps={defaultsFor('documentary')}
      />
    </>
  );
};
