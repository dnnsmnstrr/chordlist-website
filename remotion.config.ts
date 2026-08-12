import {Config} from '@remotion/cli/config';

// Canvas effects such as the animated paper texture require a WebGL2-capable renderer in
// headless Chrome. ANGLE works consistently for local stills, Studio previews, and video renders.
Config.setChromiumOpenGlRenderer('angle');
