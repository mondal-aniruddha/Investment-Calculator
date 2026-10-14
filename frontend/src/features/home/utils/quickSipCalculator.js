/**
 * Pure calculation function for quick SIP projection.
 * Standard SIP Future Value:
 * M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
 */
export function calculateQuickSip(monthly, years, rate) {
  const m = Number(monthly) || 0
  const y = Number(years) || 0
  const r = Number(rate) || 0

  const months = y * 12
  const monthlyRate = r / 100 / 12
  const totalInvested = m * months
  const maturityCorpus =
    monthlyRate > 0
      ? Math.round(m * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
      : totalInvested
  const estimatedReturns = Math.max(0, maturityCorpus - totalInvested)

  return {
    months,
    monthlyRate,
    totalInvested,
    maturityCorpus,
    estimatedReturns,
  }
}
