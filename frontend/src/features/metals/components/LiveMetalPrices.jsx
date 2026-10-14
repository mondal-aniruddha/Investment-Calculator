/**
 * LiveMetalPrices — shows live / cached metal prices.
 *
 * Phase 5: polling state replaced by useMetalsQuery (React Query).
 *  - No more manual useState / useEffect / setInterval boilerplate
 *  - Background refetch every 5 minutes, paused when tab is hidden
 *  - Manual refresh delegates to query.refetch()
 */
import { useTranslation } from 'react-i18next'
import { formatINRDecimal, formatKolkataTime } from '../../../shared/lib/format'
import { MetalSkeletonCard } from '../../../shared/components/ui/index'
import { useMetalsQuery } from '../hooks/useMetalsQuery'

function StatusBadge({ status, t }) {
  if (status === 'LIVE')
    return <span className="badge badge-success">● {t('metals.statusLive')}</span>
  if (status === 'CACHED')
    return <span className="badge badge-info">● {t('metals.statusCached')}</span>
  return <span className="badge badge-warning">▲ {t('metals.statusStale')}</span>
}

export function LiveMetalPrices() {
  const { t } = useTranslation()
  const { data, isLoading, isFetching, isError, refetch } = useMetalsQuery()

  const unavailable = isError && !data

  // When a refetch fails but we still have prior data, show the data as STALE
  // (same semantic as the old component which set cacheStatus: 'STALE' on error)
  const effectiveCacheStatus = isError && data ? 'STALE' : data?.cacheStatus

  const metalsList = data?.metals || []
  const gold = metalsList.find((m) => m.metalCode === 'XAU')
  const silver = metalsList.find((m) => m.metalCode === 'XAG')
  const platinum = metalsList.find((m) => m.metalCode === 'XPT')
  const palladium = metalsList.find((m) => m.metalCode === 'XPD')
  const asOfTimestamp = gold?.sourceTimestamp || data?.fetchedAt

  return (
    <section className="card metals-section" aria-label={t('metals.title')}>
      <div className="metals-header">
        <div className="metals-title-group">
          <div className="section-label">{t('metals.eyebrow')}</div>
          <h2>{t('metals.title')}</h2>
          <small
            className="metals-retail-note"
            style={{
              color: 'var(--ink-muted)',
              display: 'block',
              marginTop: '2px',
              fontSize: '0.78rem',
            }}
          >
            {t('home.metals.note', "Indicative reference prices, not a jeweller's retail rate.")}
          </small>
        </div>
        <div className="metals-controls">
          {data && <StatusBadge status={effectiveCacheStatus} t={t} />}
          {asOfTimestamp && (
            <span className="metals-timestamp" title="Indian Standard Time (Asia/Kolkata)">
              {t('metals.lastUpdated')}: {formatKolkataTime(asOfTimestamp)}
            </span>
          )}
          <button
            className="btn-ghost"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            aria-label={t('metals.refresh')}
          >
            <span className={isFetching ? 'spin' : ''} aria-hidden="true">
              ↻
            </span>
            {isFetching ? t('metals.refreshing') : t('metals.refresh')}
          </button>
        </div>
      </div>

      {isLoading && !data && (
        <div className="metals-grid" aria-busy="true" aria-label="Loading metal prices">
          {[1, 2, 3, 4].map((i) => (
            <MetalSkeletonCard key={i} />
          ))}
        </div>
      )}

      {unavailable && (
        <div className="metals-unavailable-card">
          <p>{t('metals.unavailable')}</p>
          <small style={{ color: 'var(--ink-faint)', display: 'block', marginTop: '4px' }}>
            {t('home.metals.note', "Indicative reference prices, not a jeweller's retail rate.")}
          </small>
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            style={{ marginTop: '12px' }}
          >
            {t('metals.retry')}
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="metals-grid">
            {gold && <MetalTile metal={gold} className="gold-card" t={t} />}
            {silver && <MetalTile metal={silver} t={t} />}
            {platinum && <MetalTile metal={platinum} t={t} />}
            {palladium && <MetalTile metal={palladium} t={t} />}
          </div>
          <div className="metals-footer">
            <span className="metals-source">
              {t('metals.source')}: {data.source || 'metals.dev'}
            </span>
            <span className="metals-disclaimer">{data.disclaimer || t('metals.disclaimer')}</span>
          </div>
        </>
      )}
    </section>
  )
}

function MetalTile({ metal, className = '', t }) {
  return (
    <article className={`card metal-card ${className}`} aria-label={metal.displayName}>
      <div>
        <div className="metal-card-header">
          <span className="metal-code">{metal.metalCode}</span>
          <span className="metal-purity">{metal.purity}</span>
        </div>
        <h3 className="metal-name">{metal.displayName}</h3>
        <div className="metal-price-primary">
          {formatINRDecimal(metal.pricePerGramInr)}{' '}
          <span className="unit">{t('metals.perGram')}</span>
        </div>
        {metal.pricePer10GramsInr && (
          <div className="metal-price-secondary">
            {formatINRDecimal(metal.pricePer10GramsInr)} {t('metals.per10Grams')}
          </div>
        )}
      </div>
      {metal.indicative22kPerGramInr && (
        <div className="metal-indicative-box">
          <span className="metal-indicative-rate">
            {t('metals.indicative22k')}: {formatINRDecimal(metal.indicative22kPerGramInr)}
          </span>
          <small className="metal-indicative-note">{t('metals.indicative22kNote')}</small>
        </div>
      )}
    </article>
  )
}
