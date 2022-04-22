// This demo is also playable without installation here:
// https://codesandbox.io/s/basic-demo-forked-ebr0x

import type { CylinderArgs, CylinderProps, PlaneProps } from '@react-three/cannon'
import { Debug, Physics, useCylinder, usePlane } from '@react-three/cannon'
import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { Group, Mesh, Vector3 } from 'three'
import * as THREE from 'three'

import { useToggledControl } from './use-toggled-control'
import Vehicle from './Vehicle'

function Plane(props: PlaneProps) {
  const [ref] = usePlane(() => ({ material: 'ground', type: 'Static', ...props }), useRef<Group>(null))
  return (
    <group ref={ref}>
      <mesh receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#606060" />
      </mesh>
    </group>
  )
}

function Pillar(props: CylinderProps) {
  const args: CylinderArgs = [0.7, 0.7, 5, 16]
  const [ref] = useCylinder(
    () => ({
      args,
      mass: 200000,
      ...props,
    }),
    useRef<Mesh>(null),
  )
  return (
    <mesh ref={ref} castShadow>
      <cylinderBufferGeometry args={args} />
      <meshNormalMaterial />
    </mesh>
  )
}

const style = {
  color: 'white',
  fontSize: '1.2em',
  left: 50,
  position: 'absolute',
  top: 20,
} as const

const VehicleScene = () => {

  const ToggledDebug = useToggledControl(Debug, '?')

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, -5)

  const pillars: JSX.Element[] = [];
  for (let i = 0; i < 25 * 25; i++) {
    if (i !== 1225)
      pillars.push(<Pillar key={i} position={[Math.round(i / 25) * 20 - 250, 2.5, (i % 25) * 20 - 250]} userData={{ id: 'pillar-' + i }} />);
  }
  return (
    <>
      <Canvas shadows camera={camera}>
        <color attach="background" args={['#171720']} />
        <ambientLight intensity={1} />
        <Physics
          broadphase="SAP"
          defaultContactMaterial={{ contactEquationRelaxation: 4, friction: 1e-3 }}
          allowSleep
        >
          <ToggledDebug>
            <Plane rotation={[-Math.PI / 2, 0, 0]} userData={{ id: 'floor' }} />
            <Vehicle camera={camera} position={[0, 2, 0]} rotation={[0, 0, 0]} angularVelocity={[0, -0.5, 0]} />
            {pillars}
          </ToggledDebug>
        </Physics>
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>
        <gridHelper args={[500, 500]} />
        {/* <OrbitControls /> */}
      </Canvas>
      <div style={style}>
        <pre>
          * WASD to drive, space to brake
          <br />r : reset
        </pre>
      </div>
    </>
  )
}

export default VehicleScene
