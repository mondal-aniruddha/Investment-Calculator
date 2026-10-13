# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.js >> loads "/" and asserts h1 and all main sections are visible
- Location: e2e\home.spec.js:52:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1#hero-title')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h1#hero-title') with timeout 5000ms
  - waiting for locator('h1#hero-title')

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
  - region "Live metal prices":
    - text: MARKET REFERENCE · INR / GRAM
    - heading "Live metal prices" [level=2]
    - text: "● Live Last updated: 13 Oct 2026, 3:30:00 pm"
    - button "Refresh metal prices": ↻ Refresh metal prices
    - article "Gold (24K Reference)":
      - text: XAU 99.9%
      - heading "Gold (24K Reference)" [level=3]
      - text: "₹7,450.00 / g ₹74,500.00 / 10 g 22K Indicative: ₹6,830.00 Indicative purity conversion (22/24), not a jeweller retail price (excludes GST, making charges, margins)"
    - article "Silver (99.9%)":
      - text: XAG 99.9%
      - heading "Silver (99.9%)" [level=3]
      - text: ₹92.50 / g ₹925.00 / 10 g
    - text: "Source: metals.dev Indicative reference prices for planning."
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
  3   | const mockMetalsLive = {
  4   |   metals: [
  5   |     {
  6   |       metalCode: 'XAU',
  7   |       symbol: 'XAU',
  8   |       displayName: 'Gold (24K Reference)',
  9   |       purity: '99.9%',
  10  |       pricePerGramInr: 7450.0,
  11  |       pricePer10GramsInr: 74500.0,
  12  |       indicative22kPerGramInr: 6830.0,
  13  |       indicative22kPer10GramsInr: 68300.0,
  14  |       sourceTimestamp: '2026-10-13T10:00:00.000Z',
  15  |       fetchedAt: '2026-10-13T10:00:00.000Z',
  16  |       cacheStatus: 'LIVE',
  17  |       source: 'metals.dev',
  18  |       disclaimer: 'Indicative MCX reference prices for planning.',
  19  |     },
  20  |     {
  21  |       metalCode: 'XAG',
  22  |       symbol: 'XAG',
  23  |       displayName: 'Silver (99.9%)',
  24  |       purity: '99.9%',
  25  |       pricePerGramInr: 92.5,
  26  |       pricePer10GramsInr: 925.0,
  27  |       indicative22kPerGramInr: null,
  28  |       indicative22kPer10GramsInr: null,
  29  |       sourceTimestamp: '2026-10-13T10:00:00.000Z',
  30  |       fetchedAt: '2026-10-13T10:00:00.000Z',
  31  |       cacheStatus: 'LIVE',
  32  |       source: 'metals.dev',
  33  |       disclaimer: 'Indicative MCX reference prices for planning.',
  34  |     },
  35  |   ],
  36  |   fetchedAt: '2026-10-13T10:00:00.000Z',
  37  |   cacheStatus: 'LIVE',
  38  |   source: 'metals.dev',
  39  |   disclaimer: 'Indicative reference prices for planning.',
  40  | }
  41  | 
  42  | test.beforeEach(async ({ page }) => {
  43  |   await page.route('**/actuator/health', (route) =>
  44  |     route.fulfill({
  45  |       status: 200,
  46  |       contentType: 'application/json',
  47  |       body: JSON.stringify({ status: 'UP' }),
  48  |     })
  49  |   )
  50  | })
  51  | 
  52  | test('loads "/" and asserts h1 and all main sections are visible', async ({ page }) => {
  53  |   await page.route('**/api/v1/market/metals', async (route) => {
  54  |     await route.fulfill({
  55  |       status: 200,
  56  |       contentType: 'application/json',
  57  |       body: JSON.stringify(mockMetalsLive),
  58  |     })
  59  |   })
  60  | 
  61  |   await page.goto('/')
  62  | 
  63  |   // 1. Hero
  64  |   const h1 = page.locator('h1#hero-title')
> 65  |   await expect(h1).toBeVisible()
      |                    ^ Error: expect(locator).toBeVisible() failed
  66  |   await expect(h1).toHaveText(/plan your money with clarity/i)
  67  |   await expect(page.getByRole('button', { name: /start a sip plan/i })).toBeVisible()
  68  |   await expect(page.getByRole('button', { name: /explore the learn hub/i })).toBeVisible()
  69  |   await expect(page.getByLabel('Illustrative SIP projection card')).toBeVisible()
  70  | 
  71  |   // 2. Trust strip
  72  |   await expect(page.getByText(/free to use/i)).toBeVisible()
  73  |   await expect(page.getByText(/inr & indian number formatting/i)).toBeVisible()
  74  |   await expect(page.getByText(/educational, not advice/i)).toBeVisible()
  75  | 
  76  |   // 3. Calculator grid
  77  |   await expect(page.getByRole('heading', { name: /financial calculators for india/i })).toBeVisible()
  78  |   const calcGrid = page.locator('.calc-grid-container')
  79  |   await expect(calcGrid.getByRole('link', { name: /sip & lumpsum/i })).toBeVisible()
  80  |   await expect(calcGrid.getByRole('link', { name: /loan & emi/i })).toBeVisible()
  81  |   await expect(calcGrid.getByRole('link', { name: /fixed income/i })).toBeVisible()
  82  |   await expect(calcGrid.getByRole('link', { name: /mutual fund tools/i })).toBeVisible()
  83  | 
  84  |   // 4. Quick calculator teaser
  85  |   await expect(page.getByRole('heading', { name: /interactive sip estimator/i })).toBeVisible()
  86  |   await expect(page.getByLabel(/monthly investment/i)).toBeVisible()
  87  |   await expect(page.getByLabel(/time horizon/i)).toBeVisible()
  88  |   await expect(page.getByLabel(/expected annual return/i)).toBeVisible()
  89  |   await expect(page.getByText(/see full plan in sip planner/i)).toBeVisible()
  90  | 
  91  |   // 5. How it works
  92  |   await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible()
  93  |   await expect(page.getByRole('heading', { name: /enter your numbers/i })).toBeVisible()
  94  |   await expect(page.getByRole('heading', { name: /see explainable results with scenarios/i })).toBeVisible()
  95  |   await expect(page.getByRole('heading', { name: /save, compare and export/i })).toBeVisible()
  96  | 
  97  |   // 6. Why InFinance
  98  |   await expect(page.getByRole('heading', { name: /built with purpose and integrity/i })).toBeVisible()
  99  |   await expect(page.getByRole('heading', { name: 'Explainable results', exact: true })).toBeVisible()
  100 |   await expect(page.getByRole('heading', { name: /scenario comparison/i })).toBeVisible()
  101 |   await expect(page.getByRole('heading', { name: /multilingual & accessible/i })).toBeVisible()
  102 |   await expect(page.getByRole('heading', { name: /privacy-minded/i })).toBeVisible()
  103 | 
  104 |   // 7. Live metals reference prices
  105 |   await expect(page.getByLabel('Live metal prices')).toBeVisible()
  106 | 
  107 |   // 8. Learn Hub / Roadmap teaser
  108 |   await expect(page.getByRole('heading', { name: /from our learn hub/i })).toBeVisible()
  109 |   await expect(page.getByRole('link', { name: /follow the 6-step beginner roadmap/i })).toBeVisible()
  110 | 
  111 |   // 9. Disclaimer
  112 |   await expect(page.getByLabel('Educational Disclaimer')).toBeVisible()
  113 | })
  114 | 
  115 | test('primary and secondary CTAs navigate correctly', async ({ page }) => {
  116 |   await page.route('**/api/v1/market/metals', async (route) => {
  117 |     await route.fulfill({
  118 |       status: 200,
  119 |       contentType: 'application/json',
  120 |       body: JSON.stringify(mockMetalsLive),
  121 |     })
  122 |   })
  123 | 
  124 |   await page.goto('/')
  125 | 
  126 |   // Primary CTA navigates to SIP planner
  127 |   await page.getByRole('button', { name: /start a sip plan/i }).click()
  128 |   await expect(page).toHaveURL(/.*\/sip/)
  129 |   await expect(page.getByRole('heading', { name: /sip & step-up planner/i })).toBeVisible()
  130 | 
  131 |   // Go back and click secondary CTA
  132 |   await page.goto('/')
  133 |   await page.getByRole('button', { name: /explore the learn hub/i }).click()
  134 |   await expect(page).toHaveURL(/.*\/learn/)
  135 |   await expect(page.getByRole('heading', { name: /money made simple/i })).toBeVisible()
  136 | })
  137 | 
  138 | test('renders gracefully and remains operational when /api/v1/market/metals returns 503', async ({ page }) => {
  139 |   await page.route('**/api/v1/market/metals', async (route) => {
  140 |     await route.fulfill({
  141 |       status: 503,
  142 |       contentType: 'application/json',
  143 |       body: JSON.stringify({ error: 'Service Unavailable' }),
  144 |     })
  145 |   })
  146 | 
  147 |   await page.goto('/')
  148 | 
  149 |   // Confirm page is not blank
  150 |   await expect(page.locator('h1#hero-title')).toBeVisible()
  151 |   await expect(page.locator('h1#hero-title')).toHaveText(/plan your money with clarity/i)
  152 | 
  153 |   // Metals panel should display calm unavailable card without throwing runtime errors
  154 |   await expect(page.getByText(/metal reference prices are temporarily unavailable/i)).toBeVisible()
  155 |   await expect(page.getByText(/indicative reference prices, not a jeweller's retail rate/i).first()).toBeVisible()
  156 | 
  157 |   // Calculators and other sections must still be fully visible
  158 |   await expect(page.getByRole('heading', { name: /financial calculators for india/i })).toBeVisible()
  159 |   await expect(page.getByRole('heading', { name: /interactive sip estimator/i })).toBeVisible()
  160 | })
  161 | 
  162 | test('interactive quick SIP estimator slider updates calculations dynamically', async ({ page }) => {
  163 |   await page.route('**/api/v1/market/metals', async (route) => {
  164 |     await route.fulfill({
  165 |       status: 200,
```