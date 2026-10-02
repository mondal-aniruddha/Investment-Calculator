# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> successful login stores token in sessionStorage and updates header
- Location: e2e\auth.spec.js:73:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Alex Morgan')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Alex Morgan') with timeout 5000ms
  - waiting for getByText('Alex Morgan')

```

```yaml
- banner:
  - link "↗ infinance":
    - /url: /
  - navigation "Main navigation":
    - button "SIP planner"
    - button "Loan & EMI"
    - button "Fixed income"
    - button "Mutual fund tools"
    - button "Smart planning"
    - button "Onboarding"
    - button "Education"
    - link "Account":
      - /url: /account
  - text: Language
  - combobox "Language":
    - option "EN" [selected]
    - option "हिंदी"
    - option "বাংলা"
  - button "Dark mode": ◐
  - text: API connected
  - link "Sign in":
    - /url: /login
- main:
  - text: ✦ YOUR MONEY, MADE CLEAR
  - heading "Plan with clarity. Grow with intention." [level=1]:
    - text: Plan with clarity.
    - emphasis: Grow with intention.
  - paragraph: Illustrative tools for Indian investments, loans, and long-term decisions.
  - text: Metal reference prices are temporarily unavailable. Calculators remain fully operational.
  - button "Retry"
  - text: Monthly investment ₹
  - spinbutton "Monthly investment ₹": "10000"
  - text: Time horizon
  - spinbutton "Time horizon years": "10"
  - text: years Expected return
  - spinbutton "Expected return % p.a.": "12"
  - text: "% p.a. Annual step-up"
  - spinbutton "Annual step-up %": "10"
  - text: "% Risk profile"
  - combobox "Risk profile":
    - option "LOW"
    - option "MODERATE" [selected]
    - option "AGGRESSIVE"
  - button "Calculate →"
  - text: 01 / INVESTING
  - heading "Plan your SIP" [level=2]
  - paragraph: Enter assumptions to see an illustrative projection.
  - text: YOUR ESTIMATE
  - heading "Run the calculator" [level=2]
  - paragraph: Projected SIP corpus
  - text: Invested / paid
  - strong: ₹0
  - text: Returns / interest
  - strong: ₹0
  - text: Assumptions
  - strong: Configured
  - text: HOW IT WORKS
  - paragraph: A SIP invests the selected amount monthly. The step-up option increases that contribution once per year. The backend compounds each instalment at the configured annual return and returns scenario and yearly projections.
  - text: For education only. Not investment, tax, legal, or financial advice.
