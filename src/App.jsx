/* eslint-disable react/no-unknown-property */
// Importing all necessary modules
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Float, Lightformer, Text, ContactShadows, Environment, MeshTransmissionMaterial } from "@react-three/drei"
// import { EffectComposer, N8AO, TiltShift2 } from "@react-three/postprocessing"
import { suspend } from "suspend-react"
import { easing } from "maath"
import { useEffect, useMemo, useRef, useState } from "react"
import { AdditiveBlending, DoubleSide, MeshStandardMaterial, Vector3 } from "three"

// Preloading 3D models
const inter = import("/universal-serif.ttf")
useGLTF.preload("/tunic.glb")
useGLTF.preload("/tunic_ghost.glb")

const targetCameraPosition = new Vector3();

// Main application component
export const App = () => {
  // Define a state variable to determine which model to display
  const [isGhost, setIsGhost] = useState(false);
  const backgroundColor = isGhost ? '#212121' : '#e0e0e0';

  // The toggle function to switch between models
  const toggleModel = () => setIsGhost(!isGhost);

  return (
  <>
    <Canvas eventSource={document.getElementById("root")} eventPrefix="client" shadows camera={{ position: [0, 0, 20], fov: 50 }}>
      <color attach="background" args={[backgroundColor]} />
      <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} />
      <Status position={[0, 0, -10]} />
      <Float floatIntensity={2}>
        {isGhost ? <TunicGhost scale={5} /> : <Tunic scale={5} />}
      </Float>
      <ContactShadows scale={100} position={[0, -7.5, 0]} blur={1} far={100} opacity={0.85} />
      <Environment preset="city">
        <Lightformer intensity={8} position={[10, 5, 0]} scale={[10, 50, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
      </Environment>
      {/* Adding post-processing effects. The code is commented out to enhance performance. */}
      {/* <EffectComposer disableNormalPass>
        <N8AO aoRadius={1} intensity={2} />
        <TiltShift2 blur={0.2} />
      </EffectComposer> */}
      <Rig />
    </Canvas>
    <div className="nav">
      <div className="toggle">
        <span>
          <img src="/tunicIcon.png" alt="" width={50} />
        </span>
        <input
          type="checkbox"
          id="toggle-switch"
          name="theme-switch"
          className="theme-switch__input"
          onChange={toggleModel}
          checked={isGhost}
      />
        <label htmlFor="toggle-switch"><span className="screen-reader-text">Toggle Color Scheme</span></label>
        <span>
          <img src="/ghost_tunic.png" alt=""  width={50} />
        </span>
      </div>
    </div>
  </>
  )
}

// Camera rig
function Rig() {
  useFrame((state, delta) => {
    // Updating camera position based on pointer position
    targetCameraPosition.set(
      Math.sin(-state.pointer.x) * 2,
      state.pointer.y * 3.5,
      15 + Math.cos(state.pointer.x) * 10
    );
    // Damping the camera position
    easing.damp3(
      state.camera.position,
      targetCameraPosition,
      0.2,
      delta,
    )
    // Camera to look at the origin
    state.camera.lookAt(0, 0, 0)
  })
}

// Tunic model
function Tunic(props) {
  // Loading Tunic model
  const { scene } = useGLTF("/tunic.glb")
  const ref = useRef()

  // Rotation of Tunic model
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta
    }
  })

  return (
    <primitive receiveShadow castShadow object={scene} ref={ref} {...props}>
      {/* Material for the Tunic model */}
      <MeshTransmissionMaterial backside backsideThickness={10} thickness={5} />
    </primitive>
  )
}

// Ghost Tunic model
function TunicGhost(props) {
  // Loading Ghost Tunic model
  const { scene } = useGLTF("/tunic_ghost.glb");
  const ref = useRef();

  // Rotation of Ghost Tunic model
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
    }
  });

  // Creating a material for the Ghost Tunic model
  const xrayMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      color: 0x003366,
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    return material;
  }, []);

  // Applying the material to the Ghost Tunic model
  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.material = xrayMaterial;
      }
    });
  }, [scene, xrayMaterial]);

  return <primitive object={scene} ref={ref} {...props} />;
}

// Status text
function Status(props) {
  return (
    <Text fontSize={14} letterSpacing={-0.025} font={suspend(inter).default} color="black" {...props}>
      TUNIC
    </Text>
  )
}
