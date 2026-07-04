import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { SceneContents } from './Scene3D';

/*
 * ═══════════════════════════════════════════════════════════
 * STRIKE FINALE — Cinematic 3D Bowling Lane + Scroll Strike
 * ═══════════════════════════════════════════════════════════
 *
 * Coordinates with App's transition mask:
 * - Starts with a full veil (opacity 1) that fades out,
 *   revealing the 3D scene smoothly.
 * - Canvas uses shadows, fog, and intimate camera for
 *   premium visual quality.
 */

export default function StrikeFinale() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* ═══ ENTRY VEIL — starts opaque, fades out as user scrolls in ═══ */
  const veilOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.15],
    [1, 0.5, 0]
  );

  /* ═══ EXIT VEIL — dims slightly at the end for text readability ═══ */
  const exitVeilOpacity = useTransform(
    scrollYProgress,
    [0.75, 0.90],
    [0, 0.3]
  );

  /* ═══ IMPACT FLASH ═══ */
  const flashOpacity = useTransform(
    scrollYProgress,
    [0.54, 0.57, 0.62, 0.68],
    [0, 1, 0.5, 0]
  );

  return (
    <div ref={containerRef} className="strike-finale-container">
      <div className="strike-sticky-viewport">
        
        {/* Background noise for consistency */}
        <div className="noise-overlay" />

        {/* ═══ 3D SCENE ═══ */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Canvas
            shadows
            camera={{ position: [0, 1.1, 7.5], fov: 45 }}
            gl={{ antialias: true }}
          >
            <SceneContents scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        {/* Entry veil — seamless reveal from transition mask */}
        <motion.div
          className="tunnel-veil"
          style={{ opacity: veilOpacity, pointerEvents: 'none' }}
        />

        {/* Exit veil — subtle dim at end */}
        <motion.div
          className="tunnel-veil"
          style={{ opacity: exitVeilOpacity, pointerEvents: 'none' }}
        />

        {/* ═══ IMPACT FLASH ═══ */}
        <motion.div
          className="strike-flash"
          style={{ opacity: flashOpacity, pointerEvents: 'none' }}
        />

      </div>
    </div>
  );
}
