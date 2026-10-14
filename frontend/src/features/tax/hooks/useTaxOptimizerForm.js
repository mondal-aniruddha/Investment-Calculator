import { useState, useCallback } from 'react'

export const INITIAL_TAX_OPTIMIZER = {
  grossSalary: 1500000,
  section80C: 50000,
  section80DMedicalInsurance: 0,
  section80CCD1BNps: 0,
}

export function useTaxOptimizerForm(onCalculate, initialValues = INITIAL_TAX_OPTIMIZER) {
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
        onCalculate('/api/v1/tax/optimizer', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }
    },
    [form, onCalculate]
  )

  return { form, update, handleSubmit, setForm }
}
