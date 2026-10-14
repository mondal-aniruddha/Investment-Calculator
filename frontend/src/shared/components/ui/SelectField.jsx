/**
 * SelectField — labelled <select>
 */
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
