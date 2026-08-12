import {Config} from '@remotion/cli/config';

// Canvas effects such as the animated paper texture require a WebGL2-capable renderer in
// headless Chrome. ANGLE works consistently for local stills, Studio previews, and video renders.
Config.setChromiumOpenGlRenderer('angle');

// A path without an extension is treated as a directory. Studio appends the selected composition
// ID and codec, for example public/video/ChordlistPromoShort.mp4.
Config.setOutputLocation('public/video');
