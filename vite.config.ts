import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    // Target modern browsers — removes unused polyfills
    target: 'es2017',
    chunkSizeWarningLimit: 400,
    // Terser for better dead-code elimination
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Remove all console.* calls in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,               // 2 passes = more aggressive tree-shaking
      },
    },
    cssCodeSplit: true,          // Split CSS per-route — faster first paint
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false, // Aggressive tree-shaking
        preset: 'recommended',
      },
      output: {
        // Split vendor libs — browser caches them separately
        manualChunks(id) {
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor';
          }
          if (id.includes('motion') || id.includes('framer')) {
            return 'motion-vendor';
          }
        },
      },
    },
  },
});