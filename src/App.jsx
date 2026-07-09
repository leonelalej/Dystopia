import React, { Suspense } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { motion } from 'framer-motion';
import Header from './components/Navbar';
import ScrollScene from './components/ScrollScene';
import Footer from './components/Footer';
import SocialBar from './components/SocialBar';

/* PERF: Lazy-load the entire 3D pipeline (Three.js + R3F + Drei)
 * so it's excluded from the critical render path.
 * The chunk only downloads when shouldRender3D flips to true (~20% scroll). */
const StrikeFinale = React.lazy(() => import('./components/StrikeFinale'));

/*
 * App — Root composition
 *
 * Centralizes:
 * 1. Social sidebar dock state (flips at 95% scroll)
 * 2. Transition mask for seamless 2D → 3D handoff
 *
 * The mask fades to full opacity as the ScrollScene ends
 * and fades out as the StrikeFinale 3D scene begins,
 * creating a smooth cinematic bridge between layers.
 */

export default function App() {
  const { scrollYProgress } = useScroll();
  const [isDocked, setIsDocked] = React.useState(false);
  const isDockedRef = React.useRef(false);

  const [shouldRender3D, setShouldRender3D] = React.useState(false);
  const shouldRender3DRef = React.useRef(false);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Mount the 3D scene only after the user starts scrolling down (past 20%)
    const next3D = v >= 0.2;
    if (next3D !== shouldRender3DRef.current) {
      shouldRender3DRef.current = next3D;
      setShouldRender3D(next3D);
    }

    const next = v >= 0.95;
    if (next !== isDockedRef.current) {
      isDockedRef.current = next;
      setIsDocked(next);
    }
  });

  /* ═══ 2D → 3D TRANSITION MASK ═══
   * ScrollScene is ~800vh, StrikeFinale is ~400vh, Footer ~200px
   * Total scrollable ≈ 1200vh. Boundary ≈ 0.65 of global progress.
   * Mask fades in at the end of ScrollScene, fades out at start of StrikeFinale.
   */
  const maskOpacity = useTransform(
    scrollYProgress,
    [0.65, 0.67, 0.69, 0.72],
    [0, 1, 1, 0]
  );

  return (
    <>
      <Header />
      <ScrollScene />

      {/* Cinematic transition mask — bridges 2D parallax → 3D canvas */}
      <motion.div
        className="transition-mask"
        style={{ opacity: maskOpacity }}
      />

      <Suspense fallback={null}>
        <StrikeFinale shouldRender={shouldRender3D} />
      </Suspense>
      <Footer isDocked={isDocked} />
      <SocialBar isDocked={isDocked} />
    </>
  );
}
