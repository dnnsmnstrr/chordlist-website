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
        accentColor: '#FAFAFA',
        openingHook: 'Your songs deserve better than 37 open tabs.',
        endLine: 'Your lyrics. Your chords. Your files.',
        releaseLine: 'chordlist — coming August 30',
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
            enabled: true,
            eyebrow: 'Collect',
            headline: 'One personal songbook',
            clipTitles: [
              'Song library',
              'Link import',
              'Imported song draft',
              'Chord keyboard',
            ],
            maxSecondsPerClip: 2.8,
          },
          {
            enabled: true,
            eyebrow: 'Find',
            headline: 'Search. Match. Keep playing.',
            clipTitles: [
              'Shuffle',
              'Search',
              'Matching songs',
              'Matching song selected',
              'Next song',
            ],
            maxSecondsPerClip: 2.6,
          },
          {
            enabled: true,
            eyebrow: 'Adapt',
            headline: 'Transpose in a tap',
            clipTitles: [
              'Transpose control',
              'Transposed up a semitone',
            ],
            maxSecondsPerClip: 3.2,
          },
          {
            enabled: true,
            eyebrow: 'Set the pace',
            headline: 'Scroll at your speed',
            clipTitles: [
              'Autoscroll starts',
              'Speed control',
              'Speed raised to maximum',
            ],
            maxSecondsPerClip: 3.2,
          },
          {
            enabled: true,
            eyebrow: 'Hands free',
            headline: 'Lyrics that move with you',
            clipTitles: ['Hands-free autoscroll'],
            maxSecondsPerClip: 8,
          },
        ],
      }}
    />
  );
};
