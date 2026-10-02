export function ResultCardSkeleton({ title = 'Calculating estimate...' }) {
  return (
    <div className="card result-card skeleton-card" aria-busy="true" aria-live="polite">
      <div className="skeleton-bone" style={{ width: '120px', height: '14px', marginBottom: '12px' }} />
      <div className="skeleton-bone" style={{ width: '220px', height: '36px', marginBottom: '8px' }} />
      <div className="skeleton-bone" style={{ width: '160px', height: '16px', marginBottom: '24px' }} />
      <div className="metric-grid">
        <div className="skeleton-metric">
          <div className="skeleton-bone" style={{ width: '80px', height: '12px', marginBottom: '6px' }} />
          <div className="skeleton-bone" style={{ width: '100px', height: '22px' }} />
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-bone" style={{ width: '80px', height: '12px', marginBottom: '6px' }} />
          <div className="skeleton-bone" style={{ width: '100px', height: '22px' }} />
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-bone" style={{ width: '80px', height: '12px', marginBottom: '6px' }} />
          <div className="skeleton-bone" style={{ width: '100px', height: '22px' }} />
        </div>
      </div>
      <div className="result-actions" style={{ marginTop: '1.25rem' }}>
        <div className="skeleton-bone" style={{ width: '130px', height: '34px', borderRadius: '999px' }} />
        <div className="skeleton-bone" style={{ width: '60px', height: '34px', borderRadius: '999px' }} />
        <div className="skeleton-bone" style={{ width: '70px', height: '34px', borderRadius: '999px' }} />
      </div>
    </div>
  )
}
