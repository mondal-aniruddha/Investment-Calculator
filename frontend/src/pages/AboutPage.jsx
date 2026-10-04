/**
 * AboutPage — disclaimer, data sources, project info.
 * NEW page added in this upgrade.
 */
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function AboutPage() {
  const revealRef = useScrollReveal()

  return (
    <div className="about-page" ref={revealRef}>
      <div className="reveal">
        <span className="section-label">ABOUT INFINANCE</span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-2px', margin: '10px 0 6px' }}>
          Transparency &amp; Disclaimer
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '15px', maxWidth: '560px' }}>
          Everything you need to know about how InFinance works, where the data comes from, and what it cannot do.
        </p>
      </div>

      {/* ── Disclaimer ── */}
      <div className="card about-section reveal">
        <h2>⚠ Disclaimer</h2>
        <p>
          InFinance provides <strong>educational illustrative projections only</strong>. All calculator results are
          estimates based on configurable assumptions and are not financial, investment, tax, or legal advice.
        </p>
        <p>
          InFinance is <strong>not a SEBI-registered investment advisor</strong> and does not hold any licence to
          provide financial advice in India. Before making any financial decision, consult a SEBI-registered
          financial advisor and/or a Chartered Accountant.
        </p>
        <p>
          Projections assume constant rates over the selected horizon. Actual returns are subject to market risk,
          inflation changes, regulatory changes, and other factors not captured in the model.
        </p>
      </div>

      {/* ── Data sources ── */}
      <div className="card about-section reveal">
        <h2>📊 Data Sources</h2>
        <p>All interest rates and tax limits are sourced from official Indian government publications:</p>
        <ul className="about-sources">
          <li>PPF (7.1%): Ministry of Finance, DEA Small Savings Scheme notifications</li>
          <li>EPF (8.25%): Central Board of Trustees (CBT), EPFO</li>
          <li>SSY (8.2%): MoF notification F.No.1/4/2019-NS</li>
          <li>NPS (10.5% benchmark): PFRDA historical blended return benchmark</li>
          <li>FD / RD / Post Office rates: Ministry of Finance / scheduled bank card rates</li>
          <li>Income tax slabs: Union Budget 2024-25 (AY 2025-26)</li>
          <li>Metal prices: metals.dev API — indicative MCX reference prices in INR</li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          Rates are stored in the database and can be updated by the admin without redeploying. All rate changes
          are audit-logged.
        </p>
      </div>

      {/* ── Technology ── */}
      <div className="card about-section reveal">
        <h2>⚙ Technology</h2>
        <p>InFinance is open-source software built with:</p>
        <ul className="about-sources">
          <li>Frontend: React 19 + Vite 7 + React Router 7 + i18next (EN/HI/BN)</li>
          <li>Backend: Spring Boot 4.1.1 + Java 21 + Spring Security + JJWT</li>
          <li>Database: MySQL 8.4 (prod) / H2 (dev) + Flyway migrations</li>
          <li>PDF/Excel reports: OpenPDF 2 + Apache POI 5</li>
          <li>API docs: SpringDoc OpenAPI / Swagger UI at /swagger-ui.html</li>
          <li>Rate limiting: Bucket4j with per-IP token bucket</li>
          <li>Deployment: Netlify (frontend) + configurable backend host</li>
        </ul>
      </div>

      {/* ── Limitations ── */}
      <div className="card about-section reveal">
        <h2>🚫 Limitations</h2>
        <ul className="about-sources">
          <li>All projections use a single constant rate for the entire horizon — reality is more variable.</li>
          <li>Tax calculations do not account for all deductions or state-specific taxes.</li>
          <li>Metal prices are indicative MCX reference rates, not local retail jewellery prices (which include GST, making charges, and margins).</li>
          <li>Monte Carlo simulation uses a simplified normal-distribution model; actual markets have fat tails and regime changes.</li>
          <li>Inflation adjustment uses a single CPI assumption across the entire projection period.</li>
        </ul>
      </div>

      {/* ── Contact ── */}
      <div className="card about-section reveal">
        <h2>🔗 Links</h2>
        <ul className="about-sources">
          <li>
            <a href="https://github.com/mondal-aniruddha/Investment-Calculator" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              GitHub repository
            </a>
          </li>
          <li>API docs: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>/swagger-ui.html</span> (when backend is running)</li>
          <li>Live site: <a href="https://infinance-home.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>infinance-home.netlify.app</a></li>
        </ul>
        <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--ink-faint)' }}>
          © 2025 InFinance · Built for educational purposes · India · INR
        </p>
      </div>
    </div>
  )
}
