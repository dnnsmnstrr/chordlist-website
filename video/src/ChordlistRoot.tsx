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
        defaultProps={{"cut":"standard" as const,"appearance":"light" as const,"copyVariant":"chord-matching" as const,"copyMode":"custom" as const,"customCopy":{"openingHook":"Your songbook should belong to you.","openingFooter":"Portable by design. Yours by default.","endLine":"Your chords\\nYour lyrics\\nYour files","releaseLine":"download now","scenes":{"collect":{"eyebrow":"Together","headline":"Every song in one place","explanation":"Collect songs from the web or write your own without breaking your flow."},"find":{"eyebrow":"On cue","headline":"Find the right song, fast","explanation":"Search by song, artist, tag, or chord progression and get back to playing."},"pace":{"eyebrow":"Keep moving","headline":"The chart follows your pace","explanation":"Fine-tune autoscroll from a gentle rehearsal pace to a confident performance."},"adapt":{"eyebrow":"Your key","headline":"Transpose without rewriting","explanation":"Shift the entire chart in one tap while the original song stays intact."},"hands-free":{"eyebrow":"Your style","headline":"Customize your theme","explanation":"A continuous, colour-changing chart demonstrates the full hands-free experience."},"files":{"eyebrow":"Still yours","headline":"Saved as readable Markdown","explanation":"Every song remains a simple file you can read, move, and keep for yourself."}}},"accentColor":"#FAFAF8","paperSeed":193,"mediaPadding":28,"showShotLabels":false,"musicFile":"","musicVolume":0.18,"voiceoverFile":"","voiceoverVolume":1,"manualClipFile":"","manualClipSeconds":3,"scenes":[{"id":"collect" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Song library","Link import","Imported song draft","Chord keyboard","Song opens"],"sceneDurationSeconds":2.2,"startOffsetSeconds":0,"maxSecondsPerClip":2.8},{"id":"find" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Shuffle","Search","Matching songs","Matching song selected","Next song"],"sceneDurationSeconds":3.7,"startOffsetSeconds":4,"maxSecondsPerClip":3.5},{"id":"pace" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Autoscroll starts","Speed control","Speed raised to maximum"],"sceneDurationSeconds":6,"startOffsetSeconds":1.1,"maxSecondsPerClip":3.2},{"id":"adapt" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Transpose control","Transposed up a semitone"],"sceneDurationSeconds":2.6,"startOffsetSeconds":1.6,"maxSecondsPerClip":3.3},{"id":"hands-free" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Hands-free autoscroll"],"sceneDurationSeconds":8,"startOffsetSeconds":0,"maxSecondsPerClip":8}]}}
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
        defaultProps={{"cut":"standard" as const,"appearance":"light" as const,"copyVariant":"play-more" as const,"copyMode":"custom" as const,"customCopy":{"openingHook":"Spend less time organizing. More time playing.","openingFooter":"Less organizing. More playing.","endLine":"Less managing. More music.","releaseLine":"chordlist — coming August 30","scenes":{"collect":{"eyebrow":"Together","headline":"Every song in one place","explanation":"Collect songs from the web or write your own without breaking your flow."},"find":{"eyebrow":"On cue","headline":"Find the right song, fast","explanation":"Search by song, artist, tag, or chord progression and get back to playing."},"pace":{"eyebrow":"Keep moving","headline":"The chart follows your pace","explanation":"Fine-tune autoscroll from a gentle rehearsal pace to a confident performance."},"adapt":{"eyebrow":"Your key","headline":"Transpose without rewriting","explanation":"Shift the entire chart in one tap while the original song stays intact."},"hands-free":{"eyebrow":"Stay playing","headline":"Keep your hands on the instrument","explanation":"A continuous, colour-changing chart demonstrates the full hands-free experience."},"files":{"eyebrow":"Still yours","headline":"Saved as readable Markdown","explanation":"Every song remains a simple file you can read, move, and keep for yourself."}}},"accentColor":"#FAFAF8","paperSeed":185,"mediaPadding":28,"showShotLabels":false,"musicFile":"","musicVolume":0.18,"voiceoverFile":"","voiceoverVolume":1,"manualClipFile":"","manualClipSeconds":3,"scenes":[{"id":"collect" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Song library","Link import","Imported song draft","Chord keyboard","Song opens"],"sceneDurationSeconds":4,"startOffsetSeconds":0.5,"maxSecondsPerClip":2.8},{"id":"find" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Shuffle","Search","Matching songs","Matching song selected","Next song"],"sceneDurationSeconds":3.5,"startOffsetSeconds":0.5,"maxSecondsPerClip":3.5},{"id":"pace" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Autoscroll starts","Speed control","Speed raised to maximum"],"sceneDurationSeconds":6,"startOffsetSeconds":0.5,"maxSecondsPerClip":3.2},{"id":"adapt" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Transpose control","Transposed up a semitone"],"sceneDurationSeconds":4,"startOffsetSeconds":1.1,"maxSecondsPerClip":3.2},{"id":"hands-free" as const,"enabled":true,"freezeFrame":false,"clipTitles":["Hands-free autoscroll"],"sceneDurationSeconds":8,"startOffsetSeconds":0,"maxSecondsPerClip":8}]}}
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
            openingFooter: 'Less organizing. More playing.',
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
              freezeFrame: false,
              clipTitles: [
                'Song library',
                'Link import',
                'Imported song draft',
                'Chord keyboard',
                'Song opens',
              ],
              sceneDurationSeconds: 9,
              startOffsetSeconds: 0.5,
              maxSecondsPerClip: 9,
            },
            {
              id: 'find',
              enabled: true,
              freezeFrame: false,
              clipTitles: [
                'Shuffle',
                'Search',
                'Matching songs',
                'Matching song selected',
                'Next song',
              ],
              sceneDurationSeconds: 8,
              startOffsetSeconds: 0.5,
              maxSecondsPerClip: 8,
            },
            {
              id: 'pace',
              enabled: true,
              freezeFrame: false,
              clipTitles: [
                'Autoscroll starts',
                'Speed control',
                'Speed raised to maximum',
              ],
              sceneDurationSeconds: 8.5,
              startOffsetSeconds: 0.5,
              maxSecondsPerClip: 8.5,
            },
            {
              id: 'adapt',
              enabled: true,
              freezeFrame: false,
              clipTitles: ['Transpose control', 'Transposed up a semitone'],
              sceneDurationSeconds: 6.5,
              startOffsetSeconds: 1.1,
              maxSecondsPerClip: 6.5,
            },
            {
              id: 'hands-free',
              enabled: true,
              freezeFrame: false,
              clipTitles: ['Hands-free autoscroll'],
              sceneDurationSeconds: 8,
              startOffsetSeconds: 0,
              maxSecondsPerClip: 8,
            },
          ],
        }}
      />
    </>
  );
};
