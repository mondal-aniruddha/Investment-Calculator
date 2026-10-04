/**
 * Reusable UI primitives for InFinance.
 * Button, Card, MoneyInput, NumberInput, SubmitButton, ErrorBox,
 * EmptyState, SkeletonCard, Tips, HowItWorks, ProjectionChart.
 */
import { forwardRef } from 'react'
import { formatINR } from '../../utils/format'

// --------------------------------------------------------------------------
// MoneyField — ₹ prefix input (number type)
// --------------------------------------------------------------------------
export function MoneyField({ label, value, onChange, id, required, min = 0 }) {
  const fieldId = id || `money-${label?.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label htmlFor={fieldId}>
      {label}
      <div className="input-row">
        <span className="input-prefix" aria-hidden="true">₹</span>
        <input
          id={fieldId}
          type="number"
          min={min}
          value={value}
          onChange={onChange}
          required={required}
          aria-label={label}
        />
      </div>
    </label>
  )
}

// --------------------------------------------------------------------------
// NumberField — number input with a unit suffix
// --------------------------------------------------------------------------
export function NumberField({ label, value, suffix, onChange, id, min = 0, max, step = 0.1, required }) {
  const fieldId = id || `num-${label?.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label htmlFor={fieldId}>
      {label}
      <div className="input-row">
        <input
          id={fieldId}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          required={required}
          aria-label={label}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </label>
  )
}

// --------------------------------------------------------------------------
// SelectField — labelled <select>
// --------------------------------------------------------------------------
export function SelectField({ label, value, onChange, id, children }) {
  const fieldId = id || `sel-${label?.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label htmlFor={fieldId}>
      {label}
      <select id={fieldId} value={value} onChange={onChange}>
        {children}
      </select>
    </label>
  )
}

// --------------------------------------------------------------------------
// SubmitButton — primary button with loading state
// --------------------------------------------------------------------------
export function SubmitButton({ loading, label = 'Calculate' }) {
  return (
    <button className="btn btn-primary" disabled={loading} type="submit">
      <span>{loading ? 'Calculating…' : label}</span>
      {!loading && <span aria-hidden="true">→</span>}
      {loading && <span className="spin" aria-hidden="true">↻</span>}
    </button>
  )
}

// --------------------------------------------------------------------------
// ActionButton — generic full-width primary button
// --------------------------------------------------------------------------
export function ActionButton({ loading, onClick, children, loadingLabel = 'Running…' }) {
  return (
    <button className="btn btn-primary" disabled={loading} onClick={onClick} type="button">
      <span>{loading ? loadingLabel : children}</span>
      {!loading && <span aria-hidden="true">→</span>}
      {loading && <span className="spin" aria-hidden="true">↻</span>}
    </button>
  )
}

// --------------------------------------------------------------------------
// ErrorBox — validation / API error display
// --------------------------------------------------------------------------
export function ErrorBox({ text }) {
  if (!text) return null
  return (
    <div className="error-box" role="alert">
      <span aria-hidden="true">⚠ </span>{text}
    </div>
  )
}

// --------------------------------------------------------------------------
// EmptyState — friendly placeholder before calculations run
// --------------------------------------------------------------------------
export function EmptyState({ icon = '📊', message = 'Enter your assumptions and calculate to see results.' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <p>{message}</p>
    </div>
  )
}

// --------------------------------------------------------------------------
// SkeletonResult — loading placeholder for result card content
// --------------------------------------------------------------------------
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

// --------------------------------------------------------------------------
// MetalSkeletonCard — loading placeholder for a single metal price tile
// --------------------------------------------------------------------------
export function MetalSkeletonCard() {
  return (
    <div className="metal-skeleton-card">
      <div className="skeleton-bone" style={{ height: '12px', width: '45%' }} />
      <div className="skeleton-bone" style={{ height: '24px', width: '75%', marginTop: '4px' }} />
      <div className="skeleton-bone" style={{ height: '18px', width: '60%' }} />
    </div>
  )
}

// --------------------------------------------------------------------------
// ProjectionChart — pure-CSS bar chart from an array of { year, value } points
// --------------------------------------------------------------------------
export function ProjectionChart({ points = [], title = 'Projection' }) {
  const max = Math.max(...points.map((p) => Number(p.value || p.principalBalance || 0)), 1)
  return (
    <div className="card projection-chart" role="img" aria-label={`${title} chart`}>
      {points.length > 0 ? (
        points.map((p) => (
          <div className="bar-wrap" key={p.year ?? p.month}>
            <div
              className="bar"
              style={{ height: `${Math.max(6, (Number(p.value || p.principalBalance || 0) / max) * 100)}%` }}
              title={formatINR(p.value || p.principalBalance)}
              role="presentation"
            />
            <span>{p.year ?? p.month}</span>
          </div>
        ))
      ) : (
        <span className="chart-empty">Run the calculator to see the chart.</span>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// HowItWorks — educational disclaimer card below each calculator
// --------------------------------------------------------------------------
export function HowItWorks({ text }) {
  return (
    <div className="tips-section">
      <span className="section-label">How it works</span>
      <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: '1.65', margin: 0 }}>{text}</p>
      <p className="tips-disclaimer">
        For education only. Not investment, tax, legal, or financial advice. Verify all rates with official sources before making decisions.
      </p>
    </div>
  )
}

// --------------------------------------------------------------------------
// TipsCard — 3-bullet tips section below each calculator
// --------------------------------------------------------------------------
export function TipsCard({ tips = [] }) {
  if (!tips.length) return null
  return (
    <div className="tips-section">
      <span className="section-label">💡 Tips</span>
      <ul className="tips-list">
        {tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
      <p className="tips-disclaimer">
        Educational guidance only. Consult a SEBI-registered financial advisor or Chartered Accountant for personalised advice.
      </p>
    </div>
  )
}

// --------------------------------------------------------------------------
// CalculatorLayout — 2-column layout (form left, results right)
// --------------------------------------------------------------------------
export function CalculatorLayout({ children }) {
  return (
    <div className="calculator-layout">
      {children}
    </div>
  )
}

// --------------------------------------------------------------------------
// CalcPageHeader — consistent page title block
// --------------------------------------------------------------------------
export function CalcPageHeader({ label, title, subtitle }) {
  return (
    <header className="calc-page-header">
      <span className="section-label">{label}</span>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}
