import { test, expect } from '@playwright/test'

const mockOwnerContact = {
  name: 'Aniruddha Mondal',
  whatsapp: '+91 8013292565',
  email: 'aniruddha0266@gmail.com',
}

const mockTeam = [
  {
    id: 'aniruddha',
    name: 'Aniruddha Mondal',
    role: 'Founder & Lead Developer',
    shortBio:
      'Aniruddha is a Kolkata-based Java full-stack engineer with around five years of experience building Spring Boot microservices and React interfaces for financial-services platforms.',
    whatsapp: '+91 8013292565',
    email: 'aniruddha0266@gmail.com',
    initials: 'AM',
  },
  {
    id: 'kuhika',
    name: 'Kuhika Das',
    role: 'Co-founder & Process Engineer',
    shortBio:
      'Kuhika is a Process Engineer with 4+ years of experience in the Oil & Gas industry, remotely monitoring and supporting plant assets. Specializing in digital twin creation, P&ID digitization, smart plant creation and chemical process modelling, Kuhika works closely with engineering and digital platform teams to provide functional support for Digital Twin initiatives and Industry 4.0 solutions.',
    whatsapp: '+91 7667889389',
    email: 'kuhika.das@gmail.com',
    initials: 'KD',
  },
]

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'UP' }) })
  )
  await page.route('**/api/v1/config/owner-contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockOwnerContact) })
  )
  await page.route('**/api/v1/config/team', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockTeam) })
  )
})

test('navigates from Home page to Ask Query page and verifies owner identity and WhatsApp button without phone number', async ({ page }) => {
  await page.route('**/api/v1/market/metals', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ metals: [], cacheStatus: 'LIVE' }) })
  )
  await page.goto('/')
  const askHeroBtn = page.getByRole('button', { name: /ask a finance query/i })
  await expect(askHeroBtn).toBeVisible()
  await askHeroBtn.click()
  await expect(page).toHaveURL(/.*\/ask-query/)
  await expect(page.getByRole('heading', { level: 1, name: /ask a personal finance query/i })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Aniruddha Mondal' })).toBeVisible()
  await expect(page.getByText(/prefer a quick chat\? message me on whatsapp or email me directly\./i)).toBeVisible()

  // Top owner WhatsApp button
  const whatsappLink = page.locator('.owner-contacts-list a[href*="wa.me/918013292565"]').first()
  await expect(whatsappLink).toBeVisible()
  await expect(whatsappLink).toHaveText(/chat on whatsapp/i)
  await expect(whatsappLink).toHaveAttribute('target', '_blank')
  await expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(whatsappLink).toHaveAttribute(
    'aria-label',
    'Chat with Aniruddha Mondal on WhatsApp (opens in a new tab)'
  )

  // Verify no phone digits are rendered in visible page text
  const bodyText = await page.innerText('body')
  expect(bodyText).not.toContain('80132')
  expect(bodyText).not.toContain('76678')
  expect(bodyText).not.toContain('8013292565')
  expect(bodyText).not.toContain('7667889389')

  // Verify no tel: links anywhere on the page
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)

  // Email link stays visible as expected
  const emailLink = page.locator('a[href^="mailto:aniruddha0266@gmail.com"]').first()
  await expect(emailLink).toBeVisible()
  await expect(emailLink).toContainText('aniruddha0266@gmail.com')
  await expect(page.getByLabel('Educational Disclaimer')).toBeVisible()
})

test('shows validation errors when submitting empty form', async ({ page }) => {
  await page.goto('/ask-query')
  const submitBtn = page.getByRole('button', { name: /submit query/i })
  await submitBtn.click()
  await expect(page.locator('#error-name')).toBeVisible()
  await expect(page.locator('#error-email')).toBeVisible()
  await expect(page.locator('#error-category')).toBeVisible()
  await expect(page.locator('#error-subject')).toBeVisible()
  await expect(page.locator('#error-message')).toBeVisible()
  await expect(page.locator('#error-consent')).toBeVisible()
})

