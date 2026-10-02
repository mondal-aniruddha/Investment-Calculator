# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: metals-prices.spec.js >> displays stale badge on temporary failure when prior data exists
- Location: e2e\metals-prices.spec.js:134:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('₹7,450.50')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('₹7,450.50') with timeout 5000ms
  - waiting for getByText('₹7,450.50')

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
  93  |   await expect(skeleton).toBeVisible()
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
> 159 |   await expect(page.getByText('₹7,450.50')).toBeVisible()
      |                                             ^ Error: expect(locator).toBeVisible() failed
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
  194 |   })
  195 | 
  196 |   await page.goto('/')
  197 | 
  198 |   // Calm non-blocking notice shown
  199 |   await expect(page.getByText(/metal reference prices are temporarily unavailable/i)).toBeVisible()
  200 |   await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  201 | 
  202 |   // SIP calculator remains completely operational
  203 |   await expect(page.getByRole('heading', { name: /plan your SIP/i })).toBeVisible()
  204 |   await page.getByRole('button', { name: /^calculate/i }).click()
  205 |   await expect(page.getByText('₹1,45,000')).toBeVisible()
  206 | })
  207 | 
  208 | test('manual refresh updates metal prices on screen', async ({ page }) => {
  209 |   let callCount = 0
  210 |   await page.route('**/api/v1/market/metals', async (route) => {
  211 |     callCount += 1
  212 |     const price = callCount === 1 ? 7450.50 : 7600.00
  213 |     const goldItem = {
  214 |       ...mockMetalsLive.metals[0],
  215 |       pricePerGramInr: price,
  216 |       pricePer10GramsInr: price * 10,
  217 |     }
  218 |     await route.fulfill({
  219 |       status: 200,
  220 |       contentType: 'application/json',
  221 |       body: JSON.stringify({
  222 |         ...mockMetalsLive,
  223 |         metals: [goldItem, ...mockMetalsLive.metals.slice(1)],
  224 |       }),
  225 |     })
  226 |   })
  227 | 
  228 |   await page.goto('/')
  229 |   await expect(page.getByText('₹7,450.50')).toBeVisible()
  230 | 
  231 |   // Click Refresh
  232 |   await page.getByRole('button', { name: /refresh metal prices/i }).click()
  233 |   await expect(page.getByText('₹7,600.00')).toBeVisible()
  234 | })
  235 | 
```