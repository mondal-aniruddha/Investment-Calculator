/**
 * config.js — Single source of truth for all environment variables.
 *
 * All import.meta.env.* accesses are centralised here.
 * Components, hooks, and services import named constants from this module
 * instead of reading import.meta.env directly.
 *
 * Rules:
 *  1. Never access import.meta.env.* outside this file.
 *  2. Provide sensible defaults so the app works in dev without a .env.local.
 *  3. Keep this file small — it is not a feature registry.
 *
 * Environment variables (configure in .env.local for local dev):
 *  VITE_API_BASE_URL   - Absolute backend base URL. Leave blank when using
 *                        the Vite dev-server proxy (default for local dev).
 *  VITE_APP_VERSION    - Injected by CI; falls back to package version.
 *  VITE_APP_ENV        - 'development' | 'staging' | 'production'
 */

/**
 * Absolute base URL of the Spring Boot API.
 * Empty string ⟹ Vite proxy handles /api/** → http://localhost:8080.
 * In production set VITE_API_BASE_URL=https://api.your-domain.com
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/**
 * Current app environment.
 * Vite sets import.meta.env.MODE automatically ('development' | 'production').
 * Override with VITE_APP_ENV for staging deployments.
 */
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? 'development'

/**
 * Application version string.
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '2.0.0'

/**
 * Whether the app is running in development mode.
 */
export const IS_DEV = APP_ENV === 'development'

/**
 * Whether the app is running in production mode.
 */
export const IS_PROD = APP_ENV === 'production'
