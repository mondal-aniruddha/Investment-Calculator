import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../../components/shared/SEO'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import { DataState } from '../../../components/shared/DataState'
import { useGlossary } from '../hooks/useGlossary'
import { GlossaryList } from '../components/GlossaryList'

/**
 * GlossaryPage — standalone /glossary route.
 *
 * This is a thin wrapper around the shared GlossaryList component.
 * The same component is also embedded in LearnHubPage under /learn?view=glossary.
 * Supports ?term=<name> for deep linking to a specific term.
 */
export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchParams] = useSearchParams()
  const highlightTerm = searchParams.get('term') || ''
  const revealRef = useScrollReveal()

  const { terms, loading, isFallback, categories } = useGlossary()

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

      {/* Loading skeleton — glossary never shows an error card (fallback always provides data) */}
      {loading ? (
        <DataState loading skeletonCount={6} skeletonType="card">
          {null}
        </DataState>
      ) : (
        <GlossaryList
          terms={terms}
          isFallback={isFallback}
          selectedCategory={selectedCategory}
          query={query}
          highlightTerm={highlightTerm}
        />
      )}
    </div>
  )
}
