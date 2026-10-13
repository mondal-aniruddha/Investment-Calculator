import { Link } from 'react-router-dom'
import { SEO } from '../components/shared/SEO'

export default function PrivacyPage() {
  return (
    <div className="privacy-page page-container">
      <SEO
        title="Privacy & Data Transparency"
        description="Learn how InFinance protects your privacy: zero login required, stateless calculations, and no personal financial data stored on our servers."
      />

      <div className="card hub-header reveal">
        <div className="section-label">PRIVACY FIRST · NO LOGIN REQUIRED</div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-1.5px', margin: '8px 0' }}>
          Your Money, Strictly Your Privacy
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '15px', maxWidth: '680px', lineHeight: 1.6 }}>
          InFinance is built from the ground up to be safe and privacy-respecting for young Indians. You never have to hand over your personal identity or financial records just to plan your future.
        </p>
      </div>

      <div className="privacy-grid">
        <div className="card privacy-card">
          <div className="privacy-card-icon" aria-hidden="true">🔒</div>
          <h2>1. 100% Stateless Calculations</h2>
          <p>
            When you enter your salary, loan amount, or monthly SIP, those numbers are evaluated in real time without being persisted to a database or written to disk. The server calculates the mathematical answer and forgets your numbers immediately.
          </p>
        </div>

        <div className="card privacy-card">
          <div className="privacy-card-icon" aria-hidden="true">🚫</div>
          <h2>2. No Forced Sign-Ups or Tracking</h2>
          <p>
            Every single calculator, roadmap step, glossary term, and learning explainer is freely accessible without creating an account or entering your mobile number. We will never sell your contact info to third-party telemarketers or loan agents.
          </p>
        </div>

        <div className="card privacy-card">
          <div className="privacy-card-icon" aria-hidden="true">💾</div>
          <h2>3. Your Data Stays on Your Device</h2>
          <p>
            Features like your Beginner Roadmap checkboxes, dark mode toggle, and quiz results are stored locally in your browser’s <code>localStorage</code>. They never leave your phone or laptop unless you deliberately export them.
          </p>
        </div>

        <div className="card privacy-card">
          <div className="privacy-card-icon" aria-hidden="true">📜</div>
          <h2>4. Regulatory Trust &amp; Open Source</h2>
          <p>
            Tax slabs, benchmark interest rates, and guidelines are pulled from official public sources including the Income Tax Department, Reserve Bank of India (RBI), and SEBI. Our calculations are transparent and open for inspection.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px', textAlign: 'center', padding: '32px' }}>
        <h3 style={{ margin: '0 0 12px' }}>Ready to start planning with clarity?</h3>
        <p style={{ color: 'var(--ink-muted)', margin: '0 0 20px' }}>
          Explore the Learn Hub or jump right into your first calculation.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/learn" className="btn btn-primary">Browse Learn Hub</Link>
          <Link to="/roadmap" className="btn btn-secondary">Open Beginner Roadmap</Link>
          <Link to="/sip" className="btn btn-secondary">Try SIP Planner</Link>
        </div>
      </div>
    </div>
  )
}
