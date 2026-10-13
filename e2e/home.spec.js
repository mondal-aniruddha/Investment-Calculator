import { test, expect } from '@playwright/test'

const mockMetalsLive = {
  metals: [
    {
      metalCode: 'XAU',
      symbol: 'XAU',
      displayName: 'Gold (24K Reference)',
      purity: '99.9%',
      pricePerGramInr: 7450.0,
      pricePer10GramsInr: 74500.0,
      indicative22kPerGramInr: 6830.0,
      indicative22kPer10GramsInr: 68300.0,
      sourceTimestamp: '2026-10-13T10:00:00.000Z',
      fetchedAt: '2026-10-13T10:00:00.000Z',
      cacheStatus: 'LIVE',
      source: 'metals.dev',
      disclaimer: 'Indicative MCX reference prices for planning.',
    },
    {
      metalCode: 'XAG',
      symbol: 'XAG',
      displayName: 'Silver (99.9%)',
      purity: '99.9%',
      pricePerGramInr: 92.5,
      pricePer10GramsInr: 925.0,
      indicative22kPerGramInr: null,
      indicative22kPer10GramsInr: null,
      sourceTimestamp: '2026-10-13T10:00:00.000Z',
      fetchedAt: '2026-10-13T10:00:00.000Z',
      cacheStatus: 'LIVE',
      source: 'metals.dev',
      disclaimer: 'Indicative MCX reference prices for planning.',
    },
  ],
  fetchedAt: '2026-10-13T10:00:00.000Z',
  cacheStatus: 'LIVE',
  source: 'metals.dev',
  disclaimer: 'Indicative reference prices for planning.',
}

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'UP' }),
    })
  )
})

test('loads "/" and asserts h1 and all main sections are visible', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMetalsLive),
    })
  })

  await page.goto('/')

  // 1. Hero
  const h1 = page.locator('h1#hero-title')
  await expect(h1).toBeVisible()
  await expect(h1).toHaveText(/plan your money with clarity/i)
  await expect(page.getByRole('button', { name: /start a sip plan/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /explore the learn hub/i })).toBeVisible()
  await expect(page.getByLabel('Illustrative SIP projection card')).toBeVisible()

  // 2. Trust strip
  await expect(page.getByText(/free to use/i)).toBeVisible()
  await expect(page.getByText(/inr & indian number formatting/i)).toBeVisible()
  await expect(page.getByText(/educational, not advice/i)).toBeVisible()

  // 3. Calculator grid
  await expect(page.getByRole('heading', { name: /financial calculators for india/i })).toBeVisible()
  const calcGrid = page.locator('.calc-grid-container')
  await expect(calcGrid.getByRole('link', { name: /sip & lumpsum/i })).toBeVisible()
  await expect(calcGrid.getByRole('link', { name: /loan & emi/i })).toBeVisible()
  await expect(calcGrid.getByRole('link', { name: /fixed income/i })).toBeVisible()
  await expect(calcGrid.getByRole('link', { name: /mutual fund tools/i })).toBeVisible()

  // 4. Quick calculator teaser
  await expect(page.getByRole('heading', { name: /interactive sip estimator/i })).toBeVisible()
  await expect(page.getByLabel(/monthly investment/i)).toBeVisible()
  await expect(page.getByLabel(/time horizon/i)).toBeVisible()
  await expect(page.getByLabel(/expected annual return/i)).toBeVisible()
  await expect(page.getByText(/see full plan in sip planner/i)).toBeVisible()

  // 5. How it works
  await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /enter your numbers/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /see explainable results with scenarios/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /save, compare and export/i })).toBeVisible()

  // 6. Why InFinance
  await expect(page.getByRole('heading', { name: /built with purpose and integrity/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Explainable results', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: /scenario comparison/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /multilingual & accessible/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /privacy-minded/i })).toBeVisible()

  // 7. Live metals reference prices
  await expect(page.getByLabel('Live metal prices')).toBeVisible()

  // 8. Learn Hub / Roadmap teaser
  await expect(page.getByRole('heading', { name: /from our learn hub/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /follow the 6-step beginner roadmap/i })).toBeVisible()

  // 9. Disclaimer
  await expect(page.getByLabel('Educational Disclaimer')).toBeVisible()
})

test('primary and secondary CTAs navigate correctly', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMetalsLive),
    })
  })

  await page.goto('/')

  // Primary CTA navigates to SIP planner
  await page.getByRole('button', { name: /start a sip plan/i }).click()
  await expect(page).toHaveURL(/.*\/sip/)
  await expect(page.getByRole('heading', { name: /sip & step-up planner/i })).toBeVisible()

  // Go back and click secondary CTA
  await page.goto('/')
  await page.getByRole('button', { name: /explore the learn hub/i }).click()
  await expect(page).toHaveURL(/.*\/learn/)
  await expect(page.getByRole('heading', { name: /money made simple/i })).toBeVisible()
})

test('renders gracefully and remains operational when /api/v1/market/metals returns 503', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service Unavailable' }),
    })
  })

  await page.goto('/')

  // Confirm page is not blank
  await expect(page.locator('h1#hero-title')).toBeVisible()
  await expect(page.locator('h1#hero-title')).toHaveText(/plan your money with clarity/i)

  // Metals panel should display calm unavailable card without throwing runtime errors
  await expect(page.getByText(/metal reference prices are temporarily unavailable/i)).toBeVisible()
  await expect(page.getByText(/indicative reference prices, not a jeweller's retail rate/i).first()).toBeVisible()

  // Calculators and other sections must still be fully visible
  await expect(page.getByRole('heading', { name: /financial calculators for india/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /interactive sip estimator/i })).toBeVisible()
})

test('interactive quick SIP estimator slider updates calculations dynamically', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMetalsLive),
    })
  })

  await page.goto('/')

  const monthlySlider = page.getByLabel(/monthly investment/i)
  await expect(monthlySlider).toBeVisible()

  // Default at ₹10,000 for 10 yrs at 12% is ~₹23.23 Lakh
  await expect(page.locator('.result-total-amount')).toContainText('₹23')

  // Change monthly investment to 25000
  await monthlySlider.fill('25000')
  // Value should now be higher (~₹58 Lakh)
  await expect(page.locator('.result-total-amount')).toContainText('₹58')
})
