import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchArticles } from '../api/learnApi'
import { SEO } from '../../../components/shared/SEO'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import { DataState } from '../../../components/shared/DataState'
import { useGlossary } from '../../glossary/hooks/useGlossary'
import { GlossaryList } from '../../glossary/components/GlossaryList'

const GUIDE_CATEGORIES = [
  'ALL',
  'Basics',
  'Investing',
  'Tax',
  'Credit',
  'Insurance',
  'Retirement',
  'Fixed Income',
]

const VIEWS = ['guides', 'glossary']

export default function LearnHubPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const revealRef = useScrollReveal()

  // ── View state driven entirely by ?view= URL param ──
  const rawView = searchParams.get('view') || 'guides'
  const activeView = VIEWS.includes(rawView) ? rawView : 'guides'

  // Deep-link target term for the glossary view
  const deepLinkTerm = searchParams.get('term') || ''

  // ── Shared search box — query is preserved when switching views ──
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // ── Guides state ──
  const initialCategory = searchParams.get('category') || 'ALL'
  const [selectedGuideCategory, setSelectedGuideCategory] = useState(initialCategory)
  const [articles, setArticles] = useState([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState(null)

  // ── Glossary state (category filter local, terms from hook) ──
  const [selectedGlossaryCategory, setSelectedGlossaryCategory] = useState('ALL')
  const {
    terms,
    loading: glossaryLoading,
    isFallback,
    categories: glossaryCategories,
  } = useGlossary()

  // ── Tab refs for roving tabindex / arrow-key navigation ──
  const tabRefs = [useRef(null), useRef(null)]

  // ── Debounce search input 300 ms ──
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // ── Sync guide category when ?category= param changes (back button, breadcrumbs) ──
  useEffect(() => {
    const cat = searchParams.get('category') || 'ALL'
    setSelectedGuideCategory(cat)
  }, [searchParams])

  // ── Load articles only when guides view is active ──
  const loadArticles = useCallback(() => {
    setArticlesLoading(true)
    setArticlesError(null)

    fetchArticles(selectedGuideCategory, debouncedQuery)
      .then((data) => {
        setArticles(data || [])
        setArticlesLoading(false)
      })
      .catch((err) => {
        setArticlesError(
          err?.message ||
            t(
              'errors.serverUnreachable',
              "We couldn't reach the InFinance server. Please try again in a few minutes."
            )
        )
        setArticlesLoading(false)
      })
  }, [selectedGuideCategory, debouncedQuery, t])

  useEffect(() => {
    if (activeView === 'guides') loadArticles()
  }, [activeView, loadArticles])

  // ── View switcher — updates URL params ──
  const switchView = useCallback(
    (view) => {
      const next = new URLSearchParams(searchParams)
      next.set('view', view)
      if (view === 'guides') {
        // Remove glossary-specific params when going back to guides
        next.delete('term')
      }
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  // ── Keyboard navigation between the two view tabs (arrow keys) ──
  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (idx + 1) % VIEWS.length
      tabRefs[next].current?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (idx - 1 + VIEWS.length) % VIEWS.length
      tabRefs[prev].current?.focus()
    }
  }

  // ── Guide category handler — updates URL ──
  const handleGuidesCategoryChange = (cat) => {
    setSelectedGuideCategory(cat)
    const next = new URLSearchParams(searchParams)
    if (cat === 'ALL') next.delete('category')
    else next.set('category', cat)
    setSearchParams(next)
  }

  // ── Derived values ──
  const shownCategories = activeView === 'guides' ? GUIDE_CATEGORIES : glossaryCategories
  const selectedCategory =
    activeView === 'guides' ? selectedGuideCategory : selectedGlossaryCategory
  const handleCategoryChange =
    activeView === 'guides' ? handleGuidesCategoryChange : setSelectedGlossaryCategory

  const seoTitle =
    activeView === 'glossary'
      ? t('glossary.seoTitle', 'Financial Glossary — Jargon-Free Definitions for Young Indians')
      : t('learn.seoTitle', 'Learn Hub — Plain-Language Money Guides for Young Indians')

  const seoDesc =
    activeView === 'glossary'
      ? t(
          'glossary.seoDesc',
          'One-line definitions and clear explainers for Indian personal finance terms: CAGR, XIRR, Section 80C, LTCG, Expense Ratio, and more.'
        )
      : t(
          'learn.seoDesc',
          'Jargon-free personal finance articles on SIP, Mutual Funds, CIBIL, Old vs New Tax, PPF, and Insurance. Designed for 18–30 first-job earners in India.'
        )

  const searchPlaceholder =
    activeView === 'glossary'
      ? t('glossary.searchPlaceholder', 'Search terms (e.g. CAGR, XIRR, 80C, NAV, CIBIL)…')
      : t('learn.searchPlaceholder', 'Search guides (e.g. SIP, 80C, CIBIL, PPF, Emergency fund)…')

  return (
    <div className="learn-hub page-container" ref={revealRef}>
      <SEO title={seoTitle} description={seoDesc} />

      {/* ── Hero Header ── */}
      <div className="card hub-header reveal">
        <div className="section-label">
          {activeView === 'glossary'
            ? t('glossary.sectionLabel', 'FINANCIAL DICTIONARY · ONE-LINE DEFINITIONS')
            : t('learn.sectionLabel', 'LEARNING DESTINATION · JARGON-FREE')}
        </div>
        <h1
          style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1.5px', margin: '8px 0' }}
        >
          {activeView === 'glossary'
            ? t('glossary.heading', 'Jargon Buster Glossary')
            : t('learn.heading', 'Money Made Simple, Not Preachy.')}
        </h1>
        <p
          style={{
            color: 'var(--ink-muted)',
            fontSize: '15px',
            maxWidth: '640px',
            lineHeight: 1.6,
          }}
        >
          {activeView === 'glossary'
            ? t(
                'glossary.subheading',
                'No more getting overwhelmed by complicated banking jargon. Quick, friendly definitions for the terms that matter to your money in India.'
              )
            : t(
                'learn.subheading',
                'Practical, friendly financial education for your 20s and early 30s. Real Indian rupee examples, zero confusing acronyms, and direct links to interactive calculators.'
              )}
        </p>

        {/* ── View Tablist: Guides | Glossary ── */}
        <div
          role="tablist"
          aria-label={t('learn.viewTabsLabel', 'Content view')}
          className="learn-view-tablist"
        >
          {VIEWS.map((view, idx) => (
            <button
              key={view}
              ref={tabRefs[idx]}
              role="tab"
              id={`tab-${view}`}
              aria-selected={activeView === view}
              aria-controls={`tabpanel-${view}`}
              tabIndex={activeView === view ? 0 : -1}
              className={`learn-view-tab${activeView === view ? ' active' : ''}`}
              onClick={() => switchView(view)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
            >
              {view === 'guides'
                ? t('learn.tabGuides', 'Guides')
                : t('learn.tabGlossary', 'Glossary')}
            </button>
          ))}
        </div>

        {/* ── Shared search input ── */}
        <div className="hub-search-wrapper" style={{ marginTop: '12px' }}>
          <input
            type="search"
            aria-label={
              activeView === 'glossary'
                ? t('glossary.searchAriaLabel', 'Search financial terms')
                : t('learn.searchAriaLabel', 'Search articles by title, topic or tags')
            }
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field hub-search-input"
          />
        </div>
      </div>

      {/* ── Category Filter Pills — switches content per view ── */}
      <div
        className="category-filter-pills"
        role="tablist"
        aria-label={t('learn.categoryFilterLabel', 'Filter by category')}
      >
        {shownCategories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat === 'ALL'
              ? activeView === 'glossary'
                ? t('glossary.allTerms', 'All Terms')
                : t('learn.allGuides', 'All Guides')
              : cat}
          </button>
        ))}
      </div>

      {/* ── GUIDES TAB PANEL ── */}
      <div
        id="tabpanel-guides"
        role="tabpanel"
        aria-labelledby="tab-guides"
        hidden={activeView !== 'guides'}
      >
        <DataState
          loading={articlesLoading}
          error={articlesError}
          empty={articles.length === 0}
          onRetry={loadArticles}
          skeletonCount={6}
          skeletonType="card"
          emptyMessage={t('learn.emptyMessage', 'No articles found')}
          emptySubtitle={t(
            'learn.emptySubtitle',
            "Try searching with a different term or select 'All Guides'."
          )}
        >
          <div className="articles-grid">
            {articles.map((art) => (
              <article key={art.slug} className="card article-card hover-lift">
                <div className="article-card-meta">
                  <span className="category-badge">{art.category}</span>
                  <span
                    className="read-time-badge"
                    aria-label={`Reading time: ${art.readingTimeMinutes} minutes`}
                  >
                    ⏱ {art.readingTimeMinutes} min read
                  </span>
                </div>

                <h2 className="article-card-title">
                  <Link to={`/learn/${art.slug}`}>{art.title}</Link>
                </h2>

                <p className="article-card-excerpt">{art.excerpt}</p>

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

        {/* Evergreen fallback when guides API fails — includes a "browse glossary" shortcut */}
        {articlesError && !articlesLoading && (
          <div
            className="card evergreen-fallback-card reveal"
            style={{ marginTop: '24px', padding: '24px' }}
          >
            <div className="section-label">ALWAYS AVAILABLE · CLIENT TOOLS</div>
            <h3 style={{ margin: '8px 0 6px' }}>
              {t('learn.evergreenTitle', 'Explore Calculators & Glossary')}
            </h3>
            <p style={{ color: 'var(--ink-muted)', fontSize: '14px', margin: '0 0 16px' }}>
              {t(
                'learn.evergreenSubtitle',
                'While we reconnect to the server, explore our interactive calculators and financial glossary:'
              )}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/sip" className="btn btn-secondary btn-sm">
                SIP Planner ↗
              </Link>
              <Link to="/loan" className="btn btn-secondary btn-sm">
                Loan &amp; Prepayment ↗
              </Link>
              <Link to="/fixed" className="btn btn-secondary btn-sm">
                Fixed Income ↗
              </Link>
              <Link to="/mutual" className="btn btn-secondary btn-sm">
                Mutual Funds ↗
              </Link>
              <Link to="/planning" className="btn btn-secondary btn-sm">
                Smart Planning ↗
              </Link>
            </div>
            <p style={{ color: 'var(--ink-muted)', margin: '16px 0 8px', fontSize: '14px' }}>
              {t('learn.meanwhileGlossary', 'Meanwhile, browse the Glossary')}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => switchView('glossary')}
            >
              {t('learn.browseGlossaryBtn', 'Browse Glossary')}
            </button>
          </div>
        )}
      </div>

      {/* ── GLOSSARY TAB PANEL ── */}
      <div
        id="tabpanel-glossary"
        role="tabpanel"
        aria-labelledby="tab-glossary"
        hidden={activeView !== 'glossary'}
      >
        {glossaryLoading ? (
          <DataState loading skeletonCount={6} skeletonType="card">
            {null}
          </DataState>
        ) : (
          <GlossaryList
            terms={terms}
            isFallback={isFallback}
            selectedCategory={selectedGlossaryCategory}
            query={debouncedQuery}
            highlightTerm={deepLinkTerm}
          />
        )}
      </div>

      {/* ── Bottom CTA — Glossary button now switches view in-page ── */}
      <div className="card hub-footer-cta reveal" style={{ marginTop: '40px', padding: '28px' }}>
        <div className="hub-footer-cta-inner">
          <div>
            <h3 style={{ margin: '0 0 6px' }}>{t('learn.ctaTitle', 'New to personal finance?')}</h3>
            <p style={{ color: 'var(--ink-muted)', margin: 0 }}>
              {t(
                'learn.ctaSubtitle',
                'Follow our step-by-step Beginner Roadmap or look up tricky terms in the Glossary.'
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/roadmap" className="btn btn-primary">
              {t('learn.startRoadmap', 'Start Roadmap ↗')}
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => switchView('glossary')}
            >
              {t('learn.glossaryBtn', 'Financial Glossary')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
