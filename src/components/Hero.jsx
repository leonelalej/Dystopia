import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* Horizontal light streaks instead of particles */
const STREAKS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  top: `${10 + Math.random() * 75}%`,
  width: `${60 + Math.random() * 120}px`,
  color: [
    'rgba(255,107,74,0.25)',
    'rgba(255,45,120,0.2)',
    'rgba(155,89,240,0.15)',
    'rgba(0,212,170,0.15)',
    'rgba(255,179,71,0.2)',
  ][i % 5],
  duration: `${10 + Math.random() * 15}s`,
  delay: `${Math.random() * 12}s`,
}));

/* Warm ambient particles */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  bottom: `${Math.random() * 25}%`,
  color: ['#ff6b4a', '#ff2d78', '#9b59f0', '#ffb347'][i % 4],
  duration: `${7 + Math.random() * 8}s`,
  delay: `${Math.random() * 6}s`,
  size: `${1 + Math.random() * 2}px`,
}));

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  /* Parallax transforms */
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const subtitleX = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      ref={ref}
      id="hero"
      className="gta-section relative"
      style={{ minHeight: '100vh' }}
    >
      {/* Animated sunset gradient background */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 pointer-events-none sunset-gradient-bg"
      />

      {/* Warm radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '20%', left: '30%',
            width: 700, height: 700,
            background: 'radial-gradient(circle, rgba(255,107,74,0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: '10%', right: '20%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(255,45,120,0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '50%', left: '60%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(155,89,240,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Light streaks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STREAKS.map((s) => (
          <div
            key={s.id}
            className="light-streak"
            style={{
              top: s.top,
              width: s.width,
              background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
              '--streak-duration': s.duration,
              '--streak-delay': s.delay,
            }}
          />
        ))}
      </div>

      {/* Floating warm particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              '--duration': p.duration,
              '--delay': p.delay,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Pulsating rings */}
      <div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full pointer-events-none"
        style={{
          border: '1px solid rgba(255,107,74,0.06)',
          animation: 'pulse-ring 5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[380px] h-[380px] md:w-[520px] md:h-[520px] rounded-full pointer-events-none"
        style={{
          border: '1px solid rgba(255,45,120,0.05)',
          animation: 'pulse-ring 6s 1.5s ease-in-out infinite',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Top accent label — slides in from the right */}
        <motion.p
          style={{ x: subtitleX, opacity: titleOpacity }}
          className="section-label mb-8 text-glow-coral"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          Welcome to the experience
        </motion.p>

        {/* Main title — massive condensed, slides from left */}
        <motion.h1
          style={{ y: titleY, opacity: titleOpacity }}
          className="gta-title"
          initial={{ opacity: 0, x: -120, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <span
            className="block text-transparent bg-clip-text"
            style={{
              fontSize: 'clamp(4rem, 14vw, 12rem)',
              backgroundImage: 'linear-gradient(180deg, #fff 0%, #ff6b4a 60%, #ff2d78 100%)',
              WebkitBackgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(255,107,74,0.3))',
            }}
          >
            DYSTOPIA
          </span>
          <motion.span
            className="block text-white/60 mt-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(0.9rem, 2.5vw, 1.6rem)',
              fontWeight: 300,
              letterSpacing: '0.5em',
            }}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            BOWLING & LOUNGE
          </motion.span>
        </motion.h1>

        {/* Cinematic divider */}
        <motion.div
          className="flex justify-center mt-10"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="cinematic-divider" style={{ maxWidth: '200px' }} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          style={{ opacity: titleOpacity }}
          className="font-body text-white/40 text-base sm:text-lg md:text-xl mt-8 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Strike into the abyss. Where every lane tells a story
          and every frame ignites the night.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          style={{ y: ctaY, opacity: titleOpacity }}
          className="mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <a href="#booking" className="gta-btn">
            <span>Reserve Your Lane</span>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — thin animated line */}
      <motion.div
        style={{ opacity: titleOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
      >
        <div
          className="w-[1px] h-16 overflow-hidden"
          style={{ background: 'rgba(255,107,74,0.15)' }}
        >
          <motion.div
            className="w-full"
            style={{
              height: '30%',
              background: 'linear-gradient(180deg, transparent, #ff6b4a, transparent)',
            }}
            animate={{ y: ['-100%', '300%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <motion.span
          className="text-[0.6rem] tracking-[4px] uppercase text-white/25 font-body"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Scroll
        </motion.span>
      </motion.div>

      {/* Bottom section fade */}
      <div className="section-fade-bottom" />
    </section>
  );
}
