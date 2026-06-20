import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { UtensilsCrossed, Wine, IceCream, Flame, ArrowRight } from 'lucide-react';

/* Staggered alternating slide-in */
const fadeSlide = (fromRight) => ({
  hidden: {
    opacity: 0,
    x: fromRight ? 80 : -80,
    filter: 'blur(6px)',
  },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] },
  }),
});

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] },
  }),
};

const MENU_CATEGORIES = [
  {
    icon: Flame,
    title: 'Starters',
    items: ['Neon Nachos', 'Cyber Wings', 'Plasma Fries'],
    accent: '#ff6b4a',
    glow: 'rgba(255, 107, 74, 0.1)',
  },
  {
    icon: UtensilsCrossed,
    title: 'Mains',
    items: ['Void Burger', 'Laser Pizza', 'Quantum Bowl'],
    accent: '#00d4aa',
    glow: 'rgba(0, 212, 170, 0.1)',
  },
  {
    icon: Wine,
    title: 'Cocktails',
    items: ['Electric Blue', 'Neon Sunset', 'Dark Matter'],
    accent: '#9b59f0',
    glow: 'rgba(155, 89, 240, 0.1)',
  },
  {
    icon: IceCream,
    title: 'Desserts',
    items: ['Glitch Shake', 'Binary Brownie', 'Pixel Sundae'],
    accent: '#ffb347',
    glow: 'rgba(255, 179, 71, 0.1)',
  },
];

export default function MenuSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const gridY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      ref={sectionRef}
      id="menu"
      className="gta-section relative"
    >
      {/* Top section fade */}
      <div className="section-fade-top" />

      {/* Background warm glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '25%', right: '30%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(255,45,120,0.04) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: '25%', left: '20%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(155,89,240,0.04) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section header — slides from right */}
        <motion.div
          ref={headerRef}
          className="text-center mb-20"
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={fadeSlide(true)}
        >
          <p className="section-label mb-5">Food & Drinks</p>
          <h2
            className="gta-title text-transparent bg-clip-text"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              backgroundImage: 'linear-gradient(135deg, #ff2d78, #fff, #9b59f0)',
              WebkitBackgroundClip: 'text',
            }}
          >
            The Menu
          </h2>
          <div className="flex justify-center mt-6">
            <div className="cinematic-divider" style={{ maxWidth: '160px' }} />
          </div>
          <p className="text-white/35 mt-6 max-w-lg mx-auto font-body text-base md:text-lg leading-relaxed">
            Fuel your game with cinema-inspired bites and signature cocktails.
          </p>
        </motion.div>

        {/* Menu grid — cards slide from alternating sides */}
        <motion.div
          style={{ y: gridY }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {MENU_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <MenuCard
                key={cat.title}
                icon={<Icon className="w-6 h-6" style={{ color: cat.accent }} />}
                title={cat.title}
                items={cat.items}
                accent={cat.accent}
                glow={cat.glow}
                index={i}
                fromRight={i % 2 === 1}
                parentInView={headerInView}
              />
            );
          })}
        </motion.div>

        {/* Featured Banner */}
        <motion.div
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={6}
        >
          <div className="relative glass-card overflow-hidden">
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,74,0.08), transparent, rgba(155,89,240,0.06))',
              }}
            />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="section-label mb-3" style={{ color: '#ffb347' }}>
                  Chef's Special
                </p>
                <h3
                  className="gta-title text-white mb-3"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
                >
                  The Dystopia Experience
                </h3>
                <p className="text-white/35 max-w-md font-body">
                  A curated tasting menu with 5 courses paired with signature
                  cocktails. Available for groups of 4+.
                </p>
              </div>
              <a href="#booking" className="gta-btn shrink-0">
                <span className="flex items-center gap-2">
                  View Menu <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom section fade */}
      <div className="section-fade-bottom" />
    </section>
  );
}

function MenuCard({ icon, title, items, accent, glow, index, fromRight, parentInView }) {
  const cardRef = useRef(null);

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={parentInView ? 'visible' : 'hidden'}
      variants={fadeSlide(fromRight)}
      custom={index + 1}
      className="glass-card menu-card-glow p-6 relative group cursor-pointer"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
        }}
      />

      {/* Icon circle */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: glow,
          border: `1px solid ${accent}20`,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className="text-sm tracking-widest uppercase mb-4"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          color: accent,
        }}
      >
        {title}
      </h3>

      {/* Items */}
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm font-body flex items-center gap-2 transition-colors duration-300"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
            />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
