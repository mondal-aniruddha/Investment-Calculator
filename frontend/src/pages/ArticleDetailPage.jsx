import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { fetchArticleBySlug } from '../services/learnService'
import { SEO } from '../components/shared/SEO'
import { DisclaimerBanner } from '../components/shared/DisclaimerBanner'
import { formatKolkataTime } from '../utils/format'

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
})

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchArticleBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setArticle(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching article:', err)
          setError('Article not found or backend unavailable.')
          setLoading(false)
        }
      })

    return () => { isMounted = false }
  }, [slug])

  if (loading) {
    return (
      <div className="page-container article-detail-page">
        <div className="card" style={{ padding: '40px' }}>
          <div className="skeleton-line" style={{ width: '30%', height: '16px', marginBottom: '20px' }} />
          <div className="skeleton-line" style={{ width: '80%', height: '36px', marginBottom: '24px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '18px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '95%', height: '18px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '70%', height: '18px' }} />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="page-container article-detail-page">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <span style={{ fontSize: '36px' }} aria-hidden="true">📖</span>
          <h2 style={{ margin: '16px 0 8px' }}>Guide not found</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>
            The guide you are looking for does not exist or may have moved.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/learn')}>
            Return to Learn Hub
          </button>
        </div>
      </div>
    )
  }

  // Parse HTML from Markdown
  const htmlContent = marked.parse(article.bodyMarkdown || '')

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
      <SEO
        title={article.title}
        description={article.excerpt}
        ogType="article"
        jsonLd={jsonLd}
      />

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
              <span className="calc-banner-icon" aria-hidden="true">⚡</span>
              <div>
                <strong>Interactive Tool Available:</strong> Put this concept into practice with real numbers.
              </div>
            </div>
            <Link to={article.relatedCalculatorPath} className="btn btn-primary btn-sm">
              {article.relatedCalculatorLabel || 'Open Calculator'} ↗
            </Link>
          </div>
        )}

        <hr className="article-divider" />

        {/* Rendered Markdown Body */}
        <div
          className="article-body-markdown"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Sources & Citations */}
        {article.sources && (
          <div className="article-sources-box">
            <h4>Official Sources &amp; References</h4>
            <p>
              Information verified against authoritative Indian financial publications and regulatory notifications:
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

      {/* Back to Hub Nav */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
