/**
 * EmptyState — friendly placeholder before calculations run
 */
export function EmptyState({ icon = '📊', message = 'Enter your assumptions and calculate to see results.' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <p>{message}</p>
    </div>
  )
}
