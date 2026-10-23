import { useTranslation } from 'react-i18next'

/**
 * DataState — Consistent Loading, Error, and Empty state component for data-driven pages.
 *
 * Props:
 * - loading: boolean
 * - error: Error | ApiError | string | null
 * - empty: boolean (true if data array is empty or null)
 * - emptyMessage: string
 * - emptySubtitle: string
 * - emptyIcon: string | ReactNode
 * - onRetry: () => void
 * - skeletonCount: number
 * - skeletonType: 'card' | 'list' | 'detail'
 * - children: ReactNode
 */
export function DataState({
  loading = false,
  error = null,
  empty = false,
  emptyMessage,
  emptySubtitle,
  emptyIcon = '🔍',
  onRetry,
  skeletonCount = 4,
  skeletonType = 'card',
  children,
}) {
  const { t } = useTranslation()

  if (loading) {
    if (skeletonType === 'detail') {
      return (
        <div className="card skeleton-card" style={{ padding: '32px 24px', margin: '20px 0' }}>
          <div
            className="skeleton-line"
            style={{ width: '30%', height: '16px', marginBottom: '16px' }}
          />
          <div
            className="skeleton-line"
            style={{ width: '80%', height: '32px', marginBottom: '20px' }}
          />
          <div
            className="skeleton-line"
            style={{ width: '100%', height: '16px', marginBottom: '10px' }}
          />
          <div
            className="skeleton-line"
            style={{ width: '95%', height: '16px', marginBottom: '10px' }}
          />
          <div
            className="skeleton-line"
            style={{ width: '90%', height: '16px', marginBottom: '10px' }}
          />
          <div className="skeleton-line" style={{ width: '60%', height: '16px' }} />
        </div>
      )
    }

    return (
      <div className={skeletonType === 'list' ? 'articles-list' : 'articles-grid'}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div key={idx} className="card skeleton-card" style={{ padding: '20px' }}>
            <div
              className="skeleton-line"
              style={{ width: '35%', height: '14px', marginBottom: '12px' }}
            />
            <div
              className="skeleton-line"
              style={{ width: '85%', height: '20px', marginBottom: '12px' }}
            />
            <div
              className="skeleton-line"
              style={{ width: '100%', height: '14px', marginBottom: '8px' }}
            />
            <div className="skeleton-line" style={{ width: '65%', height: '14px' }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    const errorText =
      typeof error === 'string'
        ? error
        : error?.message || t('errors.generic', 'An error occurred while loading data.')
    const correlationId = error?.correlationId

    return (
      <div
        className="card error-state-card"
        role="alert"
        style={{
          margin: '20px 0',
          padding: '24px',
          borderLeft: '4px solid var(--error, #b83a3a)',
          background: 'var(--bg-surface, #EDF1F4)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }} aria-hidden="true">
          ⚠️
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>
          {t('errors.loadFailedTitle', 'Failed to load content')}
        </h3>
        <p style={{ color: 'var(--ink-muted, #6b4f6a)', margin: '0 0 16px', fontSize: '14px' }}>
          {errorText}
        </p>

        {correlationId && (
          <p
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--ink-muted, #6b4f6a)',
              margin: '0 0 16px',
            }}
          >
            Ref: {correlationId}
          </p>
        )}

        {onRetry && (
          <button
            type="button"
            className="btn-primary"
            onClick={onRetry}
            style={{ padding: '8px 20px', cursor: 'pointer', fontSize: '13px' }}
          >
            {t('errors.retry', 'Try again')}
          </button>
        )}
      </div>
    )
  }

  if (empty) {
    return (
      <div
        className="card empty-state-card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          margin: '20px 0',
          background: 'var(--bg-surface, #EDF1F4)',
        }}
      >
        <span
          style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}
          aria-hidden="true"
        >
          {emptyIcon}
        </span>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>
          {emptyMessage || t('errors.emptyTitle', 'No records found')}
        </h3>
        <p style={{ color: 'var(--ink-muted, #6b4f6a)', margin: 0, fontSize: '14px' }}>
          {emptySubtitle ||
            t(
              'errors.emptySubtitle',
              'Try refining your search or selecting a different category.'
            )}
        </p>
      </div>
    )
  }

  return children
}

export default DataState
