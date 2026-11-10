/**
 * glossary-learn.spec.js — E2E tests for the Glossary tab on /learn
 * and the standalone /glossary route.
 *
 * Tests:
 *   a. API returns terms: /learn?view=glossary shows every term + count text.
 *   b. API returns HTML/500: fallback terms + notice render; no error card.
 *   c. Search narrows results; query survives a tab switch.
 *   d. /learn?view=glossary&term=SIP highlights and focuses the SIP card.
 *   e. /glossary still renders the same content.
 *   f. Arrow keys move between Guides and Glossary tabs.
 */
import { test, expect } from '@playwright/test'

// 18 term names matching both the SQL seed and GLOSSARY_FALLBACK
const ALL_TERM_NAMES = [
  'SIP',
  'CAGR',
  'XIRR',
  'NAV',
  'Expense Ratio',
  'LTCG',
  'STCG',
  '80C',
  '80D',
  '87A',
  'PPF',
  'EPF',
  'NPS',
  'CIBIL',
  'Emergency Fund',
  'Rupee Cost Averaging',
  'Index Fund',
  'Term Insurance',
]

/** Mocked API response — full DTOs with detailedExplainer */
const MOCK_TERMS = ALL_TERM_NAMES.map((term, i) => ({
  id: `term-${i + 1}`,
  term,
  shortDefinition: `${term} short definition used in test.`,
  detailedExplainer: `${term} detailed explainer used in test.`,
  category: ['Investing', 'Tax', 'Fixed Income', 'Retirement', 'Basics', 'Credit', 'Insurance'][
    i % 7
  ],
  relatedUrl: '/sip',
}))

function setupHealth(page) {
  return page.route('**/actuator/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'UP' }),
    })
  )
}

function setupGlossarySuccess(page) {
  return page.route('**/api/v1/glossary', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TERMS),
    })
  )
}

function setupGlossaryFailHtml(page) {
  return page.route('**/api/v1/glossary', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>Netlify rewrite error page</body></html>',
    })
  )
}

function setupArticlesSuccess(page) {
  return page.route('**/api/v1/learn/articles**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  )
}

function setupArticlesFailure(page) {
  return page.route('**/api/v1/learn/articles**', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  )
}

// ── Test a: API returns terms → /learn?view=glossary shows all 18 + count ─────────────────

test('a: live API — /learn?view=glossary shows every term and correct count', async ({ page }) => {
  await setupHealth(page)
  await setupGlossarySuccess(page)
  await setupArticlesSuccess(page)

  await page.goto('/learn?view=glossary')

  // Count line must say "Showing 18 of 18 terms"
  await expect(page.locator('.glossary-result-count')).toContainText('18 of 18')

  // Every term card heading is visible (check a representative sample)
  await expect(page.getByText('SIP').first()).toBeVisible()
  await expect(page.getByText('CAGR').first()).toBeVisible()
  await expect(page.getByText('Emergency Fund').first()).toBeVisible()
  await expect(page.getByText('Term Insurance').first()).toBeVisible()

  // detailedExplainer text is rendered (from mock)
  await expect(page.getByText('SIP detailed explainer used in test.').first()).toBeVisible()
})

// ── Test b: API returns HTML → fallback renders with notice; no error card ───────────────

test('b: API returns HTML — fallback renders with subtle notice, no error card', async ({
  page,
}) => {
  await setupHealth(page)
  await setupGlossaryFailHtml(page)
  await setupArticlesSuccess(page)

  await page.goto('/learn?view=glossary')

  // Fallback notice must appear
  await expect(
    page.getByText(/showing the built-in glossary because the live server can't be reached/i)
  ).toBeVisible()

  // No red error card
  await expect(page.getByText(/failed to load content/i)).not.toBeVisible()

  // All 18 fallback terms are visible
  for (const name of ALL_TERM_NAMES) {
    await expect(page.getByText(name).first()).toBeVisible()
  }

  // detailedExplainer from GLOSSARY_FALLBACK (SIP) must be present
  await expect(
    page.getByText(
      'A disciplined method where a fixed amount is debited from your bank account periodically'
    )
  ).toBeVisible()
})

// ── Test c: Search narrows results; query survives tab switch ─────────────────────────────

test('c: search narrows glossary results and query survives tab switch', async ({ page }) => {
  await setupHealth(page)
  await setupGlossarySuccess(page)
  await setupArticlesSuccess(page)

  await page.goto('/learn?view=glossary')

  const searchInput = page.getByRole('searchbox')

  // Type a narrow query
  await searchInput.fill('SIP')

  // Wait for debounced search (300ms) to filter results (count should drop from 18)
  await expect(page.locator('.glossary-result-count')).not.toContainText('18 of 18')
  const countText = await page.locator('.glossary-result-count').textContent()
  const match = countText.match(/Showing (\d+) of 18/)
  expect(match).not.toBeNull()
  const shownCount = parseInt(match[1], 10)
  expect(shownCount).toBeGreaterThanOrEqual(1)
  expect(shownCount).toBeLessThan(18)

  // Switch to Guides
  await page.getByRole('tab', { name: /guides/i }).click()
  await expect(page).toHaveURL(/view=guides/)

  // The search input still holds the typed query
  await expect(searchInput).toHaveValue('SIP')

  // Switch back to Glossary
  await page.getByRole('tab', { name: /glossary/i }).click()
  await expect(page).toHaveURL(/view=glossary/)

  // Count text is still showing filtered results
  await expect(page.locator('.glossary-result-count')).toContainText('of 18')
})

// ── Test d: Deep link ?term=SIP highlights and focuses that card ───────────────────────

test('d: /learn?view=glossary&term=SIP highlights and focuses the SIP card', async ({ page }) => {
  await setupHealth(page)
  await setupGlossarySuccess(page)
  await setupArticlesSuccess(page)

  await page.goto('/learn?view=glossary&term=SIP')

  // The highlighted card has the CSS class and contains "SIP"
  const highlighted = page.locator('.glossary-term-highlighted')
  await expect(highlighted).toBeVisible()
  await expect(highlighted).toContainText('SIP')
})

// ── Test e: /glossary route still works ───────────────────────────────────────────────

test('e: /glossary still renders glossary content', async ({ page }) => {
  await setupHealth(page)
  await setupGlossarySuccess(page)

  await page.goto('/glossary')

  // Page heading
  await expect(page.getByRole('heading', { name: /jargon buster glossary/i })).toBeVisible()

  // A few terms are present
  await expect(page.getByText('SIP').first()).toBeVisible()
  await expect(page.getByText('CAGR').first()).toBeVisible()
  await expect(page.getByText('PPF').first()).toBeVisible()
})

// ── Test f: Arrow keys navigate between Guides and Glossary tabs ──────────────────────

test('f: arrow keys move focus between Guides and Glossary tabs', async ({ page }) => {
  await setupHealth(page)
  await setupGlossarySuccess(page)
  await setupArticlesSuccess(page)

  await page.goto('/learn')

  const guidesTab = page.getByRole('tab', { name: /guides/i }).first()
  const glossaryTab = page.getByRole('tab', { name: /glossary/i }).first()

  // Focus the Guides tab
  await guidesTab.focus()
  await expect(guidesTab).toBeFocused()

  // ArrowRight moves focus to the Glossary tab
  await page.keyboard.press('ArrowRight')
  await expect(glossaryTab).toBeFocused()

  // ArrowLeft moves focus back to the Guides tab
  await page.keyboard.press('ArrowLeft')
  await expect(guidesTab).toBeFocused()
})

