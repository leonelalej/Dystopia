import React from 'react';
import { motion } from 'framer-motion';
import { SOCIAL_LINKS } from './socialLinks';

/*
 * ═══════════════════════════════════════════════════════════
 * SOCIAL BAR — Fixed sidebar with clean dock transition
 * ═══════════════════════════════════════════════════════════
 *
 * Receives `isDocked` boolean from App. When false, the bar
 * is fixed on the right screen edge. When true, it slides
 * out and fades — the Footer's inline socials appear instead.
 *
 * Uses Framer Motion `animate` with a discrete boolean —
 * no continuous scroll mapping, no repeated animations.
 * One clean transition per direction change.
 */

export default function SocialBar({ isDocked = false }) {
  return (
    <motion.div
      className="social-bar"
      role="navigation"
      aria-label="Social links"
      animate={
        isDocked
          ? { opacity: 0, x: 30, pointerEvents: 'none' }
          : { opacity: 1, x: 0, pointerEvents: 'auto' }
      }
      transition={{
        duration: 0.45,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {SOCIAL_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            id={`social-${link.label.toLowerCase()}`}
            className={`social-link ${link.mod}`}
          >
            <Icon />
          </a>
        );
      })}
    </motion.div>
  );
}
