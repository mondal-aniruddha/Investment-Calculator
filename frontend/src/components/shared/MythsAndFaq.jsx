import { useState } from 'react'

const MYTHS = [
  {
    myth: 'Investing in mutual funds requires lakhs of rupees.',
    fact: 'You can start a Systematic Investment Plan (SIP) in diversified Indian index funds with as little as ₹100 to ₹500 per month.',
    detail: 'Consistency matters far more than starting capital. Investing ₹1,000 every month at 12% annual return compounds to over ₹10 Lakh in 20 years.'
  },
  {
    myth: 'Credit cards always lead to debt traps.',
    fact: 'If you pay the 100% "Total Amount Due" on time every month, credit cards are completely interest-free for up to 45-50 days and build a 750+ CIBIL score for free.',
    detail: 'The trap only occurs when you pay the "Minimum Amount Due", which triggers 3.5% monthly (42% p.a.) finance charges on the entire balance.'
  },
  {
    myth: 'The Old Tax Regime is always better because it gives 80C deductions.',
    fact: 'Under the New Tax Regime, any salaried individual earning up to ₹7.75 Lakhs pays ₹0 tax thanks to the ₹75,000 standard deduction and Section 87A rebate.',
    detail: 'For incomes above ₹10 Lakh, the Old Regime is only beneficial if your total deductions (80C, 80D, HRA, home loan interest) exceed ₹3.75–4.0 Lakhs.'
  },
  {
    myth: 'Endowment life insurance policies give both high insurance and great returns.',
    fact: 'Traditional endowment and money-back plans typically deliver returns of only 4.5% to 5.5% (failing to beat 6% inflation) while offering dangerously tiny life cover.',
    detail: 'The smart strategy: Buy a pure Term Insurance policy for ₹1 Crore cover at ~₹800/month, and invest the remaining surplus into a low-cost mutual fund.'
  },
  {
    myth: 'Keeping all money in a savings bank account is 100% safe.',
    fact: 'While your nominal balance never drops, 6% Indian inflation silently eats your purchasing power. A 3% savings interest rate yields a NEGATIVE real return of -3% every year.',
    detail: 'Keep 1–2 months expenses in savings, 3–6 months emergency buffer in liquid funds/sweep-in FDs, and put long-term money into assets that beat inflation.'
  }
]

const FAQS = [
  {
    q: 'How much should I save from my first salary?',
    a: 'A great benchmark is the 50/30/20 rule: 50% for living needs (rent, groceries, bills), 30% for lifestyle wants (dining, shopping, hobbies), and at least 20% dedicated to savings, emergency buffer, and automated SIPs.'
  },
  {
    q: 'What is the best mutual fund for a 22-year-old beginner?',
    a: 'A low-cost Nifty 50 Index Fund or Nifty LargeMidcap 250 Index Fund with a direct plan and low expense ratio (0.1% to 0.2%). It eliminates manager risk and automatically holds India\'s top corporate powerhouses.'
  },
  {
    q: 'How do I check my CIBIL score without paying?',
    a: 'Under Reserve Bank of India (RBI) mandates, all four credit bureaus (TransUnion CIBIL, Experian, Equifax, CRIF High Mark) provide one free full credit report per calendar year directly on their official websites.'
  },
  {
    q: 'Is InFinance really free and login-free?',
    a: 'Yes. InFinance requires no account creation, no email registration, and no mobile number. All calculations run statelessly without recording or storing your personal financial inputs.'
  }
]

export function MythsAndFaq() {
  const [openMyth, setOpenMyth] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  const toggleMyth = (idx) => setOpenMyth(openMyth === idx ? null : idx)
  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx)

  return (
    <div className="myths-faq-section">
      {/* Myths vs Facts */}
      <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
        <div className="section-label">MYTHS VS REALITY · INDIA MONEY FACTS</div>
        <h2 style={{ fontSize: '24px', margin: '8px 0 16px' }}>5 Costly Money Myths Debunked</h2>
        <div className="accordion-list">
          {MYTHS.map((item, idx) => {
            const isOpen = openMyth === idx
            return (
              <div key={idx} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleMyth(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="myth-title-badge">❌ Myth: {item.myth}</span>
                  <span className="accordion-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="accordion-content">
                    <div className="fact-box">
                      <span className="fact-badge">✓ FACT</span>
                      <p className="fact-text">{item.fact}</p>
                    </div>
                    <p className="fact-detail">{item.detail}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card" style={{ padding: '28px' }}>
        <div className="section-label">COMMON QUESTIONS</div>
        <h2 style={{ fontSize: '24px', margin: '8px 0 16px' }}>Frequently Asked Questions</h2>
        <div className="accordion-list">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span style={{ fontWeight: 600 }}>{item.q}</span>
                  <span className="accordion-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="accordion-content">
                    <p style={{ color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

