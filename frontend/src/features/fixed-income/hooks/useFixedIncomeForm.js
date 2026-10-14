import { useState, useCallback } from 'react'

export const INITIAL_FIXED_INCOME_FORM = {
  scheme: 'FD',
  contribution: 100000,
  tenureYears: 5,
  annualRate: '',
  taxRate: 20,
  inflationRate: 6,
}

export function useFixedIncomeForm(onCalculate, initialValues = INITIAL_FIXED_INCOME_FORM) {
  const [form, setForm] = useState(initialValues)

  const update = useCallback((key) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [key]: val }))
  }, [])

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault()
    const body = {
      ...form,
      annualRate: form.annualRate === '' ? null : Number(form.annualRate),
    }
    if (onCalculate) {
      onCalculate('/api/v1/fixed-income/calculate', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }
  }, [form, onCalculate])

  return {
    form,
    update,
    handleSubmit,
    setForm,
  }
}
