/**
 * LiveMetalPrices — polls /api/v1/market/metals every 5 minutes.
 * Logic identical to original. Uses new design system classes.
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getApiUrl } from '../../services/api'
import { formatINRDecimal, formatKolkataTime } from '../../utils/format'
import { MetalSkeletonCard } from '../ui/index'

function StatusBadge({ status, t }) {
  if (status === 'LIVE')   return <span className="badge badge-success">● {t('metals.statusLive')}</span>
  if (status === 'CACHED') return <span className="badge badge-info">● {t('metals.statusCached')}</span>
  return <span className="badge badge-warning">▲ {t('metals.statusStale')}</span>
}

export function LiveMetalPrices() {
  const { t } = useTranslation()
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const fetchPrices = async (isManual = false, signal) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await fetch(getApiUrl('/api/v1/market/metals'), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal,
      })
      if (!res.ok) throw new Error(`Service returned ${res.status}`)
      const json = await res.json()
      setData(json)
      setUnavailable(false)
    } catch (err) {
      if (err.name === 'AbortError') return
      setData((prev) => {
        if (prev) return { ...prev, cacheStatus: 'STALE' }
        setUnavailable(true)
        return null
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let controller = new AbortController()
    let lastFetchTime = Date.now()
    const INTERVAL_MS = 5 * 60 * 1000

    fetchPrices(false, controller.signal)

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        controller.abort()
        controller = new AbortController()
        lastFetchTime = Date.now()
        fetchPrices(false, controller.signal)
      }
    }, INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastFetchTime >= INTERVAL_MS) {
          controller.abort()
          controller = new AbortController()
          lastFetchTime = Date.now()
          fetchPrices(false, controller.signal)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      controller.abort()
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const metalsList  = data?.metals || []
  const gold        = metalsList.find((m) => m.metalCode === 'XAU')
  const silver      = metalsList.find((m) => m.metalCode === 'XAG')
  const platinum    = metalsList.find((m) => m.metalCode === 'XPT')
  const palladium   = metalsList.find((m) => m.metalCode === 'XPD')
  const asOfTimestamp = gold?.sourceTimestamp || data?.fetchedAt

  return (
    <section className="card metals-section" aria-label={t('metals.title')}>
      <div className="metals-header">
        <div className="metals-title-group">
          <div className="section-label">{t('metals.eyebrow')}</div>
          <h2>{t('metals.title')}</h2>
        </div>
        <div className="metals-controls">
          {data && <StatusBadge status={data.cacheStatus} t={t} />}
          {asOfTimestamp && (
            <span className="metals-timestamp" title="Indian Standard Time (Asia/Kolkata)">
              {t('metals.lastUpdated')}: {formatKolkataTime(asOfTimestamp)}
            </span>
          )}
          <button
            className="btn-ghost"
            onClick={() => fetchPrices(true)}
            disabled={loading || refreshing}
            aria-label={t('metals.refresh')}
          >
            <span className={refreshing ? 'spin' : ''} aria-hidden="true">↻</span>
            {refreshing ? t('metals.refreshing') : t('metals.refresh')}
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="metals-grid" aria-busy="true">
          {[1, 2, 3, 4].map((i) => <MetalSkeletonCard key={i} />)}
        </div>
      )}

      {unavailable && !data && (
        <div className="metals-unavailable-card">
          <p>{t('metals.unavailable')}</p>
          <button className="btn btn-secondary" onClick={() => fetchPrices(true)} style={{ marginTop: '12px' }}>
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
            <span className="metals-source">{t('metals.source')}: {data.source || 'metals.dev'}</span>
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
          {formatINRDecimal(metal.pricePerGramInr)} <span className="unit">{t('metals.perGram')}</span>
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
