import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    open: true,
    allowedHosts: true
  },
  preview: {
    allowedHosts: true
  },
  /* PERF: Pre-bundle heavy Three.js ecosystem modules during
   * dev server startup instead of on-demand lazy discovery.
   * Eliminates the cascade of 2700+ module requests. */
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'react-reconciler',
      'gsap',
    ],
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three') || id.includes('react-reconciler')) {
              return 'threejs';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
