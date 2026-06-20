import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { CalendarDays, Clock, Users, Sparkles } from 'lucide-react';

const fadeSlideLeft = {
  hidden: { opacity: 0, x: -80, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] },
  }),
};

const fadeSlideRight = {
  hidden: { opacity: 0, x: 80, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] },
  }),
};

export default function BookingSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [40, -20]);

  const [form, setForm] = useState({ date: '', time: '', guests: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section
      ref={sectionRef}
      id="booking"
      className="gta-section relative"
    >
      {/* Top section fade */}
      <div className="section-fade-top" />

      {/* Background warm glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '30%', left: '40%',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(255,107,74,0.04) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '20%', right: '20%',
            width: 350, height: 350,
            background: 'radial-gradient(circle, rgba(155,89,240,0.04) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Section header — slides from left */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeSlideLeft}
        >
          <p className="section-label mb-5">Reservations</p>
          <h2
            className="gta-title text-transparent bg-clip-text"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              backgroundImage: 'linear-gradient(135deg, #ff6b4a, #fff, #ff2d78)',
              WebkitBackgroundClip: 'text',
            }}
          >
            Book Your Lane
          </h2>
          <div className="flex justify-center mt-6">
            <div className="cinematic-divider" style={{ maxWidth: '160px' }} />
          </div>
          <p className="text-white/35 mt-6 max-w-md mx-auto font-body text-base md:text-lg leading-relaxed">
            Secure your spot in the underground. Choose your date, time,
            and how many strikers are joining.
          </p>
        </motion.div>

        {/* Booking card — slides from right */}
        <motion.div style={{ y: cardY }} className="max-w-2xl mx-auto">
          <motion.div
            className="glass-card p-8 md:p-10"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeSlideRight}
            custom={1}
          >
            {/* Decorative corner accents */}
            <div
              className="absolute top-0 left-0 w-16 h-16 rounded-tl-2xl pointer-events-none"
              style={{ borderTop: '1px solid rgba(255,107,74,0.2)', borderLeft: '1px solid rgba(255,107,74,0.2)' }}
            />
            <div
              className="absolute bottom-0 right-0 w-16 h-16 rounded-br-2xl pointer-events-none"
              style={{ borderBottom: '1px solid rgba(255,45,120,0.2)', borderRight: '1px solid rgba(255,45,120,0.2)' }}
            />

            {/* Form grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* Date */}
              <motion.div variants={fadeUp} custom={2}>
                <label
                  className="flex items-center gap-2 text-xs tracking-widest uppercase mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif", color: 'rgba(255,107,74,0.7)' }}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="neon-input"
                />
              </motion.div>

              {/* Time */}
              <motion.div variants={fadeUp} custom={3}>
                <label
                  className="flex items-center gap-2 text-xs tracking-widest uppercase mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif", color: 'rgba(255,107,74,0.7)' }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Time
                </label>
                <select
                  id="booking-time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="neon-input appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select time</option>
                  {['4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </motion.div>

              {/* Guests */}
              <motion.div variants={fadeUp} custom={4}>
                <label
                  className="flex items-center gap-2 text-xs tracking-widest uppercase mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif", color: 'rgba(255,107,74,0.7)' }}
                >
                  <Users className="w-3.5 h-3.5" />
                  Guests
                </label>
                <select
                  id="booking-guests"
                  name="guests"
                  value={form.guests}
                  onChange={handleChange}
                  className="neon-input appearance-none cursor-pointer"
                >
                  <option value="" disabled>How many?</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Info row */}
            <motion.div
              variants={fadeUp}
              custom={5}
              className="flex items-center gap-2 text-sm mb-8"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: 'rgba(155,89,240,0.6)' }} />
              <span>VIP lanes available for groups of 6+</span>
            </motion.div>

            {/* Book button */}
            <motion.div variants={fadeUp} custom={6}>
              <button
                id="book-now-btn"
                className="gta-btn w-full justify-center"
                type="button"
              >
                <span>Book Now</span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom section fade */}
      <div className="section-fade-bottom" />
    </section>
  );
}
