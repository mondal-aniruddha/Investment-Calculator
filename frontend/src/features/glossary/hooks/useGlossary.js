import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchGlossaryTerms, usingFallback } from '../api/glossaryApi'

/**
 * useGlossary — encapsulates all glossary loading state.
 *
 * Returns:
 *   terms       - loaded (or fallback) glossary terms
 *   loading     - true while fetching
 *   error       - always null (fetchGlossaryTerms never rejects; fallback always has data)
 *   isFallback  - true when built-in fallback data is in use instead of live API
 *   reload      - function to re-trigger the fetch
 *   categories  - derived ['ALL', ...sorted unique categories] from loaded terms
 */
export function useGlossary() {
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchGlossaryTerms()
      .then((data) => {
        setTerms(data || [])
        setIsFallback(usingFallback)
        setLoading(false)
      })
      .catch(() => {
        // fetchGlossaryTerms catches internally and always resolves,
        // but keep this branch for safety.
        setTerms([])
        setIsFallback(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => {
    const set = new Set()
    terms.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return ['ALL', ...Array.from(set).sort()]
  }, [terms])

  return { terms, loading, error: null, isFallback, reload: load, categories }
}

