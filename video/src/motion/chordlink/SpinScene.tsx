import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useEffect, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {mediaSrc} from '../custom/media';

/**
 * public/models/chordlink.glb — the model the site's own viewer shows — loaded once, centred and
 * converted from metres to millimetres. The render waits for it, so no frame is ever drawn empty.
 */
function useChordlinkModel() {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [handle] = useState(() => delayRender('Loading chordlink.glb'));
  const release = () => continueRender(handle);
  useEffect(() => {
    new GLTFLoader().load(
      mediaSrc('generated/motion/models/chordlink.glb'),
      ({scene}) => {
        const bounds = new THREE.Box3().setFromObject(scene);
        scene.position.sub(bounds.getCenter(new THREE.Vector3()));
        const holder = new THREE.Group();
        holder.add(scene);
        holder.scale.setScalar(1000);
        setModel(holder);
      },
      undefined,
      (error) => {
        throw error;
      },
    );
  }, [handle]);
  return {model, release};
}

/**
 * The canvas only draws when Remotion advances a frame, so a model that arrives mid-frame would
 * never be drawn before the frame is captured. Once it is in the scene, draw once by hand and only
 * then let the render go on.
 */
function DrawWhenReady({model, release}: {model: THREE.Group | null; release: () => void}) {
  const {gl, scene, camera} = useThree();
  useEffect(() => {
    if (!model) return;
    gl.render(scene, camera);
    release();
  }, [model, gl, scene, camera, release]);
  return null;
}

function Camera({aspect}: {aspect: number}) {
  const {camera} = useThree();
  // Far enough that the 32 mm tag, turning, keeps a margin on the narrower side of the frame.
  const distance = Math.max(110, 24 / (Math.tan(THREE.MathUtils.degToRad(15)) * aspect));
  camera.position.set(0, distance * 0.38, distance);
  camera.lookAt(0, aspect < 1 ? distance * 0.06 : 0, 0);
  return null;
}

type SpinSceneProps = {width: number; height: number; offsetX: number};

/** The finished tag turning once on its own axis, tilted toward the light. */
export function SpinScene({width, height, offsetX}: SpinSceneProps) {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {model, release} = useChordlinkModel();
  const turn = interpolate(frame, [0, durationInFrames], [-0.4, Math.PI * 2 - 0.4]);
  const float = Math.sin((frame / durationInFrames) * Math.PI * 2) * 1.2;
  return (
    <ThreeCanvas width={width} height={height} camera={{fov: 30, near: 1, far: 600}}>
      <Camera aspect={width / height} />
      <DrawWhenReady model={model} release={release} />
      <hemisphereLight args={['#ffffff', '#4b5563', 2.2]} />
      <directionalLight position={[30, 50, 40]} intensity={3.2} />
      <directionalLight position={[-40, 10, -20]} intensity={1.2} color="#b8c5ff" />
      {model ? (
        <group position={[offsetX, float, 0]} rotation={[0.18, turn, 0]}>
          <primitive object={model} />
        </group>
      ) : null}
    </ThreeCanvas>
  );
}
