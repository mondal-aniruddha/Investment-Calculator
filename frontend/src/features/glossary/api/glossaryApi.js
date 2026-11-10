import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'
import { GLOSSARY_FALLBACK } from '../data/glossaryFallback'

let cachedTerms = null
let fetchPromise = null

/**
 * Whether the last successful resolution used the built-in fallback
 * rather than live API data. Read this after fetchGlossaryTerms() resolves.
 */
export let usingFallback = false

// Offline fallback terms — re-exported from the canonical data file so that
// any existing code that imports FALLBACK_GLOSSARY keeps working.
export const FALLBACK_GLOSSARY = GLOSSARY_FALLBACK

export async function fetchGlossaryTerms() {
  if (cachedTerms) return cachedTerms
  if (fetchPromise) return fetchPromise

  fetchPromise = request(ENDPOINTS.GLOSSARY.TERMS)
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        cachedTerms = data
        usingFallback = false
      } else {
        cachedTerms = GLOSSARY_FALLBACK
        usingFallback = true
      }
      return cachedTerms
    })
    .catch(() => {
      cachedTerms = GLOSSARY_FALLBACK
      usingFallback = true
      return cachedTerms
    })
    .finally(() => {
      fetchPromise = null
    })

  return fetchPromise
}

export function getCachedTerm(termName) {
  if (!cachedTerms) return null
  const clean = termName.toLowerCase().trim()
  return cachedTerms.find((t) => t.term.toLowerCase() === clean) || null
}

/**
 * Reset module-level cache (for use in tests only).
 * @internal
 */
export function _resetCache() {
  cachedTerms = null
  fetchPromise = null
  usingFallback = false
}
