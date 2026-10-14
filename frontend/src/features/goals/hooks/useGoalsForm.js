import { useState, useCallback } from 'react'

export const DEFAULT_GOALS_JSON =
  '[{"name":"Home","targetAmount":3000000,"monthsUntilGoal":120,"priority":1,"expectedAnnualReturn":10,"currentSavings":500000}]'

export function useGoalsForm(onCalculate, setFieldError) {
  const [availableMonthlySavings, setAvailableMonthlySavings] = useState(25000)
  const [goalsJson, setGoalsJson] = useState(DEFAULT_GOALS_JSON)

  const handleSubmit = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault()
      try {
        const parsedGoals = JSON.parse(goalsJson)
        if (onCalculate) {
          onCalculate('/api/v1/goals/plan', {
            method: 'POST',
            body: JSON.stringify({
              goals: parsedGoals,
              availableMonthlySavings,
            }),
          })
        }
      } catch {
        setFieldError?.('goals', 'Invalid JSON syntax in goals input.')
      }
    },
    [goalsJson, availableMonthlySavings, onCalculate, setFieldError]
  )

  return {
    goalsJson,
    setGoalsJson,
    availableMonthlySavings,
    setAvailableMonthlySavings,
    handleSubmit,
  }
}
