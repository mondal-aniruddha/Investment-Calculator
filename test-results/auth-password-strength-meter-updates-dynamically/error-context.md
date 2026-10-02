# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> password strength meter updates dynamically
- Location: e2e\auth.spec.js:36:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/weak/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/weak/i) with timeout 5000ms
  - waiting for getByText(/weak/i)

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
  - text: ↗
  - heading "infinance" [level=2]
  - paragraph: Start saving and comparing your personal financial projections.
  - text: 🛡
  - strong: Bank-grade Security
  - paragraph: BCrypt salted password hashing with adaptive work factor.
  - text: ⚡
  - strong: Stateless Authentication
  - paragraph: HMAC-SHA256 JWT tokens with safe sessionStorage lifecycle.
  - text: 🔒
  - strong: Saved Financial Scenarios
  - paragraph: Confidential scenario storage tied strictly to your user ID.
  - tablist:
    - tab "Sign in"
    - tab "Create account" [selected]
  - tabpanel "Create account":
    - heading "Create your profile" [level=1]
    - paragraph: Start saving and comparing your personal financial projections.
    - text: Email address
    - textbox "Email address":
      - /placeholder: name@example.com
    - text: Username (optional)
    - textbox "Username (optional)":
      - /placeholder: e.g. aniruddha
    - text: Display name
    - textbox "Display name":
      - /placeholder: Full name
    - text: Phone number (optional)
    - textbox "Phone number (optional)":
      - /placeholder: +91 98765 43210
    - text: Password
    - button "Show password": Show 👁
    - textbox "Password": abcd
    - text: "Password strength:"
    - strong
    - list:
      - listitem: ○ 8+ characters
      - listitem: ○ Upper & lower case
      - listitem: ○ At least 1 number
    - text: Confirm password
    - button "Show password": Show 👁
    - textbox "Confirm password"
    - button "Create account →" [disabled]
    - button "Already have an account? Sign in"
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
> 43  |   await expect(page.getByText(/weak/i)).toBeVisible()
      |                                         ^ Error: expect(locator).toBeVisible() failed
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
  99  |   await expect(page.getByText('Alex Morgan')).toBeVisible()
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
```