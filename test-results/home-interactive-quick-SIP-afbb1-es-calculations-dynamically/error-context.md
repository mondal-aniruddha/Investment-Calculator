# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.js >> interactive quick SIP estimator slider updates calculations dynamically
- Location: e2e\home.spec.js:162:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.result-total-amount')
Expected substring: "₹23"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" locator('.result-total-amount') with timeout 5000ms
  - waiting for locator('.result-total-amount')

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
  166 |       contentType: 'application/json',
  167 |       body: JSON.stringify(mockMetalsLive),
  168 |     })
  169 |   })
  170 | 
  171 |   await page.goto('/')
  172 | 
  173 |   const monthlySlider = page.getByLabel(/monthly investment/i)
  174 |   await expect(monthlySlider).toBeVisible()
  175 | 
  176 |   // Default at ₹10,000 for 10 yrs at 12% is ~₹23.23 Lakh
> 177 |   await expect(page.locator('.result-total-amount')).toContainText('₹23')
      |                                                      ^ Error: expect(locator).toContainText(expected) failed
  178 | 
  179 |   // Change monthly investment to 25000
  180 |   await monthlySlider.fill('25000')
  181 |   // Value should now be higher (~₹58 Lakh)
  182 |   await expect(page.locator('.result-total-amount')).toContainText('₹58')
  183 | })
  184 | 
```