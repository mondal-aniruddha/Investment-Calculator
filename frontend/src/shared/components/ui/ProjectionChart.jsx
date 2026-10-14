/**
 * ProjectionChart — pure-CSS bar chart from an array of { year, value } points
 */
import { formatINR } from '../../lib/format'

export function ProjectionChart({ points = [], title = 'Projection' }) {
  const max = Math.max(...points.map((p) => Number(p.value || p.principalBalance || 0)), 1)
  return (
    <div className="card projection-chart" role="img" aria-label={`${title} chart`}>
      {points.length > 0 ? (
        points.map((p) => (
          <div className="bar-wrap" key={p.year ?? p.month}>
            <div
              className="bar"
              style={{
                height: `${Math.max(6, (Number(p.value || p.principalBalance || 0) / max) * 100)}%`,
              }}
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
