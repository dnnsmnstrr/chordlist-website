import {Composition} from 'remotion';
import {ChordlistDemo} from './ChordlistDemo';
import {FPS, getDurationInFrames} from './timeline';
import {videoSchema, type VideoProps} from './video-schema';

const calculateMetadata = ({props}: {props: VideoProps}) => ({
  durationInFrames: getDurationInFrames(props),
});

export const ChordlistRoot: React.FC = () => {
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
        defaultProps={{"cut":"short" as const,"appearance":"light" as const,"copyVariant":"open-tabs" as const,"copyMode":"custom" as const,"customCopy":{"openingHook":"Your lyrics and chords, as files in your pocket.","endLine":"Less managing. More music.","releaseLine":"available now","scenes":{"collect":{"eyebrow":"Together","headline":"Every song in one place","explanation":"Collect songs from the web or write your own without breaking your flow."},"find":{"eyebrow":"On cue","headline":"Find the right song, fast","explanation":"Search by song, artist, tag, or chord progression and get back to playing."},"pace":{"eyebrow":"Keep moving","headline":"The chart follows your pace","explanation":"Fine-tune autoscroll from a gentle rehearsal pace to a confident performance."},"adapt":{"eyebrow":"Your key","headline":"Transpose without rewriting","explanation":"Shift the entire chart in one tap while the original song stays intact."},"hands-free":{"eyebrow":"Your style","headline":"Customize your theme","explanation":"A continuous, colour-changing chart demonstrates the full hands-free experience."},"files":{"eyebrow":"Still yours","headline":"Saved as readable Markdown","explanation":"Every song remains a simple file you can read, move, and keep for yourself."}}},"accentColor":"#FAFAF8","paperSeed":193,"mediaPadding":28,"showShotLabels":false,"musicFile":"","musicVolume":0.18,"voiceoverFile":"","voiceoverVolume":1,"manualClipFile":"","manualClipSeconds":3,"scenes":[{"id":"collect" as const,"enabled":true,"clipTitles":["Song library","Link import","Imported song draft","Chord keyboard","Song opens"],"startOffsetSeconds":0.5,"maxSecondsPerClip":2.8},{"id":"find" as const,"enabled":true,"clipTitles":["Shuffle","Search","Matching songs","Matching song selected","Next song"],"startOffsetSeconds":0.5,"maxSecondsPerClip":3.5},{"id":"pace" as const,"enabled":true,"clipTitles":["Autoscroll starts","Speed control","Speed raised to maximum"],"startOffsetSeconds":0.5,"maxSecondsPerClip":3.2},{"id":"adapt" as const,"enabled":true,"clipTitles":["Transpose control","Transposed up a semitone"],"startOffsetSeconds":1.1,"maxSecondsPerClip":3.2},{"id":"hands-free" as const,"enabled":true,"clipTitles":["Hands-free autoscroll"],"startOffsetSeconds":0,"maxSecondsPerClip":8}]}}
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
        defaultProps={{
          cut: 'standard',
          appearance: 'light',
          copyVariant: 'play-more',
          copyMode: 'preset',
          customCopy: {
            openingHook: 'Spend less time organizing. More time playing.',
            endLine: 'Less managing. More music.',
            releaseLine: 'chordlist — coming August 30',
            scenes: {
              collect: {
                eyebrow: 'Together',
                headline: 'Every song in one place',
                explanation:
                  'Collect songs from the web or write your own without breaking your flow.',
              },
              find: {
                eyebrow: 'On cue',
                headline: 'Find the right song, fast',
                explanation:
                  'Search by song, artist, tag, or chord progression and get back to playing.',
              },
              pace: {
                eyebrow: 'Keep moving',
                headline: 'The chart follows your pace',
                explanation:
                  'Fine-tune autoscroll from a gentle rehearsal pace to a confident performance.',
              },
              adapt: {
                eyebrow: 'Your key',
                headline: 'Transpose without rewriting',
                explanation:
                  'Shift the entire chart in one tap while the original song stays intact.',
              },
              'hands-free': {
                eyebrow: 'Stay playing',
                headline: 'Keep your hands on the instrument',
                explanation:
                  'A continuous, colour-changing chart demonstrates the full hands-free experience.',
              },
              files: {
                eyebrow: 'Still yours',
                headline: 'Saved as readable Markdown',
                explanation:
                  'Every song remains a simple file you can read, move, and keep for yourself.',
              },
            },
          },
          accentColor: '#FAFAF8',
          paperSeed: 185,
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
        }}
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
        defaultProps={{
          cut: 'documentary',
          appearance: 'light',
          copyVariant: 'play-more',
          copyMode: 'preset',
          customCopy: {
            openingHook: 'Spend less time organizing. More time playing.',
            endLine: 'Less managing. More music.',
            releaseLine: 'chordlist — coming August 30',
            scenes: {
              collect: {
                eyebrow: 'Together',
                headline: 'Every song in one place',
                explanation:
                  'Collect songs from the web or write your own without breaking your flow.',
              },
              find: {
                eyebrow: 'On cue',
                headline: 'Find the right song, fast',
                explanation:
                  'Search by song, artist, tag, or chord progression and get back to playing.',
              },
              pace: {
                eyebrow: 'Keep moving',
                headline: 'The chart follows your pace',
                explanation:
                  'Fine-tune autoscroll from a gentle rehearsal pace to a confident performance.',
              },
              adapt: {
                eyebrow: 'Your key',
                headline: 'Transpose without rewriting',
                explanation:
                  'Shift the entire chart in one tap while the original song stays intact.',
              },
              'hands-free': {
                eyebrow: 'Stay playing',
                headline: 'Keep your hands on the instrument',
                explanation:
                  'A continuous, colour-changing chart demonstrates the full hands-free experience.',
              },
              files: {
                eyebrow: 'Still yours',
                headline: 'Saved as readable Markdown',
                explanation:
                  'Every song remains a simple file you can read, move, and keep for yourself.',
              },
            },
          },
          accentColor: '#FAFAF8',
          paperSeed: 185,
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
        }}
      />
    </>
  );
};
