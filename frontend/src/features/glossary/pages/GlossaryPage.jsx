import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchGlossaryTerms } from '../api/glossaryApi'
import { SEO } from '../../../components/shared/SEO'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import { DataState } from '../../../components/shared/DataState'

export default function GlossaryPage() {
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const revealRef = useScrollReveal()

  const loadTerms = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchGlossaryTerms()
      .then((data) => {
        setTerms(data || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || 'Could not load glossary terms from backend.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadTerms()
  }, [loadTerms])

  // Categories
  const categories = useMemo(() => {
    const set = new Set()
    terms.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return ['ALL', ...Array.from(set).sort()]
  }, [terms])

  // Filtered terms
  const filteredTerms = useMemo(() => {
    const q = query.toLowerCase().trim()
    return terms.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory
      const matchQuery =
        !q ||
        item.term.toLowerCase().includes(q) ||
        (item.shortDefinition && item.shortDefinition.toLowerCase().includes(q)) ||
        (item.detailedExplainer && item.detailedExplainer.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [terms, selectedCategory, query])

  return (
    <div className="glossary-page page-container" ref={revealRef}>
      <SEO
        title="Financial Glossary — Jargon-Free Definitions for Young Indians"
        description="One-line definitions and clear explainers for Indian personal finance terms: CAGR, XIRR, Section 80C, LTCG, Expense Ratio, and more."
      />

      {/* Header card */}
      <div className="card hub-header reveal">
        <div className="section-label">FINANCIAL DICTIONARY · ONE-LINE DEFINITIONS</div>
        <h1
          style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1.5px', margin: '8px 0' }}
        >
          Jargon Buster Glossary
        </h1>
        <p
          style={{
            color: 'var(--ink-muted)',
            fontSize: '15px',
            maxWidth: '640px',
            lineHeight: 1.6,
          }}
        >
          No more getting overwhelmed by complicated banking jargon. Quick, friendly definitions for
          the terms that matter to your money in India.
        </p>

        {/* Search */}
        <div className="hub-search-wrapper" style={{ marginTop: '20px' }}>
          <input
            type="search"
            aria-label="Search financial terms"
            placeholder="Search terms (e.g. CAGR, XIRR, 80C, NAV, CIBIL)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field hub-search-input"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-filter-pills" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'ALL' ? 'All Terms' : cat}
          </button>
        ))}
      </div>

      {/* Terms Grid rendered via DataState */}
      <DataState
        loading={loading}
        error={error}
        empty={filteredTerms.length === 0}
        onRetry={loadTerms}
        skeletonCount={6}
        skeletonType="card"
        emptyIcon="📖"
        emptyMessage="No terms match your search"
        emptySubtitle="Try searching for another term or clear the filter."
      >
        <div className="glossary-dictionary-grid">
          {filteredTerms.map((item) => (
            <article key={item.term} className="card glossary-term-card hover-lift">
              <div className="glossary-card-top">
                <h2 className="glossary-term-name">{item.term}</h2>
                {item.category && <span className="category-badge">{item.category}</span>}
              </div>

              <p className="glossary-short-def">{item.shortDefinition}</p>

              {item.detailedExplainer && (
                <p className="glossary-detailed-exp">{item.detailedExplainer}</p>
              )}

              {item.relatedUrl && (
                <div className="glossary-term-action">
                  <Link to={item.relatedUrl} className="related-calc-btn">
                    <span>⚡</span> Open Related Tool ↗
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </DataState>
    </div>
  )
}
