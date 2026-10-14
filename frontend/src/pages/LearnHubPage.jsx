import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchArticles } from '../services/learnService'
import { SEO } from '../components/shared/SEO'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { DataState } from '../components/shared/DataState'

const CATEGORIES = [
  'ALL',
  'Basics',
  'Investing',
  'Tax',
  'Credit',
  'Insurance',
  'Retirement',
]

export default function LearnHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'ALL'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const revealRef = useScrollReveal()

  const loadArticles = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchArticles(selectedCategory, query)
      .then((data) => {
        setArticles(data || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || 'Could not load articles from backend. Please verify backend is running.')
        setLoading(false)
      })
  }, [selectedCategory, query])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    if (cat === 'ALL') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="learn-hub page-container" ref={revealRef}>
      <SEO
        title="Learn Hub — Plain-Language Money Guides for Young Indians"
        description="Jargon-free personal finance articles on SIP, Mutual Funds, CIBIL, Old vs New Tax, PPF, and Insurance. Designed for 18–30 first-job earners in India."
      />

      {/* Hero Header */}
      <div className="card hub-header reveal">
        <div className="section-label">LEARNING DESTINATION · JARGON-FREE</div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1.5px', margin: '8px 0' }}>
          Money Made Simple, Not Preachy.
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '15px', maxWidth: '640px', lineHeight: 1.6 }}>
          Practical, friendly financial education for your 20s and early 30s. Real Indian rupee examples, zero confusing acronyms, and direct links to interactive calculators.
        </p>

        {/* Search input */}
        <div className="hub-search-wrapper" style={{ marginTop: '20px' }}>
          <input
            type="search"
            aria-label="Search articles by title, topic or tags"
            placeholder="Search guides (e.g. SIP, 80C, CIBIL, PPF, Emergency fund)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field hub-search-input"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filter-pills" role="tablist" aria-label="Filter guides by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat === 'ALL' ? 'All Guides' : cat}
          </button>
        ))}
      </div>

      {/* Article Grid rendered via DataState */}
      <DataState
        loading={loading}
        error={error}
        empty={articles.length === 0}
        onRetry={loadArticles}
        skeletonCount={6}
        skeletonType="card"
        emptyMessage="No articles found"
        emptySubtitle="Try searching with a different term or select 'All Guides'."
      >
        <div className="articles-grid">
          {articles.map((art) => (
            <article key={art.slug} className="card article-card hover-lift">
              <div className="article-card-meta">
                <span className="category-badge">{art.category}</span>
                <span className="read-time-badge" aria-label={`Reading time: ${art.readingTimeMinutes} minutes`}>
                  ⏱ {art.readingTimeMinutes} min read
                </span>
              </div>

              <h2 className="article-card-title">
                <Link to={`/learn/${art.slug}`}>{art.title}</Link>
              </h2>

              <p className="article-card-excerpt">
                {art.excerpt}
              </p>

              <div className="article-card-footer">
                <Link to={`/learn/${art.slug}`} className="read-more-link">
                  Read Guide <span>→</span>
                </Link>

                {art.relatedCalculatorPath && (
                  <Link
                    to={art.relatedCalculatorPath}
                    className="related-calc-btn"
                    title={`Try ${art.relatedCalculatorLabel || 'calculator'}`}
                  >
                    <span>⚡</span> {art.relatedCalculatorLabel || 'Try Calculator'}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </DataState>

      {/* Bottom CTA to Roadmap & Glossary */}
      <div className="card hub-footer-cta reveal" style={{ marginTop: '40px', padding: '28px' }}>
        <div className="hub-footer-cta-inner">
          <div>
            <h3 style={{ margin: '0 0 6px' }}>New to personal finance?</h3>
            <p style={{ color: 'var(--ink-muted)', margin: 0 }}>
              Follow our step-by-step Beginner Roadmap or look up tricky terms in the Glossary.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/roadmap" className="btn btn-primary">Start Roadmap ↗</Link>
            <Link to="/glossary" className="btn btn-secondary">Financial Glossary</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
