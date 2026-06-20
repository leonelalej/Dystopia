import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { SceneContents } from './Scene3D';

/*
 * ═══════════════════════════════════════════════════════════
 * STRIKE FINALE — Neon Tunnel + Scroll-Driven Strike
 * ═══════════════════════════════════════════════════════════
 */

export default function StrikeFinale() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* ═══ VEIL (dims slightly at the end for text readability) ═══ */
  const veilOpacity = useTransform(
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
        
        {/* ═══ 3D SCENE ═══ */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Canvas
            camera={{ position: [0, 1.5, 5], fov: 60 }}
            gl={{ antialias: true }}
          >
            <SceneContents scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        {/* Black veil for fade in/out transitions */}
        <motion.div className="tunnel-veil" style={{ opacity: veilOpacity, pointerEvents: 'none' }} />

        {/* ═══ IMPACT FLASH ═══ */}
        <motion.div className="strike-flash" style={{ opacity: flashOpacity, pointerEvents: 'none' }} />

      </div>
    </div>
  );
}
