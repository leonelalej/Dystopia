import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';

/* ── Custom SVG Icons ── */
export function InstagramIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

/* ── Shared Link Data ── */
export const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/dystopiabowling/?hl=es',
    icon: InstagramIcon,
    mod: 'social-link--instagram',
    color: '#ff007f',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@dystopiabowling?_t=8ozGFIy0ZHR&_r=1',
    icon: TikTokIcon,
    mod: 'social-link--tiktok',
    color: '#00f3ff',
  },
  {
    label: 'WhatsApp',
    href: 'https://api.whatsapp.com/send?phone=584246201766&text=Welcome%20To%20Dystopia%20%F0%9F%8E%B3%F0%9F%AA%90',
    icon: MessageCircle,
    mod: 'social-link--whatsapp',
    color: '#25D366',
  },
  {
    label: 'Location',
    href: 'https://maps.app.goo.gl/TUqM4pC6S1vXwYyCA',
    icon: MapPin,
    mod: 'social-link--maps',
    color: '#b900ff',
  },
];
