# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> authenticated user can access /account, view details and logout
- Location: e2e\auth.spec.js:108:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/signed out successfully/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/signed out successfully/i) with timeout 5000ms
  - waiting for getByText(/signed out successfully/i)

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
  - paragraph: Sign in to access your saved investment scenarios and plans.
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
    - tab "Sign in" [selected]
    - tab "Create account"
  - tabpanel "Sign in":
    - heading "Welcome back" [level=1]
    - paragraph: Sign in to access your saved investment scenarios and plans.
    - text: Email or username
    - textbox "Email or username":
      - /placeholder: name@example.com or username
    - text: Password
    - button "Show password": Show 👁
    - textbox "Password"
    - button "Sign in →" [disabled]
    - button "Need an account? Register here"
- contentinfo: © 2025 inFinance Educational estimates, not financial advice. India · INR
- region "Notifications"
```

# Test source

```ts
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
> 157 |   await expect(page.getByText(/signed out successfully/i)).toBeVisible()
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  158 |   const clearedToken = await page.evaluate(() => sessionStorage.getItem('infinance-token'))
  159 |   expect(clearedToken).toBeNull()
  160 | })
  161 | 
```