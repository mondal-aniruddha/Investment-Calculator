import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { fetchArticleBySlug, fetchArticles } from '../api/learnApi'
import { SEO } from '../../../components/shared/SEO'
import { DisclaimerBanner } from '../../../components/shared/DisclaimerBanner'
import { DataState } from '../../../components/shared/DataState'
import { formatKolkataTime } from '../../../shared/lib/format'

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
})

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadArticle = useCallback(() => {
    setLoading(true)
    setError(null)

    fetchArticleBySlug(slug)
      .then((data) => {
        setArticle(data)
        setLoading(false)
        if (data?.category) {
          fetchArticles(data.category)
            .then((list) => {
              const related = (list || []).filter((item) => item.slug !== data.slug).slice(0, 3)
              setRelatedArticles(related)
            })
            .catch(() => setRelatedArticles([]))
        }
      })
      .catch((err) => {
        setError(
          err?.message ||
            "We couldn't reach the InFinance server. Please try again in a few minutes."
        )
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    loadArticle()
  }, [loadArticle])

  if (loading || error || !article) {
    return (
      <div className="page-container article-detail-page">
        <DataState
          loading={loading}
          error={error}
          empty={!article}
          onRetry={loadArticle}
          skeletonType="detail"
          emptyIcon="📖"
          emptyMessage="Guide not found"
          emptySubtitle="The guide you are looking for does not exist or may have moved."
        />
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/learn')}>
              Return to Learn Hub
            </button>
          </div>
        )}
      </div>
    )
  }

  // Parse HTML from Markdown and sanitize with DOMPurify
  const htmlContent = DOMPurify.sanitize(marked.parse(article.bodyMarkdown || ''))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    articleSection: article.category,
    dateModified: article.updatedAt,
    datePublished: article.createdAt || article.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'InFinance Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'InFinance',
      logo: {
        '@type': 'ImageObject',
        url: 'https://infinance-home.netlify.app/icon.svg',
      },
    },
  }

  return (
    <div className="page-container article-detail-page">
      <SEO title={article.title} description={article.excerpt} ogType="article" jsonLd={jsonLd} />

      {/* Breadcrumb Header */}
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <Link to="/learn">Learn Hub</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/learn?category=${encodeURIComponent(article.category)}`}>
          {article.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>

      {/* Main Article Container */}
      <article className="card article-main-card">
        {/* Header */}
        <header className="article-header">
          <div className="article-meta-row">
            <span className="category-badge">{article.category}</span>
            <span className="read-time-badge">⏱ {article.readingTimeMinutes} min read</span>
            {article.updatedAt && (
              <span className="article-updated-date">
                Last updated: {formatKolkataTime(article.updatedAt)}
              </span>
            )}
          </div>

          <h1 className="article-title">{article.title}</h1>
          <p className="article-subtitle">{article.excerpt}</p>
        </header>

        {/* Related Calculator Highlight Banner */}
        {article.relatedCalculatorPath && (
          <div className="related-calculator-banner">
            <div className="calc-banner-info">
              <span className="calc-banner-icon" aria-hidden="true">
                ⚡
              </span>
              <div>
                <strong>Interactive Tool Available:</strong> Put this concept into practice with
                real numbers.
              </div>
            </div>
            <Link to={article.relatedCalculatorPath} className="btn btn-primary btn-sm">
              {article.relatedCalculatorLabel || 'Open Calculator'} ↗
            </Link>
          </div>
        )}

        <hr className="article-divider" />

        {/* Rendered Markdown Body */}
        <div className="article-body-markdown" dangerouslySetInnerHTML={{ __html: htmlContent }} />

        {/* Sources & Citations */}
        {article.sources && (
          <div className="article-sources-box">
            <h4>Official Sources &amp; References</h4>
            <p>
              Information verified against authoritative Indian financial publications and
              regulatory notifications:
            </p>
            <ul>
              {article.sources.split(',').map((src, i) => (
                <li key={i}>{src.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Compact Educational Disclaimer */}
        <div style={{ marginTop: '32px' }}>
          <DisclaimerBanner compact={true} />
        </div>
      </article>

      {/* Related Guides in Same Category */}
      {relatedArticles.length > 0 && (
        <section className="related-articles-section" style={{ marginTop: '36px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
            Related Guides in {article.category}
          </h3>
          <div
            className="articles-grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {relatedArticles.map((rel) => (
              <article key={rel.slug} className="card article-card hover-lift">
                <div className="article-card-meta">
                  <span className="category-badge">{rel.category}</span>
                  <span className="read-time-badge">⏱ {rel.readingTimeMinutes} min read</span>
                </div>
                <h4 className="article-card-title" style={{ fontSize: '17px', margin: '8px 0' }}>
                  <Link to={`/learn/${rel.slug}`}>{rel.title}</Link>
                </h4>
                <p className="article-card-excerpt" style={{ fontSize: '13px' }}>
                  {rel.excerpt}
                </p>
                <div className="article-card-footer" style={{ marginTop: 'auto' }}>
                  <Link to={`/learn/${rel.slug}`} className="read-more-link">
                    Read Guide <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Back to Hub Nav */}
      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to="/learn" className="btn btn-secondary">
          ← Back to all Guides
        </Link>
        {article.relatedCalculatorPath && (
          <Link to={article.relatedCalculatorPath} className="btn btn-primary">
            {article.relatedCalculatorLabel || 'Try Calculator'} ↗
          </Link>
        )}
      </div>
    </div>
  )
}
