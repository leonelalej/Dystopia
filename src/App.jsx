import React from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import Header from './components/Navbar';
import ScrollScene from './components/ScrollScene';
import StrikeFinale from './components/StrikeFinale';
import Footer from './components/Footer';
import SocialBar from './components/SocialBar';

/*
 * App — Root composition
 *
 * Centralizes the social sidebar dock state. A single
 * useMotionValueEvent listener on global scrollYProgress
 * flips `isDocked` at the 95% threshold. Both SocialBar
 * and Footer receive the same boolean — no duplicated
 * scroll listeners, no continuous useTransform mapping.
 */

export default function App() {
  const { scrollYProgress } = useScroll();
  const [isDocked, setIsDocked] = React.useState(false);
  const isDockedRef = React.useRef(false);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = v >= 0.95;
    if (next !== isDockedRef.current) {
      isDockedRef.current = next;
      setIsDocked(next);
    }
  });

  return (
    <>
      <Header />
      <ScrollScene />
      <StrikeFinale />
      <Footer isDocked={isDocked} />
      <SocialBar isDocked={isDocked} />
    </>
  );
}
