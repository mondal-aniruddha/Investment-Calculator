import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * vite.config.js — Phase 6: environment-aware configuration.
 *
 * Backend proxy target is read from VITE_BACKEND_URL environment variable
 * (or process.env.VITE_BACKEND_URL for scripts that set it pre-build).
 * Falls back to http://localhost:8080 for local development.
 *
 * To use a remote backend in dev:
 *   VITE_BACKEND_URL=https://api.example.com npm run dev
 */
export default defineConfig(({ mode }) => {
  // Load .env files for the current mode so we can use vars in config itself
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': backendUrl,
        '/actuator': backendUrl,
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            i18n: ['i18next', 'react-i18next'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': backendUrl,
        '/actuator': backendUrl,
      },
    },
    test: {
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },
  }
})
