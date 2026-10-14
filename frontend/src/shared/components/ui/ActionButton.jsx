/**
 * ActionButton — generic full-width primary button
 */
export function ActionButton({ loading, onClick, children, loadingLabel = 'Running…' }) {
  return (
    <button className="btn btn-primary" disabled={loading} onClick={onClick} type="button">
      <span>{loading ? loadingLabel : children}</span>
      {!loading && <span aria-hidden="true">→</span>}
      {loading && <span className="spin" aria-hidden="true">↻</span>}
    </button>
  )
}
