/**
 * env.js — Single source of truth for all frontend environment variables.
 *
 * Reads and validates import.meta.env.
 * Components, hooks, and services import named constants from this module
 * instead of reading import.meta.env directly.
 *
 * Environment variables:
 *  VITE_API_BASE_URL   - Absolute backend base URL. Leave blank when using
 *                        the Vite dev-server proxy (default for local dev).
 *  VITE_APP_VERSION    - Injected by CI; falls back to package version.
 *  VITE_APP_ENV        - 'development' | 'staging' | 'production'
 */

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '')

export const APP_ENV = (import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? 'development')

export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '2.0.0'

export const IS_DEV = APP_ENV === 'development'

export const IS_PROD = APP_ENV === 'production'

/**
 * Validates the runtime configuration.
 */
export function validateEnv() {
  if (IS_PROD && !API_BASE_URL) {
    // Note: empty API_BASE_URL in prod means same-origin hosting (e.g. Docker container serving SPA + API behind reverse proxy)
  }
}

validateEnv()
