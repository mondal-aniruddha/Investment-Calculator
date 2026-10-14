import { useState, useCallback } from 'react'

export const INITIAL_SWP_FORM = {
  initialCorpus: 1000000,
  annualReturn: 10,
  monthlyWithdrawal: 10000,
  tenureYears: 10,
  annualWithdrawalIncrease: 5,
}

export function useMutualFundForm(onCalculate, initialValues = INITIAL_SWP_FORM) {
  const [form, setForm] = useState(initialValues)

  const update = useCallback(
    (key) => (e) => {
      setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))
    },
    []
  )

  const handleSubmit = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault()
      if (onCalculate) {
        onCalculate('/api/v1/mutual-funds/swp', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }
    },
    [form, onCalculate]
  )

  return {
    form,
    update,
    handleSubmit,
    setForm,
  }
}
