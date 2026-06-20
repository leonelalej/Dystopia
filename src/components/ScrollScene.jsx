import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/*
 * ═══════════════════════════════════════════════════════════
 * SCROLL SCENE — The core scroll-driven parallax experience
 * ═══════════════════════════════════════════════════════════
 *
 * Layout: 500vh tall scroll container → sticky 100vh viewport.
 * The bowling ball is fixed in the viewport and moves horizontally
 * between left/right halves using useTransform (no "once: true").
 *
 * Scroll map:
 *   0.00 – 0.10  Hero (title centered, ball centered)
 *   0.10 – 0.12  Transition: hero out, ball → right
 *   0.12 – 0.33  Section 1: text LEFT, ball RIGHT    (cyan)
 *   0.33 – 0.37  Transition: s1 out, ball → left
 *   0.37 – 0.58  Section 2: ball LEFT, text RIGHT     (magenta)
 *   0.58 – 0.62  Transition: s2 out, ball → right
 *   0.62 – 0.83  Section 3: text LEFT, ball RIGHT     (purple)
 *   0.83 – 1.00  Transition: s3 out, ball → center
 *
 * Everything scrubs forward & backward with scrollYProgress.
 */

/* ---------- Section content ---------- */
const SECTIONS = [
  {
    label: 'THE LANES',
    title: 'WHERE BOWLING\nMEETS THE FUTURE',
    desc: 'Step into 12 UV-illuminated lanes. Premium sound systems. Cosmic lighting that reacts to every strike. Every frame is an event.',
    features: '12 LANES · UV LIGHTING · SURROUND SOUND',
    side: 'left',
    accent: 'cyan',
  },
  {
    label: 'THE MENU',
    title: 'COSMIC BITES &\nNEON COCKTAILS',
    desc: 'Fuel your game with chef-crafted bites and signature cocktails that glow. From Void Burgers to Electric Blues — taste the night.',
    features: 'FULL BAR · KITCHEN UNTIL 2AM · VIP SERVICE',
    side: 'right',
    accent: 'magenta',
  },
  {
    label: 'RESERVATIONS',
    title: 'CLAIM\nYOUR LANE',
    desc: 'Secure your spot in the neon underground. VIP packages available for groups of 6+. Walk in or book ahead.',
    features: null,
    cta: {
      text: 'RESERVE NOW',
      href: 'https://api.whatsapp.com/send?phone=584246201766&text=Welcome%20To%20Dystopia%20%F0%9F%8E%B3%F0%9F%AA%90',
    },
    side: 'left',
    accent: 'purple',
  },
];

export default function ScrollScene() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  /* ─── Ball offset (pixels from center) ─── */
  const rightX = typeof window !== 'undefined' ? window.innerWidth * 0.23 : 300;
  const leftX = -rightX;

  /* ═══ BALL TRANSFORMS ═══ */
  const ballX = useTransform(scrollYProgress,
    [0,    0.10, 0.14, 0.33, 0.37, 0.58, 0.62, 0.83, 0.92, 1.0],
    [0,    0,    rightX, rightX, leftX, leftX, rightX, rightX, 0, 0]
  );

  const ballRotate = useTransform(scrollYProgress, [0, 1], [0, 1800]);

  const ballScale = useTransform(scrollYProgress,
    [0,    0.04, 0.12, 0.83, 0.92, 1.0],
    [0.55, 1,    1,    1,    1,    0.55]
  );

  /* Subtle vertical bounce during transitions */
  const ballY = useTransform(scrollYProgress,
    [0, 0.10, 0.12, 0.14, 0.33, 0.35, 0.37, 0.58, 0.60, 0.62, 0.83, 0.85, 0.92],
    [0, 0,    -14,  0,    0,    -14,  0,    0,    -14,  0,    0,    -14,  0   ]
  );

  /* ═══ GLOW COLOR CROSS-FADE (3 layers) ═══ */
  const cyanOp = useTransform(scrollYProgress,
    [0, 0.05, 0.12, 0.30, 0.35],
    [0.6, 0.6, 1, 1, 0]
  );
  const magentaOp = useTransform(scrollYProgress,
    [0.30, 0.37, 0.40, 0.56, 0.60],
    [0, 0, 1, 1, 0]
  );
  const purpleOp = useTransform(scrollYProgress,
    [0.56, 0.62, 0.65, 0.83, 0.90],
    [0, 0, 1, 1, 0]
  );

  /* ═══ HERO (fades out aggressively on first scroll) ═══ */
  const heroOp    = useTransform(scrollYProgress, [0, 0.015, 0.045], [1, 0.8, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.015, 0.05], [1, 0.97, 0.88]);
  const heroY     = useTransform(scrollYProgress, [0, 0.05], [0, -80]);

  /* ═══ SECTION 1 ═══ */
  const s1Op = useTransform(scrollYProgress, [0.11, 0.16, 0.29, 0.34], [0, 1, 1, 0]);
  const s1X  = useTransform(scrollYProgress, [0.11, 0.20], [-70, 0]);
  const s1Y  = useTransform(scrollYProgress, [0.11, 0.18], [20, 0]);

  /* ═══ SECTION 2 ═══ */
  const s2Op = useTransform(scrollYProgress, [0.36, 0.41, 0.54, 0.59], [0, 1, 1, 0]);
  const s2X  = useTransform(scrollYProgress, [0.36, 0.45], [70, 0]);
  const s2Y  = useTransform(scrollYProgress, [0.36, 0.43], [20, 0]);

  /* ═══ SECTION 3 ═══ */
  const s3Op = useTransform(scrollYProgress, [0.61, 0.66, 0.79, 0.84], [0, 1, 1, 0]);
  const s3X  = useTransform(scrollYProgress, [0.61, 0.70], [-70, 0]);
  const s3Y  = useTransform(scrollYProgress, [0.61, 0.68], [20, 0]);

  /* ═══ Background grid parallax ═══ */
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  /* ═══ Center divider opacity ═══ */
  const dividerOp = useTransform(scrollYProgress,
    [0, 0.10, 0.14, 0.83, 0.90, 1.0],
    [0, 0,    1,    1,    0,    0]
  );

  /* ═══ Hero scroll indicator ═══ */
  const scrollHintOp = useTransform(scrollYProgress, [0, 0.04, 0.08], [1, 1, 0]);

  return (
    <div ref={containerRef} className="scroll-container" style={{ height: '500vh' }}>

      {/* Scroll progress bar */}
      <motion.div
        className="progress-bar"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ─── Sticky Viewport ─── */}
      <div className="sticky-viewport">

        {/* Subtle grid */}
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

        {/* ══════════ BOWLING BALL ══════════ */}
        <motion.div
          className="ball-container"
          style={{ x: ballX, y: ballY, scale: ballScale }}
        >
          <div className="ball-sphere-wrapper">
            {/* Glow layers (cross-faded per section) */}
            <motion.div className="ball-glow ball-glow--cyan"    style={{ opacity: cyanOp }} />
            <motion.div className="ball-glow ball-glow--magenta" style={{ opacity: magentaOp }} />
            <motion.div className="ball-glow ball-glow--purple"  style={{ opacity: purpleOp }} />

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
        <p className="section-label" style={{ color: accentColor(data.accent) }}>
          {data.label}
        </p>
        <div className={`section-divider section-divider--${data.accent}`} />
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

function accentColor(name) {
  const map = { cyan: '#00f3ff', magenta: '#ff007f', purple: '#b900ff' };
  return map[name] || '#00f3ff';
}
