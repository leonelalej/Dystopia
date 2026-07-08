import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTransform } from 'framer-motion';
import { Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/*
 * ═══════════════════════════════════════════════
 * Scene3D — Cyberpunk Bowling Lane (Re-Design)
 * ═══════════════════════════════════════════════
 *
 * RE-DESIGN overhaul:
 * - fogExp2 with deep brand purple for atmospheric depth
 * - Dramatic neon spotlight rig with sharp shadows
 * - Reflective MeshPhysicalMaterial on ball, lane, floor
 * - Floating wireframe geometric elements
 * - Volumetric light shafts
 * - Dense particle systems
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
   Pin component — Reflective physical material
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
      {/* Pin body — glossy physical material for neon reflections */}
      <mesh geometry={pinGeo} castShadow>
        <meshPhysicalMaterial
          color="#f0ece4"
          emissive="#ffffff"
          emissiveIntensity={0.08}
          roughness={0.15}
          metalness={0.15}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>
      {/* Top red stripe — glowing under neon */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.105, 0.115, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#cc0020"
          emissive="#ff0033"
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Bottom red stripe */}
      <mesh position={[0, 0.30, 0]} castShadow>
        <cylinderGeometry args={[0.125, 0.13, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#cc0020"
          emissive="#ff0033"
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   Floating Wireframe Shape — brand complementary graphic
   ───────────────────────────────────────────── */
function FloatingWireframe({ position, geometry, color, speed = 0.3, scale = 1 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed;
      ref.current.rotation.x = t * 0.7;
      ref.current.rotation.y = t;
      ref.current.rotation.z = t * 0.3;
      // Subtle float
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
    }
  });

  const wireGeo = useMemo(() => {
    return new THREE.WireframeGeometry(geometry);
  }, [geometry]);

  return (
    <lineSegments ref={ref} position={position} scale={scale}>
      <bufferGeometry attach="geometry" {...wireGeo} />
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* ─────────────────────────────────────────────
   Volumetric Light Shaft
   ───────────────────────────────────────────── */
function LightShaft({ position, rotation, color, height = 15, width = 0.5, opacity = 0.06 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Neon Lane Edge Strips
   ───────────────────────────────────────────── */
function NeonEdgeStrip({ xPos, color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xPos, -0.46, -10]}>
      <planeGeometry args={[0.04, 30]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   SceneContents — the full 3D scene (cyberpunk)
   ───────────────────────────────────────────── */
export function SceneContents({ scrollYProgress }) {
  const ballRef = React.useRef();
  const textRef = React.useRef();

  // Reusable geometries for wireframe shapes
  const icoGeo = useMemo(() => new THREE.IcosahedronGeometry(2, 1), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1.5, 8, 8), []);
  const torusGeo = useMemo(() => new THREE.TorusGeometry(1.8, 0.15, 8, 24), []);

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
      {/* ── Atmospheric Fog (deep brand purple haze) ── */}
      <fogExp2 attach="fog" color="#0a0020" density={0.035} />

      {/* ══════════════════════════════════════
          DRAMATIC LIGHTING RIG
          High contrast, sharp shadows, neon colors
          ══════════════════════════════════════ */}

      {/* Very low ambient — keeps deep shadows */}
      <ambientLight intensity={0.12} color="#1a0040" />

      {/* KEY LIGHT — dramatic overhead spotlight */}
      <spotLight
        position={[2, 16, 0]}
        intensity={6}
        castShadow
        penumbra={0.6}
        angle={0.4}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        color="#e8e0ff"
      />

      {/* FILL — magenta rim from behind pins */}
      <spotLight
        position={[0, 10, LANE_END - 5]}
        intensity={4}
        castShadow
        penumbra={0.8}
        angle={0.7}
        color="#df2a8f"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* ACCENT — blue spotlight from above-side */}
      <spotLight
        position={[-6, 12, -8]}
        intensity={3}
        castShadow
        penumbra={0.7}
        angle={0.5}
        color="#3781fe"
      />

      {/* ── Neon Point Lights along the lane ── */}
      <pointLight position={[-1.5, 0.5, 2]}    intensity={3} color="#3781fe" distance={8} decay={2} />
      <pointLight position={[1.5, 0.5, -3]}    intensity={3} color="#df2a8f" distance={8} decay={2} />
      <pointLight position={[-1.5, 0.5, -8]}   intensity={3} color="#3781fe" distance={8} decay={2} />
      <pointLight position={[1.5, 0.5, -13]}   intensity={3} color="#df2a8f" distance={8} decay={2} />
      <pointLight position={[0, 1.5, LANE_END]} intensity={4} color="#e7ff00" distance={6} decay={2} />
      {/* Under-ball glow */}
      <pointLight position={[0, -0.2, 0]}      intensity={2} color="#2b0059" distance={4} decay={2} />

      {/* ══════════════════════════════════════
          REFLECTIVE SURFACES
          Mirror-like floor, polished lane
          ══════════════════════════════════════ */}

      {/* ── Dark reflective floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -12]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshPhysicalMaterial
          color="#030008"
          metalness={0.95}
          roughness={0.05}
          reflectivity={1}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* ── Lane surface (polished reflective) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, -10]} receiveShadow>
        <planeGeometry args={[2.4, 30]} />
        <meshPhysicalMaterial
          color="#1a1408"
          roughness={0.1}
          metalness={0.85}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* ── Glowing Lane Path ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, -10]}>
        <planeGeometry args={[1.6, 30]} />
        <meshBasicMaterial
          color="#df2a8f"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Neon Edge Strips (bright lane borders) ── */}
      <NeonEdgeStrip xPos={-1.2} color="#3781fe" />
      <NeonEdgeStrip xPos={1.2} color="#3781fe" />

      {/* ══════════════════════════════════════
          ENVIRONMENTAL ELEMENTS
          Wireframes, particles, light shafts
          ══════════════════════════════════════ */}

      {/* Infinite fading grid — more visible */}
      <Grid
        position={[0, -0.5, 0]}
        args={[100, 100]}
        cellColor="#0a0825"
        sectionColor="#3781fe"
        sectionThickness={1.5}
        cellThickness={0.6}
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />

      {/* ── Dense Atmospheric Particles ── */}
      <Sparkles
        count={200}
        scale={[30, 15, 40]}
        position={[0, 5, -10]}
        color="#df2a8f"
        size={3}
        speed={0.3}
        opacity={0.25}
      />
      <Sparkles
        count={150}
        scale={[40, 20, 40]}
        position={[0, 3, -5]}
        color="#3781fe"
        size={2}
        speed={0.15}
        opacity={0.2}
      />
      <Sparkles
        count={80}
        scale={[20, 10, 30]}
        position={[0, 8, -15]}
        color="#e7ff00"
        size={1.5}
        speed={0.1}
        opacity={0.12}
      />

      {/* ── Floating Wireframe Shapes (brand complementary graphics) ── */}
      <FloatingWireframe
        position={[-8, 4, -15]}
        geometry={icoGeo}
        color="#3781fe"
        speed={0.2}
        scale={1.2}
      />
      <FloatingWireframe
        position={[10, 6, -22]}
        geometry={sphereGeo}
        color="#df2a8f"
        speed={0.15}
        scale={1.5}
      />
      <FloatingWireframe
        position={[-6, 8, -28]}
        geometry={torusGeo}
        color="#e7ff00"
        speed={0.25}
        scale={1}
      />

      {/* ── Volumetric Light Shafts (god rays) ── */}
      <LightShaft
        position={[-4, 5, -8]}
        rotation={[0, 0.3, 0.15]}
        color="#3781fe"
        height={18}
        width={1.2}
        opacity={0.04}
      />
      <LightShaft
        position={[5, 6, -14]}
        rotation={[0, -0.2, -0.1]}
        color="#df2a8f"
        height={20}
        width={1}
        opacity={0.035}
      />
      <LightShaft
        position={[0, 7, -20]}
        rotation={[0.1, 0, 0]}
        color="#2b0059"
        height={16}
        width={2}
        opacity={0.05}
      />

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

      {/* ── Bowling Ball (Mirror-like reflective sphere) ── */}
      <group ref={ballRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 64, 64]} />
          <meshPhysicalMaterial
            color="#1a0040"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            emissive="#2b0059"
            emissiveIntensity={0.15}
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: '#0a0020' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.1, 7.5], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <SceneContents scrollYProgress={scrollYProgress} />
      </Canvas>
    </div>
  );
}
