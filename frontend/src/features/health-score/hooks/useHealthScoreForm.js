import { useState, useCallback } from 'react'

export const INITIAL_HEALTH_SCORE = {
  savingsRatePercent: 20,
  emergencyFundMonths: 4,
  debtToIncomePercent: 30,
  insuranceCoveragePercent: 60,
  creditUtilizationPercent: 25,
  retirementReadinessPercent: 45,
}

export function useHealthScoreForm(onCalculate, initialValues = INITIAL_HEALTH_SCORE) {
  const [form, setForm] = useState(initialValues)

  const update = useCallback((key) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [key]: val }))
  }, [])

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (onCalculate) {
      onCalculate('/api/v1/health-score/calculate', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    }
  }, [form, onCalculate])

  return { form, update, handleSubmit, setForm }
}