- contentinfo: © 2025 inFinance Educational estimates, not financial advice. India · INR
- region "Notifications"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.beforeEach(async ({ page }) => {
  4   |   await page.route('**/actuator/health', (route) => route.fulfill({
  5   |     status: 200,
  6   |     contentType: 'application/json',
  7   |     body: JSON.stringify({ status: 'UP' }),
  8   |   }))
  9   |   await page.route('**/api/v1/market/metals', async (route) => {
  10  |     await route.fulfill({
  11  |       status: 200,
  12  |       contentType: 'application/json',
  13  |       body: JSON.stringify({ metals: [], cacheStatus: 'LIVE' }),
  14  |     })
  15  |   })
  16  | })
  17  | 
  18  | test('unauthenticated user accessing /account is redirected to /login', async ({ page }) => {
  19  |   await page.goto('/account')
  20  |   await expect(page).toHaveURL(/.*\/login/)
  21  |   await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  22  | })
  23  | 
  24  | test('can switch between login and register tabs', async ({ page }) => {
  25  |   await page.goto('/login')
  26  |   await expect(page.getByRole('tab', { name: /sign in/i })).toHaveClass(/active/)
  27  |   await expect(page.getByLabel(/email or username/i)).toBeVisible()
  28  | 
  29  |   await page.getByRole('tab', { name: /create account/i }).click()
  30  |   await expect(page).toHaveURL(/.*\/register/)
  31  |   await expect(page.getByRole('tab', { name: /create account/i })).toHaveClass(/active/)
  32  |   await expect(page.getByLabel(/display name/i)).toBeVisible()
  33  |   await expect(page.getByLabel(/confirm password/i)).toBeVisible()
  34  | })
  35  | 
  36  | test('password strength meter updates dynamically', async ({ page }) => {
  37  |   await page.goto('/register')
  38  |   const passwordInput = page.locator('#reg-password')
  39  | 
  40  |   // Type weak password
  41  |   await passwordInput.fill('abcd')
  42  |   await expect(page.getByText(/password strength:/i)).toBeVisible()
  43  |   await expect(page.getByText(/weak/i)).toBeVisible()
  44  | 
  45  |   // Type complex password
  46  |   await passwordInput.fill('Password123!')
  47  |   await expect(page.getByText(/strong|good/i)).toBeVisible()
  48  |   await expect(page.getByText(/8\+ characters/i)).toHaveClass(/valid/)
  49  |   await expect(page.getByText(/upper & lower case/i)).toHaveClass(/valid/)
  50  |   await expect(page.getByText(/at least 1 number/i)).toHaveClass(/valid/)
  51  | })
  52  | 
  53  | test('password mismatch warning appears when passwords do not match', async ({ page }) => {
  54  |   await page.goto('/register')
  55  |   await page.locator('#reg-password').fill('Password123!')
  56  |   await page.locator('#reg-confirm-password').fill('Mismatch456!')
  57  | 
  58  |   await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  59  | })
  60  | 
  61  | test('password show/hide toggle toggles input type', async ({ page }) => {
  62  |   await page.goto('/login')
  63  |   const passwordInput = page.locator('#login-password')
  64  |   const toggleBtn = page.getByRole('button', { name: /show password/i })
  65  | 
  66  |   await expect(passwordInput).toHaveAttribute('type', 'password')
  67  |   await toggleBtn.click()
  68  |   await expect(passwordInput).toHaveAttribute('type', 'text')
  69  |   await page.getByRole('button', { name: /hide password/i }).click()
  70  |   await expect(passwordInput).toHaveAttribute('type', 'password')
  71  | })
  72  | 
  73  | test('successful login stores token in sessionStorage and updates header', async ({ page }) => {
  74  |   await page.route('**/api/v1/auth/login', async (route) => {
  75  |     await route.fulfill({
  76  |       status: 200,
  77  |       contentType: 'application/json',
  78  |       body: JSON.stringify({
  79  |         token: 'mock-jwt-token-12345',
  80  |         expiresAt: '2026-10-03T12:00:00Z',
  81  |         profile: {
  82  |           id: 'user-uuid-1',
  83  |           email: 'alex@example.com',
  84  |           displayName: 'Alex Morgan',
  85  |           username: 'alexm',
  86  |           createdAt: '2026-10-01T10:00:00Z',
  87  |         },
  88  |       }),
  89  |     })
  90  |   })
  91  | 
  92  |   await page.goto('/login')
  93  |   await page.locator('#login-identifier').fill('alexm')
  94  |   await page.locator('#login-password').fill('Password123!')
  95  |   await page.getByRole('button', { name: /^sign in/i }).click()
  96  | 
  97  |   // Should show success toast and header badge
  98  |   await expect(page.getByText(/signed in successfully/i)).toBeVisible()
> 99  |   await expect(page.getByText('Alex Morgan')).toBeVisible()
      |                                               ^ Error: expect(locator).toBeVisible() failed
  100 | 
  101 |   // Verify token stored in sessionStorage, not localStorage
  102 |   const sessionToken = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  103 |   expect(sessionToken).toBe('mock-jwt-token-12345')
  104 |   const localToken = await page.evaluate(() => localStorage.getItem('infinance-token'))
  105 |   expect(localToken).toBeNull()
  106 | })
  107 | 
  108 | test('authenticated user can access /account, view details and logout', async ({ page }) => {
  109 |   // Pre-seed sessionStorage with token and user profile
  110 |   await page.addInitScript(() => {
  111 |     sessionStorage.setItem('infinance-token', 'mock-jwt-token-12345')
  112 |     sessionStorage.setItem('infinance-user', JSON.stringify({
  113 |       id: 'user-uuid-1',
  114 |       email: 'alex@example.com',
  115 |       displayName: 'Alex Morgan',
  116 |       username: 'alexm',
  117 |       createdAt: '2026-10-01T10:00:00Z',
  118 |     }))
  119 |   })
  120 | 
  121 |   await page.route('**/api/v1/auth/me', async (route) => {
  122 |     await route.fulfill({
  123 |       status: 200,
  124 |       contentType: 'application/json',
  125 |       body: JSON.stringify({
  126 |         id: 'user-uuid-1',
  127 |         email: 'alex@example.com',
  128 |         displayName: 'Alex Morgan',
  129 |         username: 'alexm',
  130 |         createdAt: '2026-10-01T10:00:00Z',
  131 |       }),
  132 |     })
  133 |   })
  134 | 
  135 |   await page.route('**/api/v1/scenarios', async (route) => {
  136 |     await route.fulfill({
  137 |       status: 200,
  138 |       contentType: 'application/json',
  139 |       body: JSON.stringify([
  140 |         {
  141 |           id: 'sc-1',
  142 |           name: 'Retirement 2050',
  143 |           scenarioType: 'RETIREMENT',
  144 |           createdAt: '2026-10-02T08:00:00Z',
  145 |         },
  146 |       ]),
  147 |     })
  148 |   })
  149 | 
  150 |   await page.goto('/account')
  151 |   await expect(page.getByRole('heading', { name: 'Alex Morgan' })).toBeVisible()
  152 |   await expect(page.getByText('@alexm')).toBeVisible()
  153 |   await expect(page.getByText('Retirement 2050')).toBeVisible()
  154 | 
  155 |   // Test logout
  156 |   await page.getByRole('button', { name: /sign out/i }).click()
  157 |   await expect(page.getByText(/signed out successfully/i)).toBeVisible()
  158 |   const clearedToken = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  159 |   expect(clearedToken).toBeNull()
  160 | })
  161 | 
```