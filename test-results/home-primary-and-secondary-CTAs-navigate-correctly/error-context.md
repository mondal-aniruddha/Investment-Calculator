# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.js >> primary and secondary CTAs navigate correctly
- Location: e2e\home.spec.js:115:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /start a sip plan/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link "↗ infinance" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: ↗
        - generic [ref=e7]: infinance
      - navigation "Main navigation" [ref=e8]:
        - button "SIP planner" [ref=e9] [cursor=pointer]
        - button "Loan & EMI" [ref=e10] [cursor=pointer]
        - button "Fixed income" [ref=e11] [cursor=pointer]
        - button "Mutual fund tools" [ref=e12] [cursor=pointer]
        - button "Smart planning" [ref=e13] [cursor=pointer]
        - button "Onboarding" [ref=e14] [cursor=pointer]
        - button "Education" [ref=e15] [cursor=pointer]
        - link "Account" [ref=e16] [cursor=pointer]:
          - /url: /account
      - generic [ref=e17]:
        - generic "Language" [ref=e18]:
          - combobox "Language" [ref=e20]:
            - option "EN" [selected]
            - option "हिंदी"
            - option "বাংলা"
        - button "Dark mode" [ref=e21] [cursor=pointer]: ◐
        - generic [ref=e22]: API connected
        - link "Sign in" [ref=e24] [cursor=pointer]:
          - /url: /login
    - main [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]: ✦ YOUR MONEY, MADE CLEAR
        - heading [level=1] [ref=e28]:
          - text: Plan with clarity.
          - emphasis [ref=e29]: Grow with intention.
        - paragraph [ref=e30]: Illustrative tools for Indian investments, loans, and long-term decisions.
      - region "Live metal prices" [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]: MARKET REFERENCE · INR / GRAM
            - heading "Live metal prices" [level=2] [ref=e35]
          - generic [ref=e36]:
            - generic [ref=e37]: ● Live
            - generic "Indian Standard Time (Asia/Kolkata)" [ref=e38]: "Last updated: 13 Oct 2026, 3:30:00 pm"
            - button "Refresh metal prices" [ref=e39] [cursor=pointer]: ↻ Refresh metal prices
        - generic [ref=e40]:
          - article "Gold (24K Reference)" [ref=e41]:
            - generic [ref=e42]:
              - generic [ref=e43]:
                - generic [ref=e44]: XAU
                - generic [ref=e45]: 99.9%
              - heading "Gold (24K Reference)" [level=3] [ref=e46]
              - generic [ref=e47]:
                - text: ₹7,450.00
                - generic [ref=e48]: / g
              - generic [ref=e49]: ₹74,500.00 / 10 g
            - generic [ref=e50]:
              - generic [ref=e51]: "22K Indicative: ₹6,830.00"
              - generic [ref=e52]: Indicative purity conversion (22/24), not a jeweller retail price (excludes GST, making charges, margins)
          - article "Silver (99.9%)" [ref=e53]:
            - generic [ref=e54]:
              - generic [ref=e55]:
                - generic [ref=e56]: XAG
                - generic [ref=e57]: 99.9%
              - heading "Silver (99.9%)" [level=3] [ref=e58]
              - generic [ref=e59]:
                - text: ₹92.50
                - generic [ref=e60]: / g
              - generic [ref=e61]: ₹925.00 / 10 g
        - generic [ref=e62]:
          - generic [ref=e63]: "Source: metals.dev"
          - generic [ref=e64]: Indicative reference prices for planning.
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - text: Monthly investment
            - generic [ref=e68]:
              - generic [ref=e69]: ₹
              - spinbutton "Monthly investment ₹" [ref=e70]: "10000"
          - generic [ref=e71]:
            - generic [ref=e72]:
              - text: Time horizon
              - generic [ref=e73]:
                - spinbutton "Time horizon years" [ref=e74]: "10"
                - generic [ref=e75]: years
            - generic [ref=e76]:
              - text: Expected return
              - generic [ref=e77]:
                - spinbutton "Expected return % p.a." [ref=e78]: "12"
                - generic [ref=e79]: "% p.a."
          - generic [ref=e80]:
            - text: Annual step-up
            - generic [ref=e81]:
              - spinbutton "Annual step-up %" [ref=e82]: "10"
              - generic [ref=e83]: "%"
          - generic [ref=e84]:
            - text: Risk profile
            - combobox "Risk profile" [ref=e85]:
              - option "LOW"
              - option "MODERATE" [selected]
              - option "AGGRESSIVE"
          - button "Calculate →" [ref=e86] [cursor=pointer]:
            - text: Calculate
            - generic [ref=e87]: →
        - generic [ref=e88]:
          - generic [ref=e89]:
            - generic [ref=e90]: 01 / INVESTING
            - heading "Plan your SIP" [level=2] [ref=e91]
            - paragraph [ref=e92]: Enter assumptions to see an illustrative projection.
          - generic [ref=e93]:
            - generic [ref=e94]: YOUR ESTIMATE
            - heading "Run the calculator" [level=2] [ref=e95]
            - paragraph [ref=e96]: Projected SIP corpus
            - generic [ref=e97]:
              - generic [ref=e98]:
                - generic [ref=e99]: Invested / paid
                - strong [ref=e100]: ₹0
              - generic [ref=e101]:
                - generic [ref=e102]: Returns / interest
                - strong [ref=e103]: ₹0
              - generic [ref=e104]:
                - generic [ref=e105]: Assumptions
                - strong [ref=e106]: Configured
          - generic [ref=e107]:
            - generic [ref=e108]: HOW IT WORKS
            - paragraph [ref=e109]: A SIP invests the selected amount monthly. The step-up option increases that contribution once per year. The backend compounds each instalment at the configured annual return and returns scenario and yearly projections.
            - generic [ref=e110]: For education only. Not investment, tax, legal, or financial advice.
    - contentinfo [ref=e111]:
      - generic [ref=e112]: © 2025 inFinance
      - generic [ref=e113]: Educational estimates, not financial advice.
      - generic [ref=e114]: India · INR
  - region "Notifications"
```

# Test source

```ts
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
  65  |   await expect(h1).toBeVisible()
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
> 127 |   await page.getByRole('button', { name: /start a sip plan/i }).click()
      |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  177 |   await expect(page.locator('.result-total-amount')).toContainText('₹23')
  178 | 
  179 |   // Change monthly investment to 25000
  180 |   await monthlySlider.fill('25000')
  181 |   // Value should now be higher (~₹58 Lakh)
  182 |   await expect(page.locator('.result-total-amount')).toContainText('₹58')
  183 | })
  184 | 
```