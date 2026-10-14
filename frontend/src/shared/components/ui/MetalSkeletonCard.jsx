/**
 * MetalSkeletonCard — loading placeholder for a single metal price tile
 */
export function MetalSkeletonCard() {
  return (
    <div className="metal-skeleton-card">
      <div className="skeleton-bone" style={{ height: '12px', width: '45%' }} />
      <div className="skeleton-bone" style={{ height: '24px', width: '75%', marginTop: '4px' }} />
      <div className="skeleton-bone" style={{ height: '18px', width: '60%' }} />
    </div>
  )
}
