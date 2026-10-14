/**
 * TipsCard — 3-bullet tips section below each calculator
 */
export function TipsCard({ tips = [] }) {
  if (!tips.length) return null
  return (
    <div className="tips-section">
      <span className="section-label">💡 Tips</span>
      <ul className="tips-list">
        {tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
      <p className="tips-disclaimer">
        Educational guidance only. Consult a SEBI-registered financial advisor or Chartered
        Accountant for personalised advice.
      </p>
    </div>
  )
}
