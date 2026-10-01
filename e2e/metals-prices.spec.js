import { test, expect } from '@playwright/test'

const mockMetalsLive = {
  metals: [
    {
      metalCode: 'XAU',
      symbol: 'XAU',
      displayName: 'Gold',
      purity: '24K (99.9% Spot Reference)',
      pricePerGramInr: 7450.50,
      pricePer10GramsInr: 74505.00,
      indicative22kPerGramInr: 6829.63,
      indicative22kPer10GramsInr: 68296.25,
      sourceTimestamp: '2026-10-01T10:00:00Z',
      fetchedAt: '2026-10-01T10:00:00Z',
      cacheStatus: 'LIVE',
      source: 'Metals-API',
      disclaimer: 'Indicative international reference prices for educational planning.',
    },
    {
      metalCode: 'XAG',
      symbol: 'XAG',
      displayName: 'Silver',
      purity: '99.9% Spot Reference',
      pricePerGramInr: 91.20,
      pricePer10GramsInr: null,
      indicative22kPerGramInr: null,
      indicative22kPer10GramsInr: null,
      sourceTimestamp: '2026-10-01T10:00:00Z',
      fetchedAt: '2026-10-01T10:00:00Z',
      cacheStatus: 'LIVE',
      source: 'Metals-API',
      disclaimer: 'Indicative international reference prices for educational planning.',
    },
    {
      metalCode: 'XPT',
      symbol: 'XPT',
      displayName: 'Platinum',
      purity: '99.95% Spot Reference',
      pricePerGramInr: 2680.00,
      pricePer10GramsInr: null,
      indicative22kPerGramInr: null,
      indicative22kPer10GramsInr: null,
      sourceTimestamp: '2026-10-01T10:00:00Z',
      fetchedAt: '2026-10-01T10:00:00Z',
      cacheStatus: 'LIVE',
      source: 'Metals-API',
      disclaimer: 'Indicative international reference prices for educational planning.',
    },
    {
      metalCode: 'XPD',
      symbol: 'XPD',
      displayName: 'Palladium',
      purity: '99.95% Spot Reference',
      pricePerGramInr: 2850.00,
      pricePer10GramsInr: null,
      indicative22kPerGramInr: null,
      indicative22kPer10GramsInr: null,
      sourceTimestamp: '2026-10-01T10:00:00Z',
      fetchedAt: '2026-10-01T10:00:00Z',
      cacheStatus: 'LIVE',
      source: 'Metals-API',
      disclaimer: 'Indicative international reference prices for educational planning.',
    },
  ],
  fetchedAt: '2026-10-01T10:00:00Z',
  cacheStatus: 'LIVE',
  source: 'Metals-API',
  disclaimer: 'Indicative international reference prices for educational planning. Not MCX tradable quotes or local jewellery retail prices.',
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
  await expect(page.getByText('Gold (24K Reference)')).toBeVisible()
})

test('displays populated 4 metal prices with INR formatting, timestamps, and disclaimers', async ({ page }) => {
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

  // Four metals cards
  await expect(page.getByText('Gold (24K Reference)')).toBeVisible()
  await expect(page.getByText('₹7,450.50')).toBeVisible()
  await expect(page.getByText('₹74,505.00')).toBeVisible()
  await expect(page.getByText('22K Indicative: ₹6,829.63')).toBeVisible()
  await expect(page.getByText(/not local jeweller retail rate/i)).toBeVisible()

  await expect(page.getByText('Silver (99.9%)')).toBeVisible()
  await expect(page.getByText('₹91.20')).toBeVisible()

  await expect(page.getByText('Platinum (99.95%)')).toBeVisible()
  await expect(page.getByText('₹2,680.00')).toBeVisible()

  await expect(page.getByText('Palladium (99.95%)')).toBeVisible()
  await expect(page.getByText('₹2,850.00')).toBeVisible()

  // Last updated and source
  await expect(page.getByText(/last updated/i)).toBeVisible()
  await expect(page.getByText(/source: metals-api/i)).toBeVisible()
  await expect(page.getByText(/indicative international reference prices/i).first()).toBeVisible()
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
  await expect(page.getByText('₹7,450.50')).toBeVisible()

  // Click manual refresh which triggers the failing call
  const refreshButton = page.getByRole('button', { name: /refresh metal prices/i })
  await refreshButton.click()

  // Prior data must remain displayed and marked Stale
  await expect(page.getByText('₹7,450.50')).toBeVisible()
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
    const price = callCount === 1 ? 7450.50 : 7600.00
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
  await expect(page.getByText('₹7,450.50')).toBeVisible()

  // Click Refresh
  await page.getByRole('button', { name: /refresh metal prices/i }).click()
  await expect(page.getByText('₹7,600.00')).toBeVisible()
})
