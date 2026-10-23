import {
  MoneyField,
  NumberField,
  SubmitButton,
  ErrorBox,
} from '../../../shared/components/ui/index'

export function LoanForm({ form, update, handleSubmit, loading, error, formErrors = {} }) {
  return (
    <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
      <MoneyField
        label="Loan principal (₹)"
        value={form.principal}
        onChange={update('principal')}
        min={1000}
        required
      />
      {formErrors.principal && (
        <span
          className="field-error-text"
          style={{ color: 'var(--error, #b83a3a)', fontSize: '12px' }}
        >
          {formErrors.principal}
        </span>
      )}

      <div className="field-row">
        <NumberField
          label="Tenure"
          value={form.tenureYears}
          suffix="years"
          onChange={update('tenureYears')}
          min={1}
          max={30}
        />
        <NumberField
          label="Interest rate"
          value={form.annualInterestRate}
          suffix="% p.a."
          onChange={update('annualInterestRate')}
          min={1}
          max={30}
          step={0.05}
        />
      </div>

      <SubmitButton loading={loading} label="Calculate EMI" />
      <ErrorBox text={error} />
    </form>
  )
}
