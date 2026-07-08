import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/*
 * ═══════════════════════════════════════════════════════════
 * SCROLL SCENE — 4-Section Alternating Parallax with Inertia
 * ═══════════════════════════════════════════════════════════
 *
 * Layout: 800vh tall scroll container → sticky 100vh viewport.
 * The bowling ball is fixed in the viewport and weaves horizontally
 * between left/right halves using useSpring for luxurious inertia.
 *
 * Sections (alternating zig-zag grid):
 *   1. THE LANES       → text LEFT,  ball RIGHT   (#3781fe)
 *   2. THE EXPERIENCE  → text RIGHT, ball LEFT    (#df2a8f)
 *   3. GASTRONOMY      → text LEFT,  ball RIGHT   (#e7ff00)
 *   4. RESERVATIONS    → text RIGHT, ball LEFT    (#3781fe)
 *
 * Ball weaving (via smoothProgress):
 *   0.00 → 0.25   center → right
 *   0.25 → 0.50   right  → left
 *   0.50 → 0.75   left   → right
 *   0.75 → 0.90   right  → center
 */

/* ---------- Section content (BookingSection + MenuSection integrated) ---------- */
const SECTIONS = [
  {
    label: 'THE LANES',
    title: 'WHERE BOWLING\nMEETS THE FUTURE',
    desc: 'Step into 12 UV-illuminated lanes with premium sound systems and cosmic lighting that reacts to every strike. Every frame is an event.',
    features: '12 LANES · UV LIGHTING · SURROUND SOUND',
    side: 'left',
    accent: '#3781fe',
    accentName: 'blue',
  },
  {
    label: 'THE EXPERIENCE',
    title: 'STRIKE INTO\nTHE ABYSS',
    desc: 'Premium bowling redefined. Individual lanes, group packages, and VIP experiences that transform every frame into a cinematic moment.',
    features: 'INDIVIDUAL · GROUPS · VIP PACKAGES',
    side: 'right',
    accent: '#df2a8f',
    accentName: 'magenta',
  },
  {
    label: 'GASTRONOMY',
    title: 'COSMIC BITES &\nSIGNATURE DRINKS',
    desc: 'Fuel your game with chef-crafted bites and signature cocktails. From gourmet burgers to artisan drinks — taste the atmosphere.',
    features: 'FULL BAR · KITCHEN UNTIL 2AM · VIP SERVICE',
    side: 'left',
    accent: '#e7ff00',
    accentName: 'yellow',
  },
  {
    label: 'RESERVATIONS',
    title: 'CLAIM\nYOUR LANE',
    desc: 'Secure your spot in the underground. VIP packages available for groups of 6+. Walk in or book ahead — the night awaits.',
    features: null,
    cta: {
      text: 'RESERVE NOW',
      href: 'https://api.whatsapp.com/send?phone=584246201766&text=Welcome%20To%20Dystopia%20%F0%9F%8E%B3%F0%9F%AA%90',
    },
    side: 'right',
    accent: '#3781fe',
    accentName: 'blue',
  },
];

