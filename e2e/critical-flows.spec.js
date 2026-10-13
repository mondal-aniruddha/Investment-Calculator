import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'UP' }),
  }))
  await page.route('**/api/v1/investing/sip', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalInvested: 120000,
        maturityCorpus: 145000,
        estimatedReturns: 25000,
        assumptions: { financialYear: '2024-2025' },
      }),
    })
  })
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ metals: [], cacheStatus: 'LIVE' }),
    })
  })
})

test('investor can calculate a SIP and see the projection', async ({ page }) => {
  // SIP calculator lives at /sip in the new multi-page SPA
  await page.goto('/sip')
  await expect(page.getByRole('heading', { name: /sip.*step-up planner/i })).toBeVisible()
  await page.getByRole('button', { name: /^calculate/i }).click()
  await expect(page.getByText('₹1,45,000')).toBeVisible()
  await expect(page.getByText('Projected SIP corpus')).toBeVisible()
})

test('onboarding completes and offers calculator recommendations', async ({ page }) => {
  // Onboarding lives at /onboarding in the new multi-page SPA
  await page.goto('/onboarding')
  await expect(page.getByRole('heading', { name: /five-step money map/i })).toBeVisible()
  for (let step = 0; step < 5; step += 1) {
    const label = step === 4 ? /finish and see recommendations/i : /go to next step/i
    await page.getByRole('button', { name: label }).click()
  }
  await expect(page.getByRole('heading', { name: /start with these calculators/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sip/i }).first()).toBeVisible()
})
