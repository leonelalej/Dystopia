import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTransform } from 'framer-motion';
import { Grid, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/*
 * ═══════════════════════════════════════════════
 * Scene3D — Cyberpunk Bowling Lane (Re-Design + Perf)
 * ═══════════════════════════════════════════════
 *
 * OPTIMIZED:
 * - 1 single shadow-casting spotlight (low res) for perf.
 * - StandardMaterials replacing expensive PhysicalMaterials on environment.
 * - Instanced/Shared materials for all 10 pins.
 * - Programmatic Wood CanvasTexture for the lane.
 * - Disco lights (moving point lights) instead of expensive spot shadows.
 */

const LANE_END = -18;

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
   Bowling pin profile
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

// Reusable materials for pins to save huge amounts of memory & draw calls
const pinBodyMat = new THREE.MeshStandardMaterial({
  color: "#f0ece4",
  roughness: 0.25,
  metalness: 0.1,
});

const pinStripeMat = new THREE.MeshStandardMaterial({
  color: "#cc0020",
  emissive: "#ff0033",
  emissiveIntensity: 0.2,
  roughness: 0.3,
  metalness: 0.1,
});

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
      <mesh geometry={pinGeo} material={pinBodyMat} castShadow />
      <mesh position={[0, 0.36, 0]} material={pinStripeMat} castShadow>
        <cylinderGeometry args={[0.105, 0.115, 0.05, 32]} />
      </mesh>
      <mesh position={[0, 0.30, 0]} material={pinStripeMat} castShadow>
        <cylinderGeometry args={[0.125, 0.13, 0.05, 32]} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   Floating Wireframe Shape
   ───────────────────────────────────────────── */
function FloatingWireframe({ position, geometry, color, speed = 0.3, scale = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed;
      ref.current.rotation.x = t * 0.7;
      ref.current.rotation.y = t;
      ref.current.rotation.z = t * 0.3;
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
    }
  });
  const wireGeo = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);
  return (
    <lineSegments ref={ref} position={position} scale={scale}>
      <bufferGeometry attach="geometry" {...wireGeo} />
      <lineBasicMaterial color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

/* ─────────────────────────────────────────────
   Light Shaft
   ───────────────────────────────────────────── */
function LightShaft({ position, rotation, color, height = 15, width = 0.5, opacity = 0.06 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Neon Edge Strips
   ───────────────────────────────────────────── */
function NeonEdgeStrip({ xPos, color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xPos, -0.46, -10]}>
      <planeGeometry args={[0.05, 30]} />
      <meshBasicMaterial color={color} transparent opacity={0.75} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Moving Disco Lights (High perf, no shadows)
   ───────────────────────────────────────────── */
function MovingDiscoLights() {
  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if(ref1.current) {
      ref1.current.position.x = Math.sin(t * 2) * 2.5;
      ref1.current.position.z = -10 + Math.cos(t * 1.5) * 6;
    }
    if(ref2.current) {
      ref2.current.position.x = Math.cos(t * 1.8) * 2.5;
      ref2.current.position.z = -10 + Math.sin(t * 2.2) * 6;
    }
    if(ref3.current) {
      ref3.current.position.x = Math.sin(t * 2.5) * 2.5;
      ref3.current.position.z = -10 + Math.cos(t * 1.9) * 6;
    }
  });
  
  return (
    <group position={[0, 0.2, 0]}>
      <pointLight ref={ref1} color="#df2a8f" intensity={5} distance={6} decay={2} />
      <pointLight ref={ref2} color="#3781fe" intensity={5} distance={6} decay={2} />
      <pointLight ref={ref3} color="#e7ff00" intensity={5} distance={6} decay={2} />
    </group>
  );
}

/* ─────────────────────────────────────────────
   Programmatic Wood Texture Generator
   ───────────────────────────────────────────── */
function useWoodTexture() {
  const [texture, setTexture] = useState(null);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    
    // Base wood color (dark amber)
    ctx.fillStyle = "#1e1104";
    ctx.fillRect(0, 0, 512, 1024);
    
    // Draw lane planks
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0a0501";
    const planks = 39; // Traditional bowling lane has 39 boards
    for(let i=1; i<planks; i++) {
      const x = (512 / planks) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
      
      // Plank breaks
      for(let j=0; j<8; j++) {
        const y = Math.random() * 1024;
        ctx.beginPath();
        ctx.moveTo(x - (512/planks), y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 15);
    // Anisotropy for sharp distant viewing
    tex.anisotropy = 16;
    
    setTexture(tex);
  }, []);
  
  return texture;
}

/* ─────────────────────────────────────────────
   SceneContents
   ───────────────────────────────────────────── */
export function SceneContents({ scrollYProgress }) {
  const ballRef = React.useRef();
  const textRef = React.useRef();
  const woodTexture = useWoodTexture();

  // Geometries for wireframes
  const icoGeo = useMemo(() => new THREE.IcosahedronGeometry(2, 1), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1.5, 8, 8), []);
  const torusGeo = useMemo(() => new THREE.TorusGeometry(1.8, 0.15, 8, 24), []);
  const octGeo = useMemo(() => new THREE.OctahedronGeometry(1.8, 0), []);
  const dodGeo = useMemo(() => new THREE.DodecahedronGeometry(1.5, 0), []);
  const cylGeo = useMemo(() => new THREE.CylinderGeometry(1.2, 1.2, 3, 6), []);

  const ballY = useTransform(scrollYProgress, [0, 0.08], [4, 0]);
  const ballZ = useTransform(scrollYProgress, [0.08, 0.55, 0.75], [0, LANE_END, LANE_END - 3]);
  const ballRotX = useTransform(scrollYProgress, [0.08, 0.55], [0, -Math.PI * 20]);
  const textScale = useTransform(scrollYProgress, [0.54, 0.58, 0.70, 0.80], [0, 1.2, 1, 0]);

  useFrame(({ camera }) => {
    const bz = ballZ.get();
    const by = ballY.get();
    camera.position.z = bz + 4;
    camera.position.y = 1.0 + by * 0.2;
    camera.lookAt(0, 0.3, bz - 3);

    if (ballRef.current) {
      ballRef.current.position.y = by;
      ballRef.current.position.z = bz;
      ballRef.current.rotation.x = ballRotX.get();
    }
    if (textRef.current) {
      const s = textScale.get();
      textRef.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      <fogExp2 attach="fog" color="#0a0020" density={0.035} />

      {/* ── LIGHTING (Optimized: 1 Shadow Caster) ── */}
      <ambientLight intensity={0.15} color="#1a0040" />
      
      {/* MAIN KEY LIGHT - The only one casting shadows, low map size */}
      <spotLight
        position={[2, 12, -2]}
        intensity={6}
        castShadow
        penumbra={0.6}
        angle={0.5}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
        color="#e8e0ff"
      />

      {/* Fill & Accent lights - NO SHADOWS for performance */}
      <spotLight position={[0, 10, LANE_END - 5]} intensity={4} penumbra={0.8} angle={0.7} color="#df2a8f" />
      <spotLight position={[-6, 12, -8]} intensity={3} penumbra={0.7} angle={0.5} color="#3781fe" />
      <pointLight position={[0, 1.5, LANE_END]} intensity={4} color="#e7ff00" distance={6} decay={2} />
      <pointLight position={[0, -0.2, 0]} intensity={2} color="#2b0059" distance={4} decay={2} />

      {/* Moving Disco Lights */}
      <MovingDiscoLights />

      {/* ── REFLECTIVE SURFACES (Optimized to MeshStandardMaterial) ── */}
      {/* Dark floor - Lowered slightly to prevent z-fighting with the grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, -12]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#030008" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Bowling Lane with procedural wood texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, -10]} receiveShadow>
        <planeGeometry args={[2.4, 30]} />
        <meshStandardMaterial 
          map={woodTexture} 
          color="#aa8866"
          roughness={0.15} 
          metalness={0.3} 
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, -10]}>
        <planeGeometry args={[1.6, 30]} />
        <meshBasicMaterial color="#df2a8f" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>

      <NeonEdgeStrip xPos={-1.2} color="#3781fe" />
      <NeonEdgeStrip xPos={1.2} color="#3781fe" />

      {/* ── ENVIRONMENTAL ELEMENTS ── */}
      {/* Grid raised slightly to prevent z-fighting with the floor */}
      <Grid position={[0, -0.49, 0]} args={[100, 100]} cellColor="#0e0a30" sectionColor="#3781fe" sectionThickness={2} cellThickness={0.7} fadeDistance={55} fadeStrength={1} infiniteGrid />

      {/* Reduced particles for performance */}
      <Sparkles count={100} scale={[30, 15, 40]} position={[0, 5, -10]} color="#df2a8f" size={3} speed={0.3} opacity={0.25} />
      <Sparkles count={80} scale={[40, 20, 40]} position={[0, 3, -5]} color="#3781fe" size={2} speed={0.15} opacity={0.2} />

      {/* ── Expanded Floating Wireframes ── 
          Lowered Y positions and spread out Z and X so they are clearly visible */}
      <FloatingWireframe position={[-6, 1.5, -8]} geometry={icoGeo} color="#3781fe" speed={0.2} scale={1.2} />
      <FloatingWireframe position={[7, 2, -15]} geometry={sphereGeo} color="#df2a8f" speed={0.15} scale={1.5} />
      <FloatingWireframe position={[-8, 2.5, -22]} geometry={torusGeo} color="#e7ff00" speed={0.25} scale={1} />
      {/* New Wireframes */}
      <FloatingWireframe position={[5, 1, -5]} geometry={octGeo} color="#3781fe" speed={0.3} scale={0.8} />
      <FloatingWireframe position={[-7, 3, -28]} geometry={dodGeo} color="#df2a8f" speed={0.1} scale={1.1} />
      <FloatingWireframe position={[9, 1.5, -35]} geometry={cylGeo} color="#e7ff00" speed={0.2} scale={1.3} />

      {/* Distant Horizon */}
      <mesh position={[0, -0.3, -40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 0.1]} />
        <meshBasicMaterial color="#3781fe" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -0.3, -45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 0.06]} />
        <meshBasicMaterial color="#df2a8f" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      <LightShaft position={[-4, 5, -8]} rotation={[0, 0.3, 0.15]} color="#3781fe" height={18} width={1.2} opacity={0.04} />
      <LightShaft position={[5, 6, -14]} rotation={[0, -0.2, -0.1]} color="#df2a8f" height={20} width={1} opacity={0.035} />
      <LightShaft position={[0, 7, -20]} rotation={[0.1, 0, 0]} color="#2b0059" height={16} width={2} opacity={0.05} />

      {PIN_POSITIONS.map((pin, i) => (
        <Pin key={pin.id} startX={pin.x} startZ={pin.z} scatter={SCATTER_DIRS[i]} scrollYProgress={scrollYProgress} />
      ))}

      {/* Bowling Ball - remains Physical for top quality reflections */}
      <group ref={ballRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 64, 64]} />
          <meshPhysicalMaterial color="#1a0040" metalness={0.95} roughness={0.05} clearcoat={1} clearcoatRoughness={0.05} reflectivity={1} emissive="#2b0059" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, -0.08, 0.36]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
        <mesh position={[0.15, 0.15, 0.32]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
        <mesh position={[-0.15, 0.15, 0.32]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
      </group>

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
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.1, 7.5], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={null}>
          <SceneContents scrollYProgress={scrollYProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
