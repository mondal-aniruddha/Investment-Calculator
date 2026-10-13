import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchGlossaryTerms, getCachedTerm } from '../../services/glossaryService'

/**
 * <Term term="CAGR">Optional display text</Term>
 * Displays a dotted underlined financial keyword that shows an instant
 * one-line definition in a sleek floating tooltip on hover or tap.
 */
export function Term({ term, children }) {
  const [definition, setDefinition] = useState(() => {
    const cached = getCachedTerm(term)
    return cached ? cached.shortDefinition : null
  })
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!definition) {
      fetchGlossaryTerms().then((terms) => {
        const found = terms.find((t) => t.term.toLowerCase() === term.toLowerCase().trim())
        if (found) setDefinition(found.shortDefinition)
      })
    }
  }, [term, definition])

  // Handle outside click on mobile
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const displayText = children || term

  return (
    <span
      ref={containerRef}
      className="inline-term-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="inline-term-trigger"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        aria-expanded={isOpen}
        aria-label={`Definition of ${term}`}
      >
        {displayText}
        <span className="term-info-dot" aria-hidden="true">?</span>
      </button>

      {isOpen && (
        <span className="term-tooltip" role="tooltip">
          <span className="term-tooltip-header">
            <strong>{term}</strong>
            <Link to="/glossary" className="term-glossary-link">
              Glossary ↗
            </Link>
          </span>
          <span className="term-tooltip-body">
            {definition || 'Loading definition...'}
          </span>
        </span>
      )}
    </span>
  )
}

export default Term
