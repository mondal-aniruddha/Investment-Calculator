import { useState } from 'react'
import { calculateQuickSip } from '../utils/quickSipCalculator'
import { useCountUp } from './useCountUp'

export function useQuickSipEstimator(initialMonthly = 10000, initialYears = 10, initialRate = 12) {
  const [monthly, setMonthly] = useState(initialMonthly)
  const [years, setYears] = useState(initialYears)
  const [rate, setRate] = useState(initialRate)

  const { totalInvested, maturityCorpus, estimatedReturns } = calculateQuickSip(monthly, years, rate)

  const animatedMaturity = useCountUp(maturityCorpus)
  const animatedInvested = useCountUp(totalInvested)
  const animatedReturns = useCountUp(estimatedReturns)

  return {
    monthly,
    setMonthly,
    years,
    setYears,
    rate,
    setRate,
    totalInvested,
    maturityCorpus,
    estimatedReturns,
    animatedMaturity,
    animatedInvested,
    animatedReturns,
  }
}
