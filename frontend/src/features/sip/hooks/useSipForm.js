import { useState, useCallback } from 'react'
import { validateSipInput } from '../../../shared/lib/validators'

export const INITIAL_SIP_FORM = {
  monthlyInvestment: 10000,
  investmentHorizonYears: 10,
  expectedAnnualReturn: 12,
  annualStepUpPercent: 10,
  riskProfile: 'MODERATE',
}

export function useSipForm(onCalculate, initialValues = INITIAL_SIP_FORM) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const update = useCallback(
    (key) => (e) => {
      const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
      setForm((prev) => ({ ...prev, [key]: val }))
      setErrors((prev) => {
        if (!prev[key]) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    []
  )

  const handleSubmit = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault()
      const validation = validateSipInput(form)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return false
      }
      setErrors({})
      if (onCalculate) {
        onCalculate('/api/v1/investing/sip', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }
      return true
    },
    [form, onCalculate]
  )

  const resetForm = useCallback(() => {
    setForm(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    form,
    errors,
    update,
    handleSubmit,
    resetForm,
    setForm,
  }
}
