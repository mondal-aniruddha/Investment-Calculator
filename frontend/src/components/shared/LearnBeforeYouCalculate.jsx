import { Link } from 'react-router-dom'

/**
 * LearnBeforeYouCalculate — a small, non-preachy contextual teaser card
 * shown above or beside each calculator. Links to the relevant Learn Hub article.
 *
 * Props:
 *   slug        — Learn Hub article slug (e.g. 'what-is-sip')
 *   title       — Short teaser title (e.g. 'New to SIPs?')
 *   summary     — One sentence about what the article covers
 *   icon        — Emoji icon (optional, default: 📖)
 */
export function LearnBeforeYouCalculate({ slug, title, summary, icon = '📖' }) {
  if (!slug) return null

  return (
    <aside className="learn-before-calc-banner" aria-label="Learn about this calculator">
      <span className="lbc-icon" aria-hidden="true">{icon}</span>
      <div className="lbc-content">
        <p className="lbc-title">{title}</p>
        <p className="lbc-summary">{summary}</p>
      </div>
      <Link to={`/learn/${slug}`} className="lbc-cta-btn">
        Read Guide →
      </Link>
    </aside>
  )
}

export default LearnBeforeYouCalculate
