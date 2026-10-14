/**
 * MoneyField — ₹ prefix input (number type)
 */
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
