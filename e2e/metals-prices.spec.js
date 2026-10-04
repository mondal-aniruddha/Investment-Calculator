import { test, expect } from '@playwright/test'

const mockMetalsLive = {
  metals: [
    {
      metalCode: 'XAU',
      symbol: 'XAU',
      displayName: 'Gold (MCX)',
      purity: 'MCX Reference (99.5%)',
      pricePerGramInr: 15039.00,
      pricePer10GramsInr: 150390.00,
      indicative22kPerGramInr: 13785.75,
      indicative22kPer10GramsInr: 137857.50,
      sourceTimestamp: '2026-10-04T05:50:04.579Z',
      fetchedAt: '2026-10-04T05:50:04.579Z',
      cacheStatus: 'LIVE',
      source: 'metals.dev',
      disclaimer: 'Indicative MCX reference prices for planning; not a jeweller retail price (excludes GST, making charges, margins) and not for trading.',
    },
    {
      metalCode: 'XAG',
      symbol: 'XAG',
      displayName: 'Silver',
      purity: 'MCX Reference',
      pricePerGramInr: 225.88,
      pricePer10GramsInr: 2258.80,
      indicative22kPerGramInr: null,
      indicative22kPer10GramsInr: null,
      sourceTimestamp: '2026-10-04T05:50:04.579Z',
      fetchedAt: '2026-10-04T05:50:04.579Z',
      cacheStatus: 'LIVE',
      source: 'metals.dev',
      disclaimer: 'Indicative MCX reference prices for planning; not a jeweller retail price (excludes GST, making charges, margins) and not for trading.',
    },
  ],
  fetchedAt: '2026-10-04T05:50:04.579Z',
  cacheStatus: 'LIVE',
  source: 'metals.dev',
  disclaimer: 'Indicative MCX reference prices for planning; not a jeweller retail price (excludes GST, making charges, margins) and not for trading.',
}

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'UP' }),
  }))
})

test('displays loading skeleton while fetching metal prices', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    // delay response to verify skeleton visibility
    await new Promise((resolve) => setTimeout(resolve, 800))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMetalsLive),
    })
  })

  await page.goto('/')
  const skeleton = page.locator('[aria-label="Loading metal prices"]')
  await expect(skeleton).toBeVisible()
  await expect(page.getByText('Gold (MCX)')).toBeVisible()
})

test('displays populated metal prices with INR formatting, timestamps, and disclaimers', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockMetalsLive),
    })
  })

  await page.goto('/')

  // Section title and live badge
  await expect(page.getByRole('heading', { name: /live metal prices/i })).toBeVisible()
  await expect(page.getByText(/live/i).first()).toBeVisible()

  // Metals cards
  await expect(page.getByText('Gold (MCX)')).toBeVisible()
  await expect(page.getByText('₹15,039.00')).toBeVisible()
  await expect(page.getByText('₹1,50,390.00')).toBeVisible()
  await expect(page.getByText('22K Indicative: ₹13,785.75')).toBeVisible()
  await expect(page.getByText(/not a jeweller retail price/i).first()).toBeVisible()

  await expect(page.getByText('Silver')).toBeVisible()
  await expect(page.getByText('₹225.88')).toBeVisible()

  // Last updated and source
  await expect(page.getByText(/last updated/i)).toBeVisible()
  await expect(page.getByText(/source: metals.dev/i)).toBeVisible()
  await expect(page.getByText(/indicative mcx reference prices/i).first()).toBeVisible()
})

test('displays stale badge on temporary failure when prior data exists', async ({ page }) => {
  let callCount = 0
  await page.route('**/api/v1/market/metals', async (route) => {
    callCount += 1
    if (callCount === 1) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockMetalsLive, cacheStatus: 'CACHED' }),
      })
    } else {
      // Second call fails with 503
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 503,
          code: 'METALS_SERVICE_UNAVAILABLE',
          message: 'Upstream provider unavailable',
        }),
      })
    }
  })

  await page.goto('/')
  await expect(page.getByText('₹15,039.00')).toBeVisible()

  // Click manual refresh which triggers the failing call
  const refreshButton = page.getByRole('button', { name: /refresh metal prices/i })
  await refreshButton.click()

  // Prior data must remain displayed and marked Stale
  await expect(page.getByText('₹15,039.00')).toBeVisible()
  await expect(page.getByText(/stale/i).first()).toBeVisible()
})

test('displays calm non-blocking unavailable state without breaking calculators', async ({ page }) => {
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 503,
        code: 'METALS_SERVICE_UNAVAILABLE',
        message: 'Live metal reference prices are temporarily unavailable.',
      }),
    })
  })

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

  await page.goto('/')

  // Calm non-blocking notice shown
  await expect(page.getByText(/metal reference prices are temporarily unavailable/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()

  // SIP calculator remains completely operational
  await expect(page.getByRole('heading', { name: /plan your SIP/i })).toBeVisible()
  await page.getByRole('button', { name: /^calculate/i }).click()
  await expect(page.getByText('₹1,45,000')).toBeVisible()
})

test('manual refresh updates metal prices on screen', async ({ page }) => {
  let callCount = 0
  await page.route('**/api/v1/market/metals', async (route) => {
    callCount += 1
    const price = callCount === 1 ? 15039.00 : 15200.00
    const goldItem = {
      ...mockMetalsLive.metals[0],
      pricePerGramInr: price,
      pricePer10GramsInr: price * 10,
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockMetalsLive,
        metals: [goldItem, ...mockMetalsLive.metals.slice(1)],
      }),
    })
  })

  await page.goto('/')
  await expect(page.getByText('₹15,039.00')).toBeVisible()

  // Click Refresh
  await page.getByRole('button', { name: /refresh metal prices/i }).click()
  await expect(page.getByText('₹15,200.00')).toBeVisible()
})
