import { useState, useCallback } from 'react'

export const INITIAL_NET_WORTH = {
  assets: '[{"category":"Equity","amount":500000}]',
  liabilities: '[{"category":"Loan","amount":200000}]',
  history: '[{"date":"2025-01-01","netWorth":300000}]',
}

export function useNetWorthForm(onCalculate, setFieldError) {
  const [form, setForm] = useState(INITIAL_NET_WORTH)

  const update = useCallback((key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }, [])

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault()
    try {
      const body = {
        assets: JSON.parse(form.assets),
        liabilities: JSON.parse(form.liabilities),
        history: JSON.parse(form.history),
      }
      if (onCalculate) {
        onCalculate('/api/v1/net-worth/calculate', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
    } catch {
      setFieldError?.('networth', 'Invalid JSON syntax in assets, liabilities, or history.')
    }
  }, [form, onCalculate, setFieldError])

  return { form, update, handleSubmit, setForm }
}
