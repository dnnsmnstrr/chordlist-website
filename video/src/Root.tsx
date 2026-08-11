import {Composition} from 'remotion';
import {ChordlistDemo} from './ChordlistDemo';
import {FPS, getDurationInFrames} from './timeline';
import {videoSchema} from './video-schema';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ChordlistDemo"
      component={ChordlistDemo}
      durationInFrames={900}
      fps={FPS}
      width={1080}
      height={1920}
      schema={videoSchema}
      calculateMetadata={({props}) => ({
        durationInFrames: getDurationInFrames(props),
      })}
      defaultProps={{
        appearance: 'light',
        copyVariant: 'play-more', // 'open-tabs' | 'play-more' | 'ownership'
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
            maxSecondsPerClip: 2.6,
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
            clipTitles: ['Transposed up a semitone'],
            startOffsetSeconds: 1.1,
            maxSecondsPerClip: 3.2,
          },
          {
            id: 'hands-free',
            enabled: true,
            clipTitles: ['Hands-free autoscroll'],
            startOffsetSeconds: 0.5,
            maxSecondsPerClip: 8,
          },
        ],
      }}
    />
  );
};
