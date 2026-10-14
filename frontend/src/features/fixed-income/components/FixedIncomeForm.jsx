import {
  MoneyField, NumberField, SelectField, SubmitButton, ErrorBox
} from '../../../shared/components/ui/index'

const SCHEME_LABELS = {
  FD: 'Fixed Deposit (FD)',
  RD: 'Recurring Deposit (RD)',
  PPF: 'Public Provident Fund (PPF)',
  EPF: 'Employee Provident Fund (EPF)',
  NPS: 'National Pension System (NPS)',
  SSY: 'Sukanya Samriddhi Yojana (SSY)',
  POST_OFFICE: 'Post Office Time Deposit',
}

export function FixedIncomeForm({ form, update, handleSubmit, loading, error }) {
  return (
    <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
      <SelectField label="Scheme" value={form.scheme} onChange={update('scheme')}>
        {Object.entries(SCHEME_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </SelectField>

      <MoneyField
        label={form.scheme === 'RD' ? 'Monthly contribution (₹)' : 'Contribution (₹)'}
        value={form.contribution}
        onChange={update('contribution')}
        min={100}
        required
      />

      <div className="field-row">
        <NumberField
          label="Tenure"
          value={form.tenureYears}
          suffix="years"
          onChange={update('tenureYears')}
          min={1} max={50}
        />
        <NumberField
          label="Your tax rate"
          value={form.taxRate}
          suffix="%"
          onChange={update('taxRate')}
          min={0} max={42}
        />
      </div>

      <NumberField
        label="Override rate (leave blank for official rate)"
        value={form.annualRate}
        suffix="% p.a."
        onChange={update('annualRate')}
        min={0} max={30}
      />

      <NumberField
        label="Assumed inflation rate"
        value={form.inflationRate}
        suffix="%"
        onChange={update('inflationRate')}
        min={0} max={20}
      />

      <SubmitButton loading={loading} label="Calculate maturity value" />
      <ErrorBox text={error} />
    </form>
  )
}
