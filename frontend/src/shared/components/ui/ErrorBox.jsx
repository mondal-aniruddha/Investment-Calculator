/**
 * ErrorBox — validation / API error display
 */
export function ErrorBox({ text }) {
  if (!text) return null
  return (
    <div className="error-box" role="alert">
      <span aria-hidden="true">⚠ </span>{text}
    </div>
  )
}