export default function ScrollScene() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  /* ═══ LUXURIOUS INERTIA (replaces GSAP scrub: 2.5) ═══ */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 22,
    restDelta: 0.001,
  });

  /* ─── Ball offset (pixels from center) ─── */
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const rightX = typeof window !== 'undefined'
    ? (isMobile ? window.innerWidth * 0.38 : window.innerWidth * 0.25)
    : 400;
  const leftX = -rightX;

  /* ═══ BALL TRANSFORMS (weaving between sections) ═══ */
  const ballX = useTransform(smoothProgress,
    [0, 0.14, 0.38, 0.62, 0.84, 0.94],
    [0, rightX, leftX, rightX, leftX, 0]
  );

  const ballRotate = useTransform(smoothProgress, [0, 1], [0, 720]);

  const maxScale = isMobile ? 0.6 : 1;
  const minScale = isMobile ? 0.35 : 0.55;

  const ballScale = useTransform(smoothProgress,
    [0, 0.04, 0.10, 0.85, 0.92, 1.0],
    [minScale, maxScale, maxScale, maxScale, maxScale, minScale]
  );

  /* Subtle vertical bounce during transitions */
  const ballY = useTransform(smoothProgress,
    [0, 0.06, 0.08, 0.10, 0.24, 0.26, 0.28, 0.48, 0.50, 0.52, 0.72, 0.74, 0.76, 0.90, 0.92],
    [0, 0,    -14,  0,    0,    -14,  0,    0,    -14,  0,    0,    -14,  0,    0,    0   ]
  );

  /* ═══ GLOW COLOR CROSS-FADE (3 layers for 4 sections) ═══ */
  const blueOp = useTransform(smoothProgress,
    [0, 0.05, 0.08, 0.20, 0.26, 0.74, 0.78, 0.86, 0.92],
    [0.3, 0.3, 1,   1,    0,    0,    1,    1,    0]
  );
  const magentaOp = useTransform(smoothProgress,
    [0.24, 0.30, 0.44, 0.50],
    [0, 1, 1, 0]
  );
  const yellowOp = useTransform(smoothProgress,
    [0.48, 0.54, 0.68, 0.74],
    [0, 1, 1, 0]
  );

  /* ═══ HERO (fades out on first scroll) ═══ */
  const heroOp    = useTransform(smoothProgress, [0, 0.015, 0.04], [1, 0.8, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.015, 0.04], [1, 0.97, 0.88]);
  const heroY     = useTransform(smoothProgress, [0, 0.04], [0, -80]);

  /* ═══ BALL APPEARANCE ═══ */
  const ballOpacity = useTransform(smoothProgress, [0, 0.02, 0.06], [0, 0, 1]);

  /* ═══ SECTION 1 — The Lanes (text left) ═══ */
  const s1Op = useTransform(smoothProgress, [0.06, 0.10, 0.20, 0.24], [0, 1, 1, 0]);
  const s1X  = useTransform(smoothProgress, [0.06, 0.14], [-70, 0]);
  const s1Y  = useTransform(smoothProgress, [0.06, 0.12], [20, 0]);

  /* ═══ SECTION 2 — The Experience (text right) ═══ */
  const s2Op = useTransform(smoothProgress, [0.28, 0.32, 0.44, 0.48], [0, 1, 1, 0]);
  const s2X  = useTransform(smoothProgress, [0.28, 0.36], [70, 0]);
  const s2Y  = useTransform(smoothProgress, [0.28, 0.34], [20, 0]);

  /* ═══ SECTION 3 — Gastronomy (text left) ═══ */
  const s3Op = useTransform(smoothProgress, [0.52, 0.56, 0.68, 0.72], [0, 1, 1, 0]);
  const s3X  = useTransform(smoothProgress, [0.52, 0.60], [-70, 0]);
  const s3Y  = useTransform(smoothProgress, [0.52, 0.58], [20, 0]);

  /* ═══ SECTION 4 — Reservations (text right) ═══ */
  const s4Op = useTransform(smoothProgress, [0.76, 0.80, 0.86, 0.90], [0, 1, 1, 0]);
  const s4X  = useTransform(smoothProgress, [0.76, 0.84], [70, 0]);
  const s4Y  = useTransform(smoothProgress, [0.76, 0.82], [20, 0]);

  /* ═══ Background grid parallax ═══ */
  const gridY = useTransform(smoothProgress, [0, 1], [0, -250]);

  /* ═══ Center divider opacity ═══ */
  const dividerOp = useTransform(smoothProgress,
    [0, 0.06, 0.10, 0.86, 0.92, 1.0],
    [0, 0,    1,    1,    0,    0]
  );

  /* ═══ Hero scroll indicator ═══ */
  const scrollHintOp = useTransform(smoothProgress, [0, 0.03, 0.06], [1, 1, 0]);

  return (
    <div ref={containerRef} className="scroll-container" style={{ height: '800vh' }}>

      {/* Scroll progress bar */}
      <motion.div
        className="progress-bar"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ─── Sticky Viewport ─── */}
      <div className="sticky-viewport">

        {/* Subtle grid and new ambient layers */}
        <div className="noise-overlay" />
        <div className="ambient-glow" />
        <motion.div className="bg-grid" style={{ y: gridY }} />

        {/* Center divider */}
        <motion.div className="center-line" style={{ opacity: dividerOp }} />

        {/* Vignette */}
        <div className="vignette" />

        {/* ══════════ HERO ══════════ */}
        <motion.div
          className="hero-content"
          style={{ opacity: heroOp, scale: heroScale, y: heroY }}
        >
          <h1 className="hero-title">DYSTOPIA</h1>
          <p className="hero-subtitle">Bowling & Lounge</p>

          <motion.div className="hero-scroll-hint" style={{ opacity: scrollHintOp }}>
            <div className="hero-scroll-line">
              <motion.div
                className="hero-scroll-dot"
                animate={{ y: ['-100%', '300%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <span className="hero-scroll-text">Scroll</span>
          </motion.div>
        </motion.div>

        {/* ══════════ SECTION TEXTS ══════════ */}
        <SectionPanel
          data={SECTIONS[0]}
          opacity={s1Op}
          slideX={s1X}
          slideY={s1Y}
        />
        <SectionPanel
          data={SECTIONS[1]}
          opacity={s2Op}
          slideX={s2X}
          slideY={s2Y}
        />
        <SectionPanel
          data={SECTIONS[2]}
          opacity={s3Op}
          slideX={s3X}
          slideY={s3Y}
        />
        <SectionPanel
          data={SECTIONS[3]}
          opacity={s4Op}
          slideX={s4X}
          slideY={s4Y}
        />

        {/* ══════════ BOWLING BALL ══════════ */}
        <motion.div
          className="ball-container"
          style={{ x: ballX, y: ballY, scale: ballScale, opacity: ballOpacity }}
        >
          <div className="ball-sphere-wrapper">
            {/* Glow layers (cross-faded per section) */}
            <motion.div className="ball-glow ball-glow--blue"    style={{ opacity: blueOp }} />
            <motion.div className="ball-glow ball-glow--magenta" style={{ opacity: magentaOp }} />
            <motion.div className="ball-glow ball-glow--yellow"  style={{ opacity: yellowOp }} />

            {/* Rotating sphere */}
            <motion.div className="ball-sphere" style={{ rotate: ballRotate }}>
              <div className="ball-hole ball-hole--1" />
              <div className="ball-hole ball-hole--2" />
              <div className="ball-hole ball-hole--3" />
            </motion.div>

            {/* Fixed specular highlights (don't rotate) */}
            <div className="ball-highlight" />
            <div className="ball-reflection" />

            {/* Ground shadow */}
            <div className="ball-ground-shadow" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Section Panel — reusable text panel
   ──────────────────────────────────────────── */
function SectionPanel({ data, opacity, slideX, slideY }) {
  const sideClass = data.side === 'left' ? 'section-text--left' : 'section-text--right';

  return (
    <motion.div
      className={`section-text ${sideClass}`}
      style={{ opacity, x: slideX, y: slideY }}
    >
      <div className="section-inner">
        <p className="section-label" style={{ color: data.accent }}>
          {data.label}
        </p>
        <div className={`section-divider section-divider--${data.accentName}`} />
        <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>
          {data.title}
        </h2>
        <p className="section-description">{data.desc}</p>
        {data.features && (
          <p className="section-features">{data.features}</p>
        )}
        {data.cta && (
          <a
            href={data.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
          >
            {data.cta.text}
          </a>
        )}
      </div>
    </motion.div>
  );
}
