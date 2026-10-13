import { Link } from 'react-router-dom'

export function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="disclaimer-banner-compact" role="note">
        <span className="disclaimer-icon" aria-hidden="true">ℹ</span>
        <span>
          <strong>Educational estimate only.</strong> Not financial advice. Projections are estimates, not guarantees. InFinance is not SEBI-registered.{' '}
          <Link to="/about" className="disclaimer-link">Learn more</Link>
        </span>
      </div>
    )
  }

  return (
    <div className="disclaimer-banner card" role="note">
      <div className="disclaimer-banner-content">
        <div className="disclaimer-badge">
          <span className="disclaimer-icon" aria-hidden="true">🛡</span>
          <span>COMPLIANCE & TRANSPARENCY</span>
        </div>
        <p className="disclaimer-text">
          <strong>Educational Purposes Only:</strong> InFinance is an independent educational platform designed to build financial literacy among young Indians. We are <strong>not a SEBI-registered investment advisor, research analyst, or portfolio manager</strong>. All calculators and projections are mathematical models based on historical averages and user-defined inputs — they do not represent guaranteed returns or personalized recommendations. Always consult a certified Chartered Accountant (CA) or SEBI-registered RIA before taking irreversible investment decisions.
        </p>
        <div className="disclaimer-footer-tags">
          <span>Stateless &amp; Private: No personal inputs saved on server</span>
          <span>·</span>
          <span>INR (₹) Standard</span>
          <span>·</span>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerBanner
