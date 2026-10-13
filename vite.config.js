import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Root vite.config.js — delegates to the frontend/ sub-project.
 *
 * Netlify builds directly from the `frontend/` directory (see netlify.toml).
 * For local development, CI builds, and Playwright E2E tests we must serve
 * the same app.  Setting `root` to `./frontend` tells Vite to use
 * frontend/index.html as the entry point and frontend/src/ as the source.
 * The outDir is resolved relative to the project root so `dist/` ends up at
 * the workspace root — matching the existing `npm run preview` command.
 */
export default defineConfig({
  root: './frontend',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080',
    },
  },
  build: {
    // Keep dist/ at the repo root so `npm run preview` finds it without changes
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080',
    },
  },
})
