import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/actuator/health', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'UP' }),
  }))
  await page.route('**/api/v1/market/metals', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ metals: [], cacheStatus: 'LIVE' }),
    })
  })
})

test('unauthenticated user accessing /account is redirected to /login', async ({ page }) => {
  await page.goto('/account')
  await expect(page).toHaveURL(/.*\/login/)
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
})

test('can switch between login and register tabs', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('tab', { name: /sign in/i })).toHaveClass(/active/)
  await expect(page.getByLabel(/email or username/i)).toBeVisible()

  await page.getByRole('tab', { name: /create account/i }).click()
  await expect(page).toHaveURL(/.*\/register/)
  await expect(page.getByRole('tab', { name: /create account/i })).toHaveClass(/active/)
  await expect(page.getByLabel(/display name/i)).toBeVisible()
  await expect(page.getByLabel(/confirm password/i)).toBeVisible()
})

test('password strength meter updates dynamically', async ({ page }) => {
  await page.goto('/register')
  const passwordInput = page.locator('#reg-password')

  // Type weak password
  await passwordInput.fill('abcd')
  await expect(page.getByText(/password strength:/i)).toBeVisible()
  await expect(page.getByText(/weak/i)).toBeVisible()

  // Type complex password
  await passwordInput.fill('Password123!')
  await expect(page.getByText(/strong|good/i)).toBeVisible()
  await expect(page.getByText(/8\+ characters/i)).toHaveClass(/valid/)
  await expect(page.getByText(/upper & lower case/i)).toHaveClass(/valid/)
  await expect(page.getByText(/at least 1 number/i)).toHaveClass(/valid/)
})

test('password mismatch warning appears when passwords do not match', async ({ page }) => {
  await page.goto('/register')
  await page.locator('#reg-password').fill('Password123!')
  await page.locator('#reg-confirm-password').fill('Mismatch456!')

  await expect(page.getByText(/passwords do not match/i)).toBeVisible()
})

test('password show/hide toggle toggles input type', async ({ page }) => {
  await page.goto('/login')
  const passwordInput = page.locator('#login-password')
  const toggleBtn = page.getByRole('button', { name: /show password/i })

  await expect(passwordInput).toHaveAttribute('type', 'password')
  await toggleBtn.click()
  await expect(passwordInput).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: /hide password/i }).click()
  await expect(passwordInput).toHaveAttribute('type', 'password')
})

test('successful login stores token in sessionStorage and updates header', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-12345',
        expiresAt: '2026-10-03T12:00:00Z',
        profile: {
          id: 'user-uuid-1',
          email: 'alex@example.com',
          displayName: 'Alex Morgan',
          username: 'alexm',
          createdAt: '2026-10-01T10:00:00Z',
        },
      }),
    })
  })

  await page.goto('/login')
  await page.locator('#login-identifier').fill('alexm')
  await page.locator('#login-password').fill('Password123!')
  await page.getByRole('button', { name: /^sign in/i }).click()

  // Should show success toast and header badge
  await expect(page.getByText(/signed in successfully/i)).toBeVisible()
  await expect(page.getByText('Alex Morgan')).toBeVisible()

  // Verify token stored in sessionStorage, not localStorage
  const sessionToken = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  expect(sessionToken).toBe('mock-jwt-token-12345')
  const localToken = await page.evaluate(() => localStorage.getItem('infinance-token'))
  expect(localToken).toBeNull()
})

test('authenticated user can access /account, view details and logout', async ({ page }) => {
  // Pre-seed sessionStorage with token and user profile
  await page.addInitScript(() => {
    sessionStorage.setItem('infinance-token', 'mock-jwt-token-12345')
    sessionStorage.setItem('infinance-user', JSON.stringify({
      id: 'user-uuid-1',
      email: 'alex@example.com',
      displayName: 'Alex Morgan',
      username: 'alexm',
      createdAt: '2026-10-01T10:00:00Z',
    }))
  })

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-uuid-1',
        email: 'alex@example.com',
        displayName: 'Alex Morgan',
        username: 'alexm',
        createdAt: '2026-10-01T10:00:00Z',
      }),
    })
  })

  await page.route('**/api/v1/scenarios', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'sc-1',
          name: 'Retirement 2050',
          scenarioType: 'RETIREMENT',
          createdAt: '2026-10-02T08:00:00Z',
        },
      ]),
    })
  })

  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Alex Morgan' })).toBeVisible()
  await expect(page.getByText('@alexm')).toBeVisible()
  await expect(page.getByText('Retirement 2050')).toBeVisible()

  // Test logout
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page.getByText(/signed out successfully/i)).toBeVisible()
  const clearedToken = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  expect(clearedToken).toBeNull()
})
