import {
  MoneyField, NumberField, SubmitButton, ErrorBox
} from '../../../shared/components/ui/index'

export function MutualFundForm({ form, update, handleSubmit, loading, error }) {
  return (
    <form className="card calculator-card" onSubmit={handleSubmit} noValidate>
      <MoneyField
        label="Starting corpus (₹)"
        value={form.initialCorpus}
        onChange={update('initialCorpus')}
        min={10000}
        required
      />
      <div className="field-row">
        <NumberField
          label="Expected return"
          value={form.annualReturn}
          suffix="% p.a."
          onChange={update('annualReturn')}
          min={1} max={30}
        />
        <MoneyField
          label="Monthly withdrawal (₹)"
          value={form.monthlyWithdrawal}
          onChange={update('monthlyWithdrawal')}
          min={100}
        />
      </div>
      <div className="field-row">
        <NumberField
          label="Tenure"
          value={form.tenureYears}
          suffix="years"
          onChange={update('tenureYears')}
          min={1} max={50}
        />
        <NumberField
          label="Annual withdrawal step-up"
          value={form.annualWithdrawalIncrease}
          suffix="%"
          onChange={update('annualWithdrawalIncrease')}
          min={0} max={30}
        />
      </div>
      <SubmitButton loading={loading} label="Run SWP projection" />
      <ErrorBox text={error} />
    </form>
  )
}
