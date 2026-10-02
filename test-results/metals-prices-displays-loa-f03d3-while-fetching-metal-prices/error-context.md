# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: metals-prices.spec.js >> displays loading skeleton while fetching metal prices
- Location: e2e\metals-prices.spec.js:80:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[aria-label="Loading metal prices"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('[aria-label="Loading metal prices"]') with timeout 5000ms
  - waiting for locator('[aria-label="Loading metal prices"]')

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
  3   | const mockMetalsLive = {
  4   |   metals: [
  5   |     {
  6   |       metalCode: 'XAU',
  7   |       symbol: 'XAU',
  8   |       displayName: 'Gold',
  9   |       purity: '24K (99.9% Spot Reference)',
  10  |       pricePerGramInr: 7450.50,
  11  |       pricePer10GramsInr: 74505.00,
  12  |       indicative22kPerGramInr: 6829.63,
  13  |       indicative22kPer10GramsInr: 68296.25,
  14  |       sourceTimestamp: '2026-10-01T10:00:00Z',
  15  |       fetchedAt: '2026-10-01T10:00:00Z',
  16  |       cacheStatus: 'LIVE',
  17  |       source: 'Metals-API',
  18  |       disclaimer: 'Indicative international reference prices for educational planning.',
  19  |     },
  20  |     {
  21  |       metalCode: 'XAG',
  22  |       symbol: 'XAG',
  23  |       displayName: 'Silver',
  24  |       purity: '99.9% Spot Reference',
  25  |       pricePerGramInr: 91.20,
  26  |       pricePer10GramsInr: null,
  27  |       indicative22kPerGramInr: null,
  28  |       indicative22kPer10GramsInr: null,
  29  |       sourceTimestamp: '2026-10-01T10:00:00Z',
  30  |       fetchedAt: '2026-10-01T10:00:00Z',
  31  |       cacheStatus: 'LIVE',
  32  |       source: 'Metals-API',
  33  |       disclaimer: 'Indicative international reference prices for educational planning.',
  34  |     },
  35  |     {
  36  |       metalCode: 'XPT',
  37  |       symbol: 'XPT',
  38  |       displayName: 'Platinum',
  39  |       purity: '99.95% Spot Reference',
  40  |       pricePerGramInr: 2680.00,
  41  |       pricePer10GramsInr: null,
  42  |       indicative22kPerGramInr: null,
  43  |       indicative22kPer10GramsInr: null,
  44  |       sourceTimestamp: '2026-10-01T10:00:00Z',
  45  |       fetchedAt: '2026-10-01T10:00:00Z',
  46  |       cacheStatus: 'LIVE',
  47  |       source: 'Metals-API',
  48  |       disclaimer: 'Indicative international reference prices for educational planning.',
  49  |     },
  50  |     {
  51  |       metalCode: 'XPD',
  52  |       symbol: 'XPD',
  53  |       displayName: 'Palladium',
  54  |       purity: '99.95% Spot Reference',
  55  |       pricePerGramInr: 2850.00,
  56  |       pricePer10GramsInr: null,
  57  |       indicative22kPerGramInr: null,
  58  |       indicative22kPer10GramsInr: null,
  59  |       sourceTimestamp: '2026-10-01T10:00:00Z',
  60  |       fetchedAt: '2026-10-01T10:00:00Z',
  61  |       cacheStatus: 'LIVE',
  62  |       source: 'Metals-API',
  63  |       disclaimer: 'Indicative international reference prices for educational planning.',
  64  |     },
  65  |   ],
  66  |   fetchedAt: '2026-10-01T10:00:00Z',
  67  |   cacheStatus: 'LIVE',
  68  |   source: 'Metals-API',
  69  |   disclaimer: 'Indicative international reference prices for educational planning. Not MCX tradable quotes or local jewellery retail prices.',
  70  | }
  71  | 
  72  | test.beforeEach(async ({ page }) => {
  73  |   await page.route('**/actuator/health', (route) => route.fulfill({
  74  |     status: 200,
  75  |     contentType: 'application/json',
  76  |     body: JSON.stringify({ status: 'UP' }),
  77  |   }))
  78  | })
  79  | 
  80  | test('displays loading skeleton while fetching metal prices', async ({ page }) => {
  81  |   await page.route('**/api/v1/market/metals', async (route) => {
  82  |     // delay response to verify skeleton visibility
  83  |     await new Promise((resolve) => setTimeout(resolve, 800))
  84  |     await route.fulfill({
  85  |       status: 200,
  86  |       contentType: 'application/json',
  87  |       body: JSON.stringify(mockMetalsLive),
  88  |     })
  89  |   })
  90  | 
  91  |   await page.goto('/')
  92  |   const skeleton = page.locator('[aria-label="Loading metal prices"]')
> 93  |   await expect(skeleton).toBeVisible()
      |                          ^ Error: expect(locator).toBeVisible() failed
  94  |   await expect(page.getByText('Gold (24K Reference)')).toBeVisible()
  95  | })
  96  | 
  97  | test('displays populated 4 metal prices with INR formatting, timestamps, and disclaimers', async ({ page }) => {
  98  |   await page.route('**/api/v1/market/metals', async (route) => {
  99  |     await route.fulfill({
  100 |       status: 200,
  101 |       contentType: 'application/json',
  102 |       body: JSON.stringify(mockMetalsLive),
  103 |     })
  104 |   })
  105 | 
  106 |   await page.goto('/')
  107 | 
  108 |   // Section title and live badge
  109 |   await expect(page.getByRole('heading', { name: /live metal prices/i })).toBeVisible()
  110 |   await expect(page.getByText(/live/i).first()).toBeVisible()
  111 | 
  112 |   // Four metals cards
  113 |   await expect(page.getByText('Gold (24K Reference)')).toBeVisible()
  114 |   await expect(page.getByText('₹7,450.50')).toBeVisible()
  115 |   await expect(page.getByText('₹74,505.00')).toBeVisible()
  116 |   await expect(page.getByText('22K Indicative: ₹6,829.63')).toBeVisible()
  117 |   await expect(page.getByText(/not local jeweller retail rate/i)).toBeVisible()
  118 | 
  119 |   await expect(page.getByText('Silver (99.9%)')).toBeVisible()
  120 |   await expect(page.getByText('₹91.20')).toBeVisible()
  121 | 
  122 |   await expect(page.getByText('Platinum (99.95%)')).toBeVisible()
  123 |   await expect(page.getByText('₹2,680.00')).toBeVisible()
  124 | 
  125 |   await expect(page.getByText('Palladium (99.95%)')).toBeVisible()
  126 |   await expect(page.getByText('₹2,850.00')).toBeVisible()
  127 | 
  128 |   // Last updated and source
  129 |   await expect(page.getByText(/last updated/i)).toBeVisible()
  130 |   await expect(page.getByText(/source: metals-api/i)).toBeVisible()
  131 |   await expect(page.getByText(/indicative international reference prices/i).first()).toBeVisible()
  132 | })
  133 | 
  134 | test('displays stale badge on temporary failure when prior data exists', async ({ page }) => {
  135 |   let callCount = 0
  136 |   await page.route('**/api/v1/market/metals', async (route) => {
  137 |     callCount += 1
  138 |     if (callCount === 1) {
  139 |       await route.fulfill({
  140 |         status: 200,
  141 |         contentType: 'application/json',
  142 |         body: JSON.stringify({ ...mockMetalsLive, cacheStatus: 'CACHED' }),
  143 |       })
  144 |     } else {
  145 |       // Second call fails with 503
  146 |       await route.fulfill({
  147 |         status: 503,
  148 |         contentType: 'application/json',
  149 |         body: JSON.stringify({
  150 |           status: 503,
  151 |           code: 'METALS_SERVICE_UNAVAILABLE',
  152 |           message: 'Upstream provider unavailable',
  153 |         }),
  154 |       })
  155 |     }
  156 |   })
  157 | 
  158 |   await page.goto('/')
  159 |   await expect(page.getByText('₹7,450.50')).toBeVisible()
  160 | 
  161 |   // Click manual refresh which triggers the failing call
  162 |   const refreshButton = page.getByRole('button', { name: /refresh metal prices/i })
  163 |   await refreshButton.click()
  164 | 
  165 |   // Prior data must remain displayed and marked Stale
  166 |   await expect(page.getByText('₹7,450.50')).toBeVisible()
  167 |   await expect(page.getByText(/stale/i).first()).toBeVisible()
  168 | })
  169 | 
  170 | test('displays calm non-blocking unavailable state without breaking calculators', async ({ page }) => {
  171 |   await page.route('**/api/v1/market/metals', async (route) => {
  172 |     await route.fulfill({
  173 |       status: 503,
  174 |       contentType: 'application/json',
  175 |       body: JSON.stringify({
  176 |         status: 503,
  177 |         code: 'METALS_SERVICE_UNAVAILABLE',
  178 |         message: 'Live metal reference prices are temporarily unavailable.',
  179 |       }),
  180 |     })
  181 |   })
  182 | 
  183 |   await page.route('**/api/v1/investing/sip', async (route) => {
  184 |     await route.fulfill({
  185 |       status: 200,
  186 |       contentType: 'application/json',
  187 |       body: JSON.stringify({
  188 |         totalInvested: 120000,
  189 |         maturityCorpus: 145000,
  190 |         estimatedReturns: 25000,
  191 |         assumptions: { financialYear: '2024-2025' },
  192 |       }),
  193 |     })
```