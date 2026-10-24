import { test, expect } from '@playwright/test'

const mockOwnerContact = {
  name: 'Aniruddha Mondal',
  whatsapp: '+91 8013292565',
  email: 'aniruddha0266@gmail.com',
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

test('navigates from Home page to Ask Query page and verifies owner identity and WhatsApp button', async ({
  page,
}) => {
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
  await expect(
    page.getByRole('heading', { level: 1, name: /ask a personal finance query/i })
  ).toBeVisible()

  // Verify Owner Identity Section at top
  await expect(page.getByRole('heading', { level: 2, name: 'Aniruddha Mondal' })).toBeVisible()
  await expect(
    page.getByText(/prefer a quick chat\? message me on whatsapp or email me directly\./i)
  ).toBeVisible()

  // Verify WhatsApp button exists, has expected wa.me href, and opens in a new tab
  const whatsappLink = page.locator('a[href*="wa.me/918013292565"]')
  await expect(whatsappLink).toBeVisible()
  await expect(whatsappLink).toContainText('+91 80132 92565')
  await expect(whatsappLink).toHaveAttribute('target', '_blank')
  await expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(whatsappLink).toHaveAttribute(
    'aria-label',
    'Chat with Aniruddha on WhatsApp (opens in a new tab)'
  )

  // Verify no tel: link remains on the page
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)

  // Verify email link is mailto:
  const emailLink = page.locator('a[href^="mailto:aniruddha0266@gmail.com"]')
  await expect(emailLink).toBeVisible()
  await expect(emailLink).toContainText('aniruddha0266@gmail.com')

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

test('successfully submits query, displays reference ID and owner contact, and allows reset', async ({
  page,
}) => {
  await page.route('**/api/v1/queries', async (route) => {
    const postData = route.request().postDataJSON()
    expect(postData.name).toBe('Amitabh Sen')
    expect(postData.email).toBe('amitabh@example.com')
    expect(postData.whatsapp).toBe('+91 8013292565')
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
  await page.locator('#field-whatsapp').fill('+91 8013292565')
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

  // Verify WhatsApp button in success state includes prefilled subject and opens in new tab
  const successWhatsAppLink = page.locator('.query-success-card a[href*="wa.me/918013292565"]')
  await expect(successWhatsAppLink).toBeVisible()
  await expect(successWhatsAppLink).toHaveAttribute('target', '_blank')
  const successHref = await successWhatsAppLink.getAttribute('href')
  expect(successHref).toContain('wa.me/918013292565')
  expect(successHref).toContain(encodeURIComponent('Portfolio rebalancing query for retirement'))
  expect(successHref).toContain(encodeURIComponent('FQ-2026-TEST99'))

  // Verify no tel: link on page in success state either
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)

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
