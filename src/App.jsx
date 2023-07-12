/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Float, Lightformer, Text, Html, ContactShadows, Environment, MeshTransmissionMaterial } from "@react-three/drei"
import { EffectComposer, N8AO, TiltShift2 } from "@react-three/postprocessing"
import { Route, Link, useLocation } from "wouter"
import { suspend } from "suspend-react"
import { easing } from "maath"
import { useEffect, useMemo, useRef } from "react"
import { AdditiveBlending, DoubleSide, MeshStandardMaterial, Vector3 } from "three"

const inter = import("/universal-serif.ttf")
useGLTF.preload("/tunic.glb")
useGLTF.preload("/tunic_ghost.glb")

const targetCameraPosition = new Vector3();

export const App = () => {
  const [location] = useLocation();
  const backgroundColor = location === '/' ? '#e0e0e0' : '#212121';

  return (
  <>
    <Canvas eventSource={document.getElementById("root")} eventPrefix="client" shadows camera={{ position: [0, 0, 20], fov: 50 }}>
      <color attach="background" args={[backgroundColor]} />
      <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} />
      <Status position={[0, 0, -10]} />
      <Float floatIntensity={2}>
        <Route path="/">
          <Tunic scale={5} />
        </Route>
        <Route path="/tunic">
          <TunicGhost scale={5} />
        </Route>
      </Float>
      <ContactShadows scale={100} position={[0, -7.5, 0]} blur={1} far={100} opacity={0.85} />
      <Environment preset="city">
        <Lightformer intensity={8} position={[10, 5, 0]} scale={[10, 50, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
      </Environment>
      <EffectComposer disableNormalPass>
        <N8AO aoRadius={1} intensity={2} />
        <TiltShift2 blur={0.2} />
      </EffectComposer>
      <Rig />
    </Canvas>
    <div className="nav">
      <Link to="/">Tunic</Link>
      <Link to="/tunic">Ghost Tunic</Link>
    </div>
  </>
  )
}

function Rig() {
  useFrame((state, delta) => {
    targetCameraPosition.set(
      Math.sin(-state.pointer.x) * 2,
      state.pointer.y * 3.5,
      15 + Math.cos(state.pointer.x) * 10
    );
    easing.damp3(
      state.camera.position,
      targetCameraPosition,
      0.2,
      delta,
    )
    state.camera.lookAt(0, 0, 0)
  })
}

function Tunic(props) {
  const { scene } = useGLTF("/tunic.glb")
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta
    }
  })

  return (
    <primitive receiveShadow castShadow object={scene} ref={ref} {...props}>
      <MeshTransmissionMaterial backside backsideThickness={10} thickness={5} />
    </primitive>
  )
}

function TunicGhost(props) {
  const { scene } = useGLTF("/tunic_ghost.glb");
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
    }
  });

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

  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.material = xrayMaterial;
      }
    });
  }, [scene, xrayMaterial]);

  return <primitive object={scene} ref={ref} {...props} />;
}


function Status(props) {
  const [loc] = useLocation()
  const text = loc === "/" ? "/tunic" : loc
  return (
    <Text fontSize={14} letterSpacing={-0.025} font={suspend(inter).default} color="black" {...props}>
      TUNIC
      <Html style={{ color: "transparent", fontSize: "33.5em" }} transform>
        {text}
      </Html>
    </Text>
  )
}
