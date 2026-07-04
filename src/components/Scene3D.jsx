import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTransform } from 'framer-motion';
import * as THREE from 'three';

/*
 * ═══════════════════════════════════════════════
 * Scene3D — Cinematic Bowling Lane (Anti-PS2)
 * ═══════════════════════════════════════════════
 *
 * Physical materials, spotlight shadows, fog depth,
 * intimate camera angle. No neon rings, no grids,
 * no Tron wireframes — premium realism only.
 */

const LANE_END = -18;

// Standard 10-pin triangle at Z = -18
const PIN_POSITIONS = [
  { id: 1,  x:  0,    z: LANE_END },
  { id: 2,  x: -0.3,  z: LANE_END - 0.5 },
  { id: 3,  x:  0.3,  z: LANE_END - 0.5 },
  { id: 4,  x: -0.6,  z: LANE_END - 1.0 },
  { id: 5,  x:  0,    z: LANE_END - 1.0 },
  { id: 6,  x:  0.6,  z: LANE_END - 1.0 },
  { id: 7,  x: -0.9,  z: LANE_END - 1.5 },
  { id: 8,  x: -0.3,  z: LANE_END - 1.5 },
  { id: 9,  x:  0.3,  z: LANE_END - 1.5 },
  { id: 10, x:  0.9,  z: LANE_END - 1.5 },
];

// Scatter directions for each pin
const SCATTER_DIRS = [
  { dx:  0.5, dy: 3,   dz: -2,  rx: 4,  ry: 3,  rz: 1 },
  { dx: -2,   dy: 2.5, dz: -1,  rx:-3,  ry: 1,  rz: 2 },
  { dx:  2,   dy: 3,   dz: -1,  rx: 4,  ry:-2,  rz:-1 },
  { dx: -3,   dy: 2,   dz: -2,  rx:-2,  ry: 4,  rz: 3 },
  { dx:  0,   dy: 4,   dz: -3,  rx: 5,  ry: 1,  rz:-2 },
  { dx:  3,   dy: 2.5, dz: -2,  rx: 1,  ry: 5,  rz: 4 },
  { dx: -3.5, dy: 1.5, dz: -1,  rx:-4,  ry:-1,  rz: 2 },
  { dx: -1,   dy: 3,   dz: -2,  rx: 2,  ry:-3,  rz: 1 },
  { dx:  1,   dy: 2.5, dz: -3,  rx: 3,  ry: 2,  rz:-3 },
  { dx:  3.5, dy: 2,   dz: -1,  rx:-1,  ry: 4,  rz: 2 },
];

/* ─────────────────────────────────────────────
   Bowling pin profile (LatheGeometry)
   Creates a smooth realistic bowling pin shape.
   ───────────────────────────────────────────── */
function usePinGeometry() {
  return useMemo(() => {
    const points = [
      new THREE.Vector2(0.00, -0.35),
      new THREE.Vector2(0.16, -0.35),
      new THREE.Vector2(0.18, -0.30),
      new THREE.Vector2(0.22, -0.15),
      new THREE.Vector2(0.24,  0.00),
      new THREE.Vector2(0.22,  0.12),
      new THREE.Vector2(0.17,  0.22),
      new THREE.Vector2(0.11,  0.32),
      new THREE.Vector2(0.09,  0.38),
      new THREE.Vector2(0.10,  0.44),
      new THREE.Vector2(0.10,  0.48),
      new THREE.Vector2(0.08,  0.54),
      new THREE.Vector2(0.00,  0.58),
    ];
    return new THREE.LatheGeometry(points, 32);
  }, []);
}

/* ─────────────────────────────────────────────
   Pin component — Physical material, subtle accent edge
   ───────────────────────────────────────────── */
function Pin({ startX, startZ, scatter, scrollYProgress }) {
  const groupRef = React.useRef();
  const pinGeo = usePinGeometry();

  const x    = useTransform(scrollYProgress, [0, 0.55, 0.75], [startX, startX, startX + scatter.dx]);
  const y    = useTransform(scrollYProgress, [0, 0.55, 0.75], [0, 0, scatter.dy]);
  const z    = useTransform(scrollYProgress, [0, 0.55, 0.75], [startZ, startZ, startZ + scatter.dz]);
  const rotX = useTransform(scrollYProgress, [0, 0.55, 0.75], [0, 0, scatter.rx]);
  const rotY = useTransform(scrollYProgress, [0, 0.55, 0.75], [0, 0, scatter.ry]);
  const rotZ = useTransform(scrollYProgress, [0, 0.55, 0.75], [0, 0, scatter.rz]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(x.get(), y.get(), z.get());
      groupRef.current.rotation.set(rotX.get(), rotY.get(), rotZ.get());
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pin body — smooth physical material */}
      <mesh geometry={pinGeo} castShadow>
        <meshStandardMaterial
          color="#f0ece4"
          emissive="#ffffff"
          emissiveIntensity={0.05}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      {/* Top red stripe */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.105, 0.115, 0.05, 32]} />
        <meshStandardMaterial color="#b00020" emissive="#cc0000" emissiveIntensity={0.15} roughness={0.3} />
      </mesh>
      {/* Bottom red stripe */}
      <mesh position={[0, 0.30, 0]} castShadow>
        <cylinderGeometry args={[0.125, 0.13, 0.05, 32]} />
        <meshStandardMaterial color="#b00020" emissive="#cc0000" emissiveIntensity={0.15} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   SceneContents — the full 3D scene (cinematic)
   ───────────────────────────────────────────── */
