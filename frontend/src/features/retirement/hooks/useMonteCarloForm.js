import { useState, useCallback } from 'react'

export const INITIAL_MONTE_CARLO = {
  initialCorpus: 500000,
  monthlyContribution: 25000,
  years: 15,
  expectedAnnualReturn: 10,
  annualVolatility: 12,
  inflationRate: 6,
  targetCorpus: 10000000,
  runs: 1000,
  seed: 42,
}

export function useMonteCarloForm(onCalculate, initialValues = INITIAL_MONTE_CARLO) {
  const [form, setForm] = useState(initialValues)

  const update = useCallback(
    (key) => (e) => {
      const val = Number(e.target.value)
      setForm((prev) => ({ ...prev, [key]: val }))
    },
    []
  )

  const handleSubmit = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault()
      if (onCalculate) {
        onCalculate('/api/v1/simulations/monte-carlo', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }
    },
    [form, onCalculate]
  )

  return { form, update, handleSubmit, setForm }
}
