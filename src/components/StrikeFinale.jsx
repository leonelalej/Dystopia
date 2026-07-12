import React, { useRef, useEffect } from 'react';
import BowlingScene from './BowlingScene';

/*
 * ═══════════════════════════════════════════════════════════
 * STRIKE FINALE — Hyper-Realistic 3D Bowling (Vanilla Three.js)
 * ═══════════════════════════════════════════════════════════
 *
 * Thin React wrapper that:
 * 1. Renders a raw <canvas> inside a sticky viewport
 * 2. On mount, instantiates BowlingScene (vanilla Three.js + GSAP)
 * 3. On unmount, calls dispose() to clean up WebGL + GSAP
 *
 * The GSAP ScrollTrigger inside BowlingScene handles all
 * scroll-driven animation (ball roll, pin scatter, camera, overlays).
 * No R3F. No Framer Motion.
 */

export default function StrikeFinale() {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const veilRef = useRef(null);
  const flashRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const scene = new BowlingScene(canvasContainerRef.current, {
      overlays: {
        veil: veilRef.current,
        flash: flashRef.current,
      },
      scrollContainer: containerRef.current,  // the 400vh .strike-finale-container
    });

    sceneRef.current = scene;

    scene.init().catch((err) => {
      console.error('[BowlingScene] Failed to initialize:', err);
    });

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} className="strike-finale-container">
      <div className="strike-sticky-viewport">

        {/* Background noise for consistency */}
        <div className="noise-overlay" />

        {/* ═══ 3D CANVAS (Vanilla Three.js) ═══ */}
        <div
          ref={canvasContainerRef}
          style={{ position: 'absolute', inset: 0 }}
        >
          <canvas
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Entry/exit veil — controlled by GSAP via BowlingScene.state */}
        <div
          ref={veilRef}
          className="tunnel-veil"
          style={{ opacity: 1, pointerEvents: 'none' }}
        />

        {/* ═══ IMPACT FLASH ═══ */}
        <div
          ref={flashRef}
          className="strike-flash"
          style={{ opacity: 0, pointerEvents: 'none' }}
        />

      </div>
    </div>
  );
}
