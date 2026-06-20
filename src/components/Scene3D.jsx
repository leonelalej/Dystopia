import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useTransform } from 'framer-motion';
import * as THREE from 'three';

/*
 * ═══════════════════════════════════════════════════
 * Scene3D — Bowling lane with TRON aesthetic
 * ═══════════════════════════════════════════════════
 */

const LANE_END = -18;

// Neon rings along the tunnel
const RING_COUNT = 25;
const RINGS = Array.from({ length: RING_COUNT }, (_, i) => ({
  id: i,
  z: -i * 1.0,
  color: i % 2 === 0 ? '#00f3ff' : '#ff007f',
}));

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
    // Profile points from base to head (x = radius, y = height)
    const points = [
      new THREE.Vector2(0.00, -0.35), // bottom center
      new THREE.Vector2(0.16, -0.35), // base edge
      new THREE.Vector2(0.18, -0.30), // base top
      new THREE.Vector2(0.22, -0.15), // belly start
      new THREE.Vector2(0.24,  0.00), // widest belly
      new THREE.Vector2(0.22,  0.12), // belly taper
      new THREE.Vector2(0.17,  0.22), // waist start
      new THREE.Vector2(0.11,  0.32), // neck
      new THREE.Vector2(0.09,  0.38), // neck narrow
      new THREE.Vector2(0.10,  0.44), // head start
      new THREE.Vector2(0.10,  0.48), // head mid
      new THREE.Vector2(0.08,  0.54), // head top
      new THREE.Vector2(0.00,  0.58), // tip
    ];
    return new THREE.LatheGeometry(points, 32);
  }, []);
}

/* ─────────────────────────────────────────────
   Pin component — Smooth lathe shape with stripes
   ───────────────────────────────────────────── */
function Pin({ startX, startZ, scatter, scrollYProgress }) {
  const groupRef = React.useRef();
  const pinGeo = usePinGeometry();

  // Stay put until 0.55, then scatter
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
      {/* Smooth pin body */}
      <mesh geometry={pinGeo}>
        <meshStandardMaterial
          color="#f5f5f5"
          emissive="#ffffff"
          emissiveIntensity={0.15}
          roughness={0.12}
          metalness={0.05}
        />
      </mesh>
      {/* Top red stripe */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.105, 0.115, 0.05, 32]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      {/* Bottom red stripe */}
      <mesh position={[0, 0.30, 0]}>
        <cylinderGeometry args={[0.125, 0.13, 0.05, 32]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      {/* Neon edge glow on pin (Tron style) */}
      <mesh geometry={pinGeo}>
        <meshBasicMaterial color="#00f3ff" wireframe opacity={0.08} transparent />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   SceneContents — the full 3D scene
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
    // Camera always stays behind the ball
    const bz = ballZ.get();
    const by = ballY.get();
    camera.position.z = bz + 3;
    camera.position.y = 1.2 + by * 0.3;
    camera.lookAt(0, 0.5, bz - 2);

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
      {/* ── Lighting (moody, Tron-like) ── */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, 2, LANE_END]} intensity={4} color="#ff007f" distance={12} />
      <pointLight position={[0, 3, -5]} intensity={3} color="#00f3ff" distance={12} />
      <pointLight position={[0, 1, -10]} intensity={2} color="#b900ff" distance={10} />

      {/* ── Dark reflective floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -12]}>
        <planeGeometry args={[30, 50]} />
        <meshStandardMaterial color="#020208" metalness={0.98} roughness={0.02} />
      </mesh>

      {/* ── Tron Grid Floor ── */}
      <gridHelper args={[50, 80, '#00f3ff', '#00f3ff']} position={[0, -0.49, -12]} />
      {/* Second grid layer for cross-pattern depth */}
      <gridHelper args={[50, 20, '#ff007f', 'transparent']} position={[0, -0.48, -12]} />

      {/* ── Lane guide lines (bright neon cyan) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, -0.47, -10]}>
        <planeGeometry args={[0.04, 30]} />
        <meshBasicMaterial color="#00f3ff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, -0.47, -10]}>
        <planeGeometry args={[0.04, 30]} />
        <meshBasicMaterial color="#00f3ff" />
      </mesh>
      {/* Center lane line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, -10]}>
        <planeGeometry args={[0.015, 30]} />
        <meshBasicMaterial color="#ff007f" opacity={0.4} transparent />
      </mesh>

      {/* ── Neon Rings (tunnel) — thicker, brighter ── */}
      {RINGS.map((ring) => (
        <mesh key={ring.id} position={[0, 1, ring.z]}>
          <torusGeometry args={[2.5, 0.06, 16, 64]} />
          <meshStandardMaterial
            color={ring.color}
            emissive={ring.color}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ── Vertical Tron light pillars ── */}
      {[-2.5, 2.5].map((xPos) =>
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={`pillar-${xPos}-${i}`} position={[xPos, 1.5, -i * 4]}>
            <boxGeometry args={[0.03, 3, 0.03]} />
            <meshBasicMaterial color="#00f3ff" opacity={0.3} transparent />
          </mesh>
        ))
      )}

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

      {/* ── Bowling Ball (dark blue with neon glow ring) ── */}
      <group ref={ballRef}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#0a1628" metalness={0.95} roughness={0.03} emissive="#1e3a8a" emissiveIntensity={0.3} />
        </mesh>
        {/* Neon equator ring (Tron style) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.008, 16, 64]} />
          <meshBasicMaterial color="#00f3ff" />
        </mesh>
        {/* Thumb hole */}
        <mesh position={[0, -0.08, 0.36]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Finger holes */}
        <mesh position={[0.15, 0.15, 0.32]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.15, 0.15, 0.32]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* ── STRIKE! Text (small) ── */}
      <group ref={textRef} position={[0, 1.5, LANE_END - 2]}>
        <Text
          fontSize={0.7}
          color="#00f3ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#ff007f"
        >
          STRIKE!
        </Text>
      </group>
    </>
  );
}

export default function Scene3D({ scrollYProgress }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#000' }}>
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 60 }}
        gl={{ antialias: true }}
      >
        <SceneContents scrollYProgress={scrollYProgress} />
      </Canvas>
    </div>
  );
}
