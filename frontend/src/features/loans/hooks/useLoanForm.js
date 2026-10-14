import { useState, useCallback } from 'react'
import { validateLoanInput } from '../../../shared/lib/validators'

export const INITIAL_LOAN_FORM = {
  principal: 2500000,
  tenureYears: 20,
  annualInterestRate: 8.5,
}

export function useLoanForm(onCalculate, initialValues = INITIAL_LOAN_FORM) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const update = useCallback((key) => (e) => {
    const val = Number(e.target.value)
    setForm((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault()
    const validation = validateLoanInput(form)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return false
    }
    setErrors({})
    if (onCalculate) {
      onCalculate('/api/v1/loans/emi', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    }
    return true
  }, [form, onCalculate])

  return {
    form,
    errors,
    update,
    handleSubmit,
    setForm,
  }
}
