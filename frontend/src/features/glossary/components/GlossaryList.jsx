import { useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GlossaryTermCard } from './GlossaryTermCard'
import {
  sortTerms,
  groupTermsByLetter,
  getJumpBarLetters,
  filterTerms,
} from '../utils/glossaryUtils'

/**
 * GlossaryList — full alphabetical glossary with A–Z jump bar, fallback notice,
 * result count, letter headings and optional deep-link highlighting.
 *
 * @param {{
 *   terms: object[],
 *   isFallback?: boolean,
 *   selectedCategory?: string,
 *   query?: string,
 *   highlightTerm?: string,
 * }} props
 */
export function GlossaryList({
  terms,
  isFallback = false,
  selectedCategory = 'ALL',
  query = '',
  highlightTerm = '',
}) {
  const { t } = useTranslation()
  const highlightRef = useRef(null)

  // Detect reduced-motion preference once on mount.
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const filtered = useMemo(
    () => filterTerms(terms, selectedCategory, query),
    [terms, selectedCategory, query]
  )
  const sorted = useMemo(() => sortTerms(filtered), [filtered])
  const groups = useMemo(() => groupTermsByLetter(sorted), [sorted])
  const letters = useMemo(() => getJumpBarLetters(groups), [groups])

  // Scroll to + focus the highlighted term card on mount / when highlightTerm changes.
  useEffect(() => {
    if (!highlightTerm || !highlightRef.current) return
    const el = highlightRef.current
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'center',
    })
    el.focus()
  }, [highlightTerm, prefersReducedMotion])

  const total = terms.length
  const shown = filtered.length

  return (
    <div className="glossary-list-wrapper">
      {/* Subtle fallback notice — shown instead of an error card */}
      {isFallback && (
        <div className="glossary-fallback-notice" role="status" aria-live="polite">
          <span aria-hidden="true">📡</span>{' '}
          {t(
            'glossary.fallbackNotice',
            "Showing the built-in glossary because the live server can't be reached."
          )}
        </div>
      )}

      {/* Result count */}
      <p className="glossary-result-count" aria-live="polite">
        {t('glossary.resultCount', 'Showing {{shown}} of {{total}} terms', { shown, total })}
      </p>

      {/* A–Z Jump Bar — only rendered when there is more than one letter group */}
      {letters.length > 1 && (
        <nav
          className="glossary-jump-bar"
          aria-label={t('glossary.jumpBarLabel', 'Jump to letter')}
        >
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#glossary-letter-${letter}`}
              className="glossary-jump-btn"
              aria-label={t('glossary.jumpToLetter', 'Jump to {{letter}}', { letter })}
            >
              {letter}
            </a>
          ))}
        </nav>
      )}

      {/* Empty state */}
      {sorted.length === 0 && (
        <div
          className="card empty-state-card"
          style={{ textAlign: 'center', padding: '48px 24px', margin: '20px 0' }}
        >
          <span
            style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}
            aria-hidden="true"
          >
            📖
          </span>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>
            {t('glossary.noResults', 'No terms match your search')}
          </h3>
          <p style={{ color: 'var(--ink-muted)', margin: 0, fontSize: '14px' }}>
            {t('glossary.noResultsHint', 'Try searching for another term or clear the filter.')}
          </p>
        </div>
      )}

      {/* Grouped term list — one section per letter */}
      {groups.map(({ letter, terms: groupTerms }) => (
        <section key={letter} aria-labelledby={`glossary-letter-${letter}`}>
          <h3 id={`glossary-letter-${letter}`} className="glossary-letter-heading">
            {letter}
          </h3>
          <div className="glossary-dictionary-grid">
            {groupTerms.map((item) => {
              const isHighlighted =
                !!highlightTerm && item.term.toLowerCase() === highlightTerm.toLowerCase()
              return (
                <GlossaryTermCard
                  key={item.term}
                  term={item}
                  highlighted={isHighlighted}
                  cardRef={isHighlighted ? highlightRef : null}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
