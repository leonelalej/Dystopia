import React from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

/*
 * ═══════════════════════════════════════════════════════════
 * GLASSMORPHIC HEADER
 * ═══════════════════════════════════════════════════════════
 *
 * Starts fully transparent. After ~80px of scroll, gains a
 * glassmorphic backdrop-filter effect. Logo left, nav right.
 *
 * Uses a state-driven approach for the glass effect so we
 * can toggle a CSS class, avoiding MotionValue → CSS custom
 * property reactivity edge cases with calc().
 */

const NAV_ITEMS = [
  { label: 'Lanes', scrollTo: 0.12 },
  { label: 'Experience', scrollTo: 0.32 },
  { label: 'Menu', scrollTo: 0.58 },
  { label: 'Reserve', scrollTo: 0.73 },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <a
        href="#"
        className="header-logo"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        DYSTOPIA
      </a>

      <nav className="header-nav" role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#"
            className="header-nav-link"
            onClick={(e) => {
              e.preventDefault();
              const scrollScene = document.querySelector('.scroll-container');
              if (scrollScene) {
                const targetY = scrollScene.offsetTop + scrollScene.offsetHeight * item.scrollTo;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
              }
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