export function SceneContents({ scrollYProgress }) {
  const ballRef = React.useRef();
  const textRef = React.useRef();

  // 1. Ball falls onto lane (0 → 0.08)
  const ballY = useTransform(scrollYProgress, [0, 0.08], [4, 0]);

  // 2. Ball rolls toward pins (0.08 → 0.55)
  const ballZ = useTransform(scrollYProgress, [0.08, 0.55, 0.75], [0, LANE_END, LANE_END - 3]);
  const ballRotX = useTransform(scrollYProgress, [0.08, 0.55], [0, -Math.PI * 20]);

  // 3. STRIKE text scale (appears at impact)
  const textScale = useTransform(scrollYProgress, [0.54, 0.58, 0.70, 0.80], [0, 1.2, 1, 0]);

  useFrame(({ camera }) => {
    // Camera: intimate, cinematic, following behind ball
    const bz = ballZ.get();
    const by = ballY.get();
    camera.position.z = bz + 4;
    camera.position.y = 1.0 + by * 0.2;
    camera.lookAt(0, 0.3, bz - 3);

    // Sync ball
    if (ballRef.current) {
      ballRef.current.position.y = by;
      ballRef.current.position.z = bz;
      ballRef.current.rotation.x = ballRotX.get();
    }

    // Sync STRIKE text
    if (textRef.current) {
      const s = textScale.get();
      textRef.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      {/* ── Fog (masks canvas edges seamlessly) ── */}
      <fog attach="fog" args={['#050505', 6, 22]} />

      {/* ── Lighting (brighter for less visual fatigue) ── */}
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 18, 5]}
        intensity={3.5}
        castShadow
        penumbra={1}
        angle={0.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        color="#ffffff"
      />
      <spotLight
        position={[-8, 14, -10]}
        intensity={2.0}
        castShadow
        penumbra={0.8}
        angle={0.6}
        color="#e8e4f0"
      />
      {/* Subtle accent fill from pin area */}
      <pointLight position={[0, 2, LANE_END]} intensity={2.5} color="#3781fe" distance={10} decay={2} />

      {/* ── Dark reflective floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -12]} receiveShadow>
        <planeGeometry args={[30, 50]} />
        <meshStandardMaterial color="#060608" metalness={0.9} roughness={0.08} />
      </mesh>

      {/* ── Lane surface (subtle, premium) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, -10]} receiveShadow>
        <planeGeometry args={[2.4, 30]} />
        <meshStandardMaterial
          color="#1a1408"
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* ── Glowing Path (El recorrido) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, -10]}>
        <planeGeometry args={[1.6, 30]} />
        <meshStandardMaterial
          color="#df2a8f"
          emissive="#df2a8f"
          emissiveIntensity={0.8}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Lane guide lines (subtle brand accent) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, -0.47, -10]}>
        <planeGeometry args={[0.02, 30]} />
        <meshStandardMaterial
          color="#3781fe"
          emissive="#3781fe"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, -0.47, -10]}>
        <planeGeometry args={[0.02, 30]} />
        <meshStandardMaterial
          color="#3781fe"
          emissive="#3781fe"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* ── 10 Pins ── */}
      {PIN_POSITIONS.map((pin, i) => (
        <Pin
          key={pin.id}
          startX={pin.x}
          startZ={pin.z}
          scatter={SCATTER_DIRS[i]}
          scrollYProgress={scrollYProgress}
        />
      ))}

      {/* ── Bowling Ball (Physical Material, premium) ── */}
      <group ref={ballRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 64, 64]} />
          <meshPhysicalMaterial
            color="#1a0040"
            metalness={0.8}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#2b0059"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Thumb hole */}
        <mesh position={[0, -0.08, 0.36]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
        {/* Finger holes */}
        <mesh position={[0.15, 0.15, 0.32]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
        <mesh position={[-0.15, 0.15, 0.32]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
      </group>

      {/* ── STRIKE! Text ── */}
      <group ref={textRef} position={[0, 1.5, LANE_END - 2]}>
        <mesh>
          <planeGeometry args={[3, 0.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </>
  );
}

export default function Scene3D({ scrollYProgress }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#050505' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.1, 7.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <SceneContents scrollYProgress={scrollYProgress} />
      </Canvas>
    </div>
  );
}
