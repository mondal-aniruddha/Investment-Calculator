/**
 * SkeletonResult — loading placeholder for result card content
 */
export function SkeletonResult() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }} aria-busy="true" aria-label="Loading results">
      <div className="skeleton-bone" style={{ height: '14px', width: '40%' }} />
      <div className="skeleton-bone" style={{ height: '42px', width: '72%' }} />
      <div className="skeleton-bone" style={{ height: '12px', width: '55%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '8px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-bone" style={{ height: '10px', width: '60%' }} />
            <div className="skeleton-bone" style={{ height: '16px', width: '80%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
