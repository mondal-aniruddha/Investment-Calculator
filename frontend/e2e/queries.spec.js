import { test, expect } from '@playwright/test'

const mockOwnerContact = {
  name: 'Aniruddha Mondal',
  phone: '+91 98765 43210',
  email: 'aniruddha.mondal@example.com',
}

test.beforeEach(async ({ page }) => {
  // Mock health check and owner contact endpoint
  await page.route('**/actuator/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'UP' }),
    })
  )

  await page.route('**/api/v1/config/owner-contact', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockOwnerContact),
    })
  )
})

test('navigates from Home page to Ask Query page and verifies owner identity', async ({ page }) => {
  await page.route('**/api/v1/market/metals', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ metals: [], cacheStatus: 'LIVE' }),
    })
  )

  await page.goto('/')

  // Click the Ask a Finance Query button in hero
  const askHeroBtn = page.getByRole('button', { name: /ask a finance query/i })
  await expect(askHeroBtn).toBeVisible()
  await askHeroBtn.click()

  // Verify navigation to /ask-query
  await expect(page).toHaveURL(/.*\/ask-query/)
  await expect(page.getByRole('heading', { level: 1, name: /ask a personal finance query/i })).toBeVisible()

  // Verify Owner Identity Section at top
  await expect(page.getByRole('heading', { level: 2, name: 'Aniruddha Mondal' })).toBeVisible()
  await expect(page.getByText(/prefer to talk\? call or message me directly\./i)).toBeVisible()

  // Verify phone is tel: link and email is mailto: link
  const phoneLink = page.locator('a[href^="tel:"]')
  await expect(phoneLink).toBeVisible()
  await expect(phoneLink).toContainText('+91 98765 43210')

  const emailLink = page.locator('a[href^="mailto:"]')
  await expect(emailLink).toBeVisible()
  await expect(emailLink).toContainText('aniruddha.mondal@example.com')

  // Verify Educational Disclaimer is shown
  await expect(page.getByLabel('Educational Disclaimer')).toBeVisible()
})

test('shows validation errors when submitting empty form', async ({ page }) => {
  await page.goto('/ask-query')

  // Click submit without entering data
  const submitBtn = page.getByRole('button', { name: /submit query/i })
  await submitBtn.click()

  // Assert validation errors appear
  await expect(page.locator('#error-name')).toBeVisible()
  await expect(page.locator('#error-email')).toBeVisible()
  await expect(page.locator('#error-category')).toBeVisible()
  await expect(page.locator('#error-subject')).toBeVisible()
  await expect(page.locator('#error-message')).toBeVisible()
  await expect(page.locator('#error-consent')).toBeVisible()
})

test('successfully submits query, displays reference ID and owner contact, and allows reset', async ({ page }) => {
  await page.route('**/api/v1/queries', async (route) => {
    const postData = route.request().postDataJSON()
    expect(postData.name).toBe('Amitabh Sen')
    expect(postData.email).toBe('amitabh@example.com')
    expect(postData.category).toBe('SIP_MUTUAL_FUNDS')
    expect(postData.consent).toBe(true)

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        referenceId: 'FQ-2026-TEST99',
        message: 'Your query has been submitted successfully. Reference ID: FQ-2026-TEST99',
      }),
    })
  })

  await page.goto('/ask-query')

  // Fill in form fields
  await page.locator('#field-name').fill('Amitabh Sen')
  await page.locator('#field-email').fill('amitabh@example.com')
  await page.locator('#field-phone').fill('+91 9876543210')
  await page.locator('#field-category').selectOption('SIP_MUTUAL_FUNDS')
  await page.locator('#field-subject').fill('Portfolio rebalancing query for retirement')
  await page.locator('#field-message').fill(
    'I have been investing in 3 index funds for the last 5 years. Should I start rebalancing into debt instruments now?'
  )
  await page.locator('#field-consent').check()

  // Submit
  await page.getByRole('button', { name: /submit query/i }).click()

  // Verify success state
  await expect(page.getByRole('heading', { name: /query submitted successfully!/i })).toBeVisible()
  await expect(page.getByTestId('reference-id')).toHaveText('FQ-2026-TEST99')
  await expect(page.getByText('Aniruddha Mondal', { exact: false })).toBeVisible()

  // Verify reset
  const resetBtn = page.getByRole('button', { name: /ask another question/i })
  await expect(resetBtn).toBeVisible()
  await resetBtn.click()

  // Form should be back and empty
  await expect(page.locator('#field-name')).toHaveValue('')
})

test('handles 429 rate limit error gracefully', async ({ page }) => {
  await page.route('**/api/v1/queries', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      headers: { 'Retry-After': '3600' },
      body: JSON.stringify({
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many query submissions from this IP. Please retry in 1 hour.',
      }),
    })
  })

  await page.goto('/ask-query')

  await page.locator('#field-name').fill('Dev Sharma')
  await page.locator('#field-email').fill('dev@example.com')
  await page.locator('#field-category').selectOption('INCOME_TAX')
  await page.locator('#field-subject').fill('Tax deduction on home loan interest')
  await page.locator('#field-message').fill(
    'Can I claim deduction under section 24b for an under-construction property in India?'
  )
  await page.locator('#field-consent').check()

  await page.getByRole('button', { name: /submit query/i }).click()

  // Assert error banner appears with rate limit messaging
  const errorBanner = page.locator('.query-error-banner')
  await expect(errorBanner).toBeVisible()
  await expect(errorBanner).toContainText(/Too many queries submitted recently/i)
})
