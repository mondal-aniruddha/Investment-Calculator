/**
 * NumberField — number input with a unit suffix
 */
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
