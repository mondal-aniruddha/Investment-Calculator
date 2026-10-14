/**
 * CalcPageHeader — consistent page title block
 */
export function CalcPageHeader({ label, title, subtitle }) {
  return (
    <header className="calc-page-header">
      <span className="section-label">{label}</span>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}
