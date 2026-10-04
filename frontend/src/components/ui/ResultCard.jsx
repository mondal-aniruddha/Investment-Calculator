/**
 * ResultCard — displays calculation results with AI explain + PDF/Excel export.
 * Logic identical to the original ResultCard in main.jsx.
 * Moved to its own file for clarity.
 */
import { useState } from 'react'
import { request, getApiUrl } from '../../services/api'
import { formatINR } from '../../utils/format'
import { SkeletonResult, EmptyState } from './index'

export function ResultCard({ result, primary, invested, returns, title, loading }) {
  const [insight, setInsight] = useState(null)
  const [busy, setBusy]       = useState(false)

  if (loading) {
    return (
      <div className="card result-card">
        <span className="section-label result-card-label">YOUR ESTIMATE</span>
        <SkeletonResult />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="card result-card">
        <span className="section-label result-card-label">YOUR ESTIMATE</span>
        <EmptyState icon="🧮" message="Enter your assumptions above and hit Calculate." />
      </div>
    )
  }

  const explain = async () => {
    setBusy(true)
    try {
      const response = await request('/api/v1/insights/explain', {
        method: 'POST',
        body: JSON.stringify({ calculationResult: result }),
      })
      setInsight(response.explanation || response.status)
    } catch (error) {
      setInsight(error.message)
    } finally {
      setBusy(false)
    }
  }

  const download = async (format) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/reports/${format}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportTitle: title,
          calculatorResults: { result },
          assumptions: result?.assumptions || {},
        }),
      })
      if (!response.ok) {
        setInsight(`Report export failed (${response.status}).`)
        return
      }
      const blob = await response.blob()
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `infinance-${format}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setInsight(e.message)
    }
  }

  return (
    <div className="card result-card">
      <span className="section-label result-card-label">YOUR ESTIMATE</span>

      <p className="result-primary">{formatINR(result[primary])}</p>
      <p className="result-subtitle">{title}</p>

      <div className="metric-grid">
        <div>
          <span>Invested / paid</span>
          <strong>{formatINR(result[invested])}</strong>
        </div>
        <div>
          <span>Returns / interest</span>
          <strong className="green">{formatINR(result[returns])}</strong>
        </div>
        <div>
          <span>Assumptions</span>
          <strong>{result?.assumptions?.financialYear || 'Configured'}</strong>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn-ghost" onClick={explain} disabled={busy} aria-label="Get AI explanation of these results">
          {busy ? <><span className="spin">↻</span> Explaining…</> : '✦ Explain my results'}
        </button>
        <button className="btn-ghost" onClick={() => download('pdf')} aria-label="Download PDF report">
          ↓ PDF
        </button>
        <button className="btn-ghost" onClick={() => download('excel')} aria-label="Download Excel report">
          ↓ Excel
        </button>
      </div>

      {insight && (
        <p className="insight-text" role="status">
          {insight}
        </p>
      )}
    </div>
  )
}
