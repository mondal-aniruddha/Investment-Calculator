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

test('registration flow triggers OTP step, enters 6 digits, and signs in', async ({ page }) => {
  // Mock POST /register -> returns challenge
  await page.route('**/api/v1/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        verificationRequired: true,
        challengeId: 'test-challenge-uuid',
        maskedPhone: '+91******3210',
        channel: 'SMS',
        resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      }),
    })
  })

  // Mock POST /register/verify -> activates account and returns token
  await page.route('**/api/v1/auth/register/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-verified',
        expiresAt: '2026-10-03T12:00:00Z',
        profile: {
          id: 'user-uuid-new',
          email: 'priya@example.com',
          displayName: 'Priya Sharma',
          username: 'priyas',
          phoneVerified: true,
          twoFactorEnabled: true,
          createdAt: '2026-10-01T10:00:00Z',
        },
      }),
    })
  })

  await page.goto('/register')
  await page.locator('#reg-email').fill('priya@example.com')
  await page.locator('#reg-display-name').fill('Priya Sharma')
  await page.locator('#reg-phone').fill('9876543210')
  await page.locator('#reg-password').fill('PriyaPass123!')
  await page.locator('#reg-confirm-password').fill('PriyaPass123!')
  await page.getByRole('button', { name: /^create account/i }).click()

  // Should transition to OTP step (in-page, not full reload)
  await expect(page.getByTestId('otp-input')).toBeVisible()
  await expect(page.getByText(/\+91\*\*\*\*\*\*3210/)).toBeVisible()

  // Fill in 6 digits
  const boxes = page.getByRole('textbox')
  const count = await boxes.count()
  expect(count).toBe(6)
  await boxes.first().fill('1')
  await boxes.nth(1).fill('2')
  await boxes.nth(2).fill('3')
  await boxes.nth(3).fill('4')
  await boxes.nth(4).fill('5')
  await boxes.nth(5).fill('6')

  // Completes verification and navigates to home/auth destination
  await expect(page.getByText(/account created successfully/i)).toBeVisible()
  const sessionToken = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  expect(sessionToken).toBe('mock-jwt-token-verified')
})

test('2FA login flow presents OTP input after valid password and verifies successfully', async ({ page }) => {
  // Mock POST /login -> indicates 2FA required
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        twoFactorRequired: true,
        challengeId: '2fa-challenge-uuid',
        maskedPhone: '+91******9999',
        channel: 'WHATSAPP',
        resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
        backupCodesAvailable: true,
      }),
    })
  })

  // Mock POST /2fa/verify -> returns full session
  await page.route('**/api/v1/auth/2fa/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-2fa-verified-token',
        expiresAt: '2026-10-03T12:00:00Z',
        profile: {
          id: 'user-uuid-2fa',
          email: 'secure@example.com',
          displayName: 'Secure User',
          phoneVerified: true,
          twoFactorEnabled: true,
          createdAt: '2026-10-01T10:00:00Z',
        },
      }),
    })
  })

  await page.goto('/login')
  await page.locator('#login-identifier').fill('secure@example.com')
  await page.locator('#login-password').fill('StrongPass123!')
  await page.getByRole('button', { name: /^sign in/i }).click()

  // OTP step appears
  await expect(page.getByTestId('otp-input')).toBeVisible()
  await expect(page.getByText(/\+91\*\*\*\*\*\*9999/)).toBeVisible()

  // Enter code
  const boxes = page.getByRole('textbox')
  await boxes.first().fill('6')
  await boxes.nth(1).fill('5')
  await boxes.nth(2).fill('4')
  await boxes.nth(3).fill('3')
  await boxes.nth(4).fill('2')
  await boxes.nth(5).fill('1')

  await expect(page.getByText(/signed in successfully/i)).toBeVisible()
  const token = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  expect(token).toBe('mock-2fa-verified-token')
})

test('wrong OTP displays 422 error and preserves sessionStorage without clearing auth', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        twoFactorRequired: true,
        challengeId: 'challenge-wrong-test',
        maskedPhone: '+91******1111',
        channel: 'SMS',
        resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
        backupCodesAvailable: true,
      }),
    })
  })

  await page.route('**/api/v1/auth/2fa/verify', async (route) => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'OTP_INVALID',
        message: 'Invalid verification code',
      }),
    })
  })

  await page.goto('/login')
  await page.locator('#login-identifier').fill('wrong@example.com')
  await page.locator('#login-password').fill('Password123!')
  await page.getByRole('button', { name: /^sign in/i }).click()

  await expect(page.getByTestId('otp-input')).toBeVisible()

  // Fill in incorrect code
  const boxes = page.getByRole('textbox')
  await boxes.first().fill('0')
  await boxes.nth(1).fill('0')
  await boxes.nth(2).fill('0')
  await boxes.nth(3).fill('0')
  await boxes.nth(4).fill('0')
  await boxes.nth(5).fill('0')

  // Verify error is shown in aria-live alert
  await expect(page.getByTestId('otp-error')).toHaveText('Invalid verification code')
  // Verify we are still on the OTP step
  await expect(page.getByTestId('otp-input')).toBeVisible()
})

test('can switch to backup code for 2FA login', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        twoFactorRequired: true,
        challengeId: 'backup-code-challenge',
        maskedPhone: '+91******2222',
        channel: 'SMS',
        resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
        backupCodesAvailable: true,
      }),
    })
  })

  await page.route('**/api/v1/auth/2fa/verify', async (route) => {
    const postData = JSON.parse(route.request().postData() || '{}')
    expect(postData.backupCode).toBe('ABCDEF12')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'backup-code-token',
        expiresAt: '2026-10-03T12:00:00Z',
        profile: {
          id: 'user-backup',
          email: 'backup@example.com',
          displayName: 'Backup User',
          phoneVerified: true,
          twoFactorEnabled: true,
        },
      }),
    })
  })

  await page.goto('/login')
  await page.locator('#login-identifier').fill('backup@example.com')
  await page.locator('#login-password').fill('Password123!')
  await page.getByRole('button', { name: /^sign in/i }).click()

  await expect(page.getByText(/use a backup code instead/i)).toBeVisible()
  await page.getByText(/use a backup code instead/i).click()

  await page.getByLabel(/backup code/i).fill('ABCDEF12')
  await page.getByRole('button', { name: /verify code/i }).click()

  await expect(page.getByText(/signed in successfully/i)).toBeVisible()
  const token = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  expect(token).toBe('backup-code-token')
})
