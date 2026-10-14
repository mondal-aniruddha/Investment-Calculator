/**
 * HowItWorks — educational disclaimer card below each calculator
 */
export function HowItWorks({ text }) {
  return (
    <div className="tips-section">
      <span className="section-label">How it works</span>
      <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: '1.65', margin: 0 }}>
        {text}
      </p>
      <p className="tips-disclaimer">
        For education only. Not investment, tax, legal, or financial advice. Verify all rates with
        official sources before making decisions.
      </p>
    </div>
  )
}