test('successfully submits query, displays reference ID and both founder contacts with no phone numbers, and allows reset', async ({ page }) => {
  await page.route('**/api/v1/queries', async (route) => {
    const postData = route.request().postDataJSON()
    expect(postData.name).toBe('Amitabh Sen')
    expect(postData.email).toBe('amitabh@example.com')
    expect(postData.whatsapp).toBe('+91 9876543210')
    expect(postData.category).toBe('SIP_MUTUAL_FUNDS')
    expect(postData.consent).toBe(true)
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ referenceId: 'FQ-2026-TEST99', message: 'Your query has been submitted successfully. Reference ID: FQ-2026-TEST99' }),
    })
  })
  await page.goto('/ask-query')
  await page.locator('#field-name').fill('Amitabh Sen')
  await page.locator('#field-email').fill('amitabh@example.com')
  await page.locator('#field-whatsapp').fill('+91 9876543210')
  await page.locator('#field-category').selectOption('SIP_MUTUAL_FUNDS')
  await page.locator('#field-subject').fill('Portfolio rebalancing query for retirement')
  await page.locator('#field-message').fill('I have been investing in 3 index funds for the last 5 years. Should I start rebalancing into debt instruments now?')
  await page.locator('#field-consent').check()
  await page.getByRole('button', { name: /submit query/i }).click()

  await expect(page.getByRole('heading', { name: /query submitted successfully!/i })).toBeVisible()
  await expect(page.getByTestId('reference-id')).toHaveText('FQ-2026-TEST99')

  // Founder WhatsApp link in success state
  const founderSuccessWaLink = page.locator('.query-success-card a[href*="wa.me/918013292565"]')
  await expect(founderSuccessWaLink).toBeVisible()
  await expect(founderSuccessWaLink).toHaveText(/chat on whatsapp/i)
  await expect(founderSuccessWaLink).toHaveAttribute('target', '_blank')
  const founderHref = await founderSuccessWaLink.getAttribute('href')
  expect(founderHref).toContain('wa.me/918013292565')
  expect(founderHref).toContain(encodeURIComponent('Portfolio rebalancing query for retirement'))
  expect(founderHref).toContain(encodeURIComponent('FQ-2026-TEST99'))

  // Co-founder WhatsApp link in success state
  const coFounderSuccessWaLink = page.locator('.query-success-card a[href*="wa.me/917667889389"]')
  await expect(coFounderSuccessWaLink).toBeVisible()
  await expect(coFounderSuccessWaLink).toHaveText(/chat on whatsapp/i)
  await expect(coFounderSuccessWaLink).toHaveAttribute('target', '_blank')
  const coFounderHref = await coFounderSuccessWaLink.getAttribute('href')
  expect(coFounderHref).toContain('wa.me/917667889389')

  // Verify visible text in success state has NO phone numbers
  const successBodyText = await page.innerText('body')
  expect(successBodyText).not.toContain('80132')
  expect(successBodyText).not.toContain('76678')
  expect(successBodyText).not.toContain('8013292565')
  expect(successBodyText).not.toContain('7667889389')

  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)

  const resetBtn = page.getByRole('button', { name: /ask another question/i })
  await expect(resetBtn).toBeVisible()
  await resetBtn.click()
  await expect(page.locator('#field-name')).toHaveValue('')
})

test('handles 429 rate limit error gracefully', async ({ page }) => {
  await page.route('**/api/v1/queries', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      headers: { 'Retry-After': '3600' },
      body: JSON.stringify({ status: 429, code: 'RATE_LIMIT_EXCEEDED', message: 'Too many query submissions from this IP. Please retry in 1 hour.' }),
    })
  })
  await page.goto('/ask-query')
  await page.locator('#field-name').fill('Dev Sharma')
  await page.locator('#field-email').fill('dev@example.com')
  await page.locator('#field-category').selectOption('INCOME_TAX')
  await page.locator('#field-subject').fill('Tax deduction on home loan interest')
  await page.locator('#field-message').fill('Can I claim deduction under section 24b for an under-construction property in India?')
  await page.locator('#field-consent').check()
  await page.getByRole('button', { name: /submit query/i }).click()
  const errorBanner = page.locator('.query-error-banner')
  await expect(errorBanner).toBeVisible()
  await expect(errorBanner).toContainText(/Too many queries submitted recently/i)
})

test('"Meet the Founders" section renders both founders with real roles, bios, and wa.me links without phone numbers', async ({ page }) => {
  await page.goto('/ask-query')
  await expect(page.getByRole('heading', { level: 2, name: /meet the founders/i })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Aniruddha Mondal' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Kuhika Das' })).toBeVisible()

  // Verify roles scoped to .founders-section to avoid strict mode collisions
  const foundersSec = page.locator('.founders-section')
  await expect(foundersSec.getByText('Founder & Lead Developer')).toBeVisible()
  await expect(foundersSec.getByText('Co-founder & Process Engineer')).toBeVisible()

  // Verify co-founder bio has no placeholder or '<' text
  const kuhikaCard = page.locator('.founder-card', { hasText: 'Kuhika Das' })
  await expect(kuhikaCard).toBeVisible()
  const kuhikaText = await kuhikaCard.innerText()
  expect(kuhikaText).not.toContain('<')
  expect(kuhikaText.toLowerCase()).not.toContain('placeholder')
  expect(kuhikaText).toContain('Process Engineer')

  // Verify WhatsApp buttons show "Chat on WhatsApp" and have wa.me targets
  const founderWaLink = kuhikaCard.locator('a[href*="wa.me/917667889389"]')
  await expect(founderWaLink).toBeVisible()
  await expect(founderWaLink).toHaveText(/chat on whatsapp/i)
  await expect(founderWaLink).toHaveAttribute('target', '_blank')
  await expect(founderWaLink).toHaveAttribute(
    'aria-label',
    'Chat with Kuhika Das on WhatsApp (opens in a new tab)'
  )

  await expect(page.locator('.founders-section a[href^="mailto:kuhika.das@gmail.com"]')).toBeVisible()
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)

  // Verify footer has no phone numbers
  const footerText = await page.locator('.footer-founders-contact').innerText()
  expect(footerText).not.toContain('80132')
  expect(footerText).not.toContain('76678')
  expect(footerText).not.toContain('8013292565')
  expect(footerText).not.toContain('7667889389')
})

test('co-founder shortcut link scrolls to founders section', async ({ page }) => {
  await page.goto('/ask-query')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const shortcutLink = page.locator('a[href="#meet-founders"]')
  await expect(shortcutLink).toBeVisible()
  await expect(shortcutLink).toContainText('Kuhika Das')
})
