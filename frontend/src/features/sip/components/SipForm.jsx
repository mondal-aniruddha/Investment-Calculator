import {
  MoneyField,
  NumberField,
  SelectField,
  SubmitButton,
  ErrorBox,
} from '../../../shared/components/ui/index'

export function SipForm({ form, update, handleSubmit, loading, error, formErrors = {} }) {
  return (
    <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
      <MoneyField
        label="Monthly investment (₹)"
        value={form.monthlyInvestment}
        onChange={update('monthlyInvestment')}
        min={100}
        required
      />
      {formErrors.monthlyInvestment && (
        <span
          className="field-error-text"
          style={{ color: 'var(--error, #b83a3a)', fontSize: '12px' }}
        >
          {formErrors.monthlyInvestment}
        </span>
      )}

      <div className="field-row">
        <NumberField
          label="Time horizon"
          value={form.investmentHorizonYears}
          suffix="years"
          onChange={update('investmentHorizonYears')}
          min={1}
          max={50}
        />
        <NumberField
          label="Expected return"
          value={form.expectedAnnualReturn}
          suffix="% p.a."
          onChange={update('expectedAnnualReturn')}
          min={1}
          max={30}
        />
      </div>

      <NumberField
        label="Annual step-up"
        value={form.annualStepUpPercent}
        suffix="%"
        onChange={update('annualStepUpPercent')}
        min={0}
        max={50}
      />

      <SelectField label="Risk profile" value={form.riskProfile} onChange={update('riskProfile')}>
        <option value="LOW">Low</option>
        <option value="MODERATE">Moderate</option>
        <option value="AGGRESSIVE">Aggressive</option>
      </SelectField>

      <SubmitButton loading={loading} label="Calculate SIP corpus" />
      <ErrorBox text={error} />
    </form>
  )
}
