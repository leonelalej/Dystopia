import React from 'react';
import { motion } from 'framer-motion';
import { SOCIAL_LINKS } from './socialLinks';

/*
 * ═══════════════════════════════════════════════════════════
 * FOOTER — Neon-cyberpunk footer with social dock target
 * ═══════════════════════════════════════════════════════════
 *
 * Receives `isDocked` boolean from App. When true, the
 * footer's social links animate in (the sidebar has animated
 * out). Clean one-time transition, no flickering.
 */

export default function Footer({ isDocked = false }) {
  return (
    <footer className="site-footer" id="footer">
      {/* Top border glow */}
      <div className="footer-border-glow" />

      {/* Background radial glow */}
      <div className="footer-bg-glow" />

      <div className="footer-content">
        {/* Brand */}
        <div className="footer-brand">
          <h2 className="footer-brand-name">DYSTOPIA</h2>
          <p className="footer-brand-sub">Bowling & Lounge</p>
        </div>

        {/* Social links dock — appears when sidebar hides */}
        <motion.div
          className="footer-socials"
          animate={
            isDocked
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 16 }
          }
          transition={{
            duration: 0.45,
            ease: [0.23, 1, 0.32, 1],
            /* Slight delay so footer socials appear AFTER sidebar is gone */
            delay: isDocked ? 0.1 : 0,
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
                className={`footer-social-link ${link.mod}`}
              >
                <Icon />
              </a>
            );
          })}
        </motion.div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Dystopia Bowling & Lounge. All rights reserved.
          </p>
          <p className="footer-tagline">
            Designed for the future. Built in the void.
          </p>
        </div>
      </div>
    </footer>
  );
}
