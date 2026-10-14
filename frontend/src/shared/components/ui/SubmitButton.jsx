/**
 * SubmitButton — primary button with loading state
 */
export function SubmitButton({ loading, label = 'Calculate' }) {
  return (
    <button className="btn btn-primary" disabled={loading} type="submit">
      <span>{loading ? 'Calculating…' : label}</span>
      {!loading && <span aria-hidden="true">→</span>}
      {loading && <span className="spin" aria-hidden="true">↻</span>}
    </button>
  )
}
