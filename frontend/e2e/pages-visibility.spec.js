import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'UP' }),
    })
  )
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ metals: [], cacheStatus: 'LIVE' }),
    })
  })
  await page.route('**/api/v1/learn/articles*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'art-1',
          slug: 'what-is-sip',
          title: 'What is a Systematic Investment Plan (SIP)?',
          excerpt: 'Learn the power of compounding with regular monthly investing.',
          category: 'Basics',
          readingTimeMinutes: 5,
          relatedCalculatorPath: '/sip',
          relatedCalculatorLabel: 'Try SIP Planner',
          tags: 'SIP,Compounding',
          updatedAt: '2026-11-10T00:00:00.000Z',
        },
      ]),
    })
  })
  await page.route('**/api/v1/glossary*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'term-1',
          term: 'SIP',
          fullName: 'Systematic Investment Plan',
          category: 'Investing',
          definition: 'A method of investing a fixed sum regularly into a mutual fund scheme.',
        },
      ]),
    })
  })
})

test.describe('Page h1 scroll-reveal visibility', () => {
  test('/about h1 is visible', async ({ page }) => {
    await page.goto('/about')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('/learn h1 is visible', async ({ page }) => {
    await page.goto('/learn')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('/privacy h1 is visible', async ({ page }) => {
    await page.goto('/privacy')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('/roadmap h1 is visible', async ({ page }) => {
    await page.goto('/roadmap')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('/glossary h1 is visible', async ({ page }) => {
    await page.goto('/glossary')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })
})

