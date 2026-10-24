/**
 * AskQueryPage.jsx — "Ask a Finance Query" interactive page.
 * Allows visitors to write and submit personal finance queries.
 * Displays site owner identity (Aniruddha Mondal) and direct contact details.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { DEFAULT_OWNER_CONFIG, formatTelHref, formatMailtoHref } from '../../../shared/config/owner'
import { submitFinanceQuery, fetchOwnerContact } from '../services/queryService'
import '../../../styles/queries.css'

const CATEGORY_KEYS = [
  'SIP_MUTUAL_FUNDS',
  'LUMPSUM',
  'RETIREMENT_PLANNING',
  'INCOME_TAX',
  'LOANS_EMI',
  'FIXED_INCOME',
  'GOALS_NET_WORTH',
  'OTHER',
]

export default function AskQueryPage() {
  const { t } = useTranslation()

  // Owner contact details state (fetched from backend with fallback)
  const [owner, setOwner] = useState(DEFAULT_OWNER_CONFIG)

  // Form field state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: '',
    preferredContact: 'EMAIL',
    consent: false,
    honeypot: '',
  })

  // Validation & UI status state
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successData, setSuccessData] = useState(null)
  const [copiedRef, setCopiedRef] = useState(false)

  // Fetch owner details on mount
  useEffect(() => {
    let mounted = true
    fetchOwnerContact().then((details) => {
      if (mounted && details) {
        setOwner(details)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Live field change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))

    // Clear inline error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  // Client-side validation
  const validate = () => {
    const errs = {}

    const trimmedName = formData.name.trim()
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 80) {
      errs.name = t('queries.errors.nameRequired', 'Full name is required (2–80 characters).')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = t('queries.errors.emailInvalid', 'Please enter a valid email address.')
    }

    const trimmedPhone = formData.phone.trim()
    if (trimmedPhone) {
      const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/
      if (!phoneRegex.test(trimmedPhone)) {
        errs.phone = t(
          'queries.errors.phoneInvalid',
          'Please enter a valid 10-digit Indian mobile number (+91 optional).'
        )
      }
    }

    if (!formData.category) {
      errs.category = t('queries.errors.categoryRequired', 'Please select a query category.')
    }

    const trimmedSubject = formData.subject.trim()
    if (!trimmedSubject || trimmedSubject.length < 5 || trimmedSubject.length > 120) {
      errs.subject = t('queries.errors.subjectRequired', 'Subject is required (5–120 characters).')
    }

    const trimmedMsg = formData.message.trim()
    if (!trimmedMsg || trimmedMsg.length < 20 || trimmedMsg.length > 2000) {
      errs.message = t(
        'queries.errors.messageRequired',
        'Query message must be between 20 and 2000 characters.'
      )
    }

    if (!formData.consent) {
      errs.consent = t(
        'queries.errors.consentRequired',
        'You must agree to the disclaimer and consent to proceed.'
      )
    }

    return errs
  }

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstField = Object.keys(validationErrors)[0]
      const el = document.getElementById(`field-${firstField}`)
      if (el) el.focus()
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        category: formData.category,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        preferredContact: formData.preferredContact,
        consent: formData.consent,
        honeypot: formData.honeypot || null,
      }

      const response = await submitFinanceQuery(payload)
      setSuccessData(response)
      setErrors({})
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        message: '',
        preferredContact: 'EMAIL',
        consent: false,
        honeypot: '',
      })
    } catch (err) {
      if (err.status === 429) {
        setSubmitError(
          t(
            'queries.errors.rateLimited',
            'Too many queries submitted recently. Please retry in an hour.'
          )
        )
      } else if (err.status === 503) {
        setSubmitError(
          t(
            'queries.errors.serviceUnavailable',
            'Service is temporarily unavailable. Please try again shortly.'
          )
        )
      } else {
        setSubmitError(
          err.message ||
            t(
              'queries.errors.submitFailed',
              'Failed to submit query. Please check your inputs and try again.'
            )
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Copy reference ID
  const handleCopyRef = () => {
    if (successData?.referenceId) {
      navigator.clipboard.writeText(successData.referenceId)
      setCopiedRef(true)
      setTimeout(() => setCopiedRef(false), 2500)
    }
  }

  return (
    <div className="queries-page">
      <Helmet>
        <title>{t('queries.title', 'Ask a Personal Finance Query') + ' · InFinance'}</title>
        <meta
          name="description"
          content={t(
            'queries.subtitle',
            'Have questions about SIP, mutual funds, taxes, loans, or retirement? Send your question directly to the site owner.'
          )}
        />
      </Helmet>

      {/* ── Page Header ── */}
      <header className="queries-header">
        <div className="queries-eyebrow">
          <span aria-hidden="true">✉</span>
          <span>{t('queries.ownerCard.title', 'Direct Consultation & Contact')}</span>
        </div>
        <h1 className="queries-title">{t('queries.title', 'Ask a Personal Finance Query')}</h1>
        <p className="queries-subtitle">
          {t(
            'queries.subtitle',
            'Have questions about SIP, mutual funds, taxes, loans, or retirement? Send your question directly to the site owner.'
          )}
        </p>
      </header>

      {/* ── Owner Identity Section (Top) ── */}
      <section className="owner-card-top" aria-label="Site owner information">
        <div className="owner-card-grid">
          <div className="owner-profile-meta">
            <div className="owner-avatar-bubble" aria-hidden="true">
              {owner.name ? owner.name.charAt(0) : 'A'}
            </div>
            <div>
              <h2 className="owner-name-title">{owner.name}</h2>
              <div className="owner-role-tag">
                {t('queries.ownerCard.nameLabel', 'Site Owner & Creator')}
              </div>
            </div>
          </div>

          <div className="owner-direct-callout">
            <span aria-hidden="true">💬</span>
            <span>
              {t('queries.ownerCard.callPrompt', 'Prefer to talk? Call or message me directly.')}
            </span>
          </div>

          <div className="owner-contacts-list">
            <a
              href={formatTelHref(owner.phone)}
              className="owner-contact-pill"
              aria-label={`Call or WhatsApp ${owner.phone}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{owner.phone}</span>
            </a>

            <a
              href={formatMailtoHref(owner.email, 'InFinance Consultation Query')}
              className="owner-contact-pill"
              aria-label={`Email ${owner.email}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{owner.email}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Success State ── */}
      {successData && (
        <section className="query-success-card" role="alert" aria-live="polite">
          <div className="success-badge-icon" aria-hidden="true">
            ✓
          </div>
          <h2 className="success-heading">
            {t('queries.success.title', 'Query Submitted Successfully!')}
          </h2>
          <p className="success-subtext">
            {t(
              'queries.success.message',
              'Thank you for reaching out. Your query has been recorded.'
            )}
          </p>

          <div className="reference-id-pill">
            <span className="ref-label">{t('queries.success.refIdLabel', 'Reference ID')}:</span>
            <span className="ref-code" data-testid="reference-id">
              {successData.referenceId}
            </span>
            <button
              type="button"
              className="nav-button"
              onClick={handleCopyRef}
              aria-label="Copy Reference ID"
              style={{ fontSize: '13px', padding: '4px 8px' }}
            >
              {copiedRef ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>

          <div className="success-owner-contact">
            <p>
              {t(
                'queries.success.directContactNotice',
                'Need immediate assistance? Feel free to reach out directly:'
              )}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={formatTelHref(owner.phone)} className="owner-contact-pill">
                📞 {owner.phone}
              </a>
              <a
                href={formatMailtoHref(
                  owner.email,
                  `Follow-up on Query ${successData.referenceId}`
                )}
                className="owner-contact-pill"
              >
                ✉ {owner.email}
              </a>
            </div>
          </div>

          <button
            type="button"
            className="query-submit-btn"
            onClick={() => setSuccessData(null)}
            style={{ margin: '0 auto' }}
          >
            <span>{t('queries.form.reset', 'Ask another question')}</span>
          </button>
        </section>
      )}

      {/* ── Query Form ── */}
      {!successData && (
        <div className="query-form-wrapper">
          <h2 className="query-form-title">{t('queries.title', 'Ask a Personal Finance Query')}</h2>
          <p className="query-form-desc">
            {t(
              'queries.subtitle',
              'Have questions about SIP, mutual funds, taxes, loans, or retirement? Send your question directly to the site owner.'
            )}
          </p>

          {/* Error Banner */}
          {submitError && (
            <div className="query-error-banner" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot field for bot protection */}
            <div className="query-hp-field" aria-hidden="true">
              <label htmlFor="field-honeypot">Leave blank</label>
              <input
                type="text"
                id="field-honeypot"
                name="honeypot"
                tabIndex="-1"
                autoComplete="off"
                value={formData.honeypot}
                onChange={handleChange}
              />
            </div>

            {/* Row 1: Name & Email */}
            <div className="form-grid-row">
              <div className="form-group-item">
                <label htmlFor="field-name">
                  <span>
                    {t('queries.form.fullName', 'Full Name')}
                    <span className="required-mark">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="field-name"
                  name="name"
                  placeholder={t('queries.form.fullNamePlaceholder', 'e.g. Rahul Sharma')}
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'has-error' : ''}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                  maxLength={80}
                  required
                />
                {errors.name && (
                  <div className="inline-field-error" id="error-name" role="alert">
                    <span aria-hidden="true">⚠</span>
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="form-group-item">
                <label htmlFor="field-email">
                  <span>
                    {t('queries.form.email', 'Email Address')}
                    <span className="required-mark">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  id="field-email"
                  name="email"
                  placeholder={t('queries.form.emailPlaceholder', 'e.g. rahul@example.com')}
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'has-error' : ''}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                  maxLength={320}
                  required
                />
                {errors.email && (
                  <div className="inline-field-error" id="error-email" role="alert">
                    <span aria-hidden="true">⚠</span>
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Phone & Category */}
            <div className="form-grid-row">
              <div className="form-group-item">
                <label htmlFor="field-phone">
                  <span>{t('queries.form.phone', 'Phone Number (Optional)')}</span>
                </label>
                <input
                  type="tel"
                  id="field-phone"
                  name="phone"
                  placeholder={t('queries.form.phonePlaceholder', 'e.g. +91 9876543210')}
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'has-error' : ''}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'error-phone' : undefined}
                  maxLength={32}
                />
                {errors.phone && (
                  <div className="inline-field-error" id="error-phone" role="alert">
                    <span aria-hidden="true">⚠</span>
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              <div className="form-group-item">
                <label htmlFor="field-category">
                  <span>
                    {t('queries.form.category', 'Query Category')}
                    <span className="required-mark">*</span>
                  </span>
                </label>
                <select
                  id="field-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'has-error' : ''}
                  aria-invalid={errors.category ? 'true' : 'false'}
                  aria-describedby={errors.category ? 'error-category' : undefined}
                  required
                >
                  <option value="">
                    {t('queries.form.categorySelect', 'Select a category...')}
                  </option>
                  {CATEGORY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t(`queries.form.categories.${key}`, key)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="inline-field-error" id="error-category" role="alert">
                    <span aria-hidden="true">⚠</span>
                    <span>{errors.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Subject */}
            <div className="form-group-item">
              <label htmlFor="field-subject">
                <span>
                  {t('queries.form.subject', 'Subject')}
                  <span className="required-mark">*</span>
                </span>
              </label>
              <input
                type="text"
                id="field-subject"
                name="subject"
                placeholder={t(
                  'queries.form.subjectPlaceholder',
                  'Brief summary of your question (5–120 characters)'
                )}
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'has-error' : ''}
                aria-invalid={errors.subject ? 'true' : 'false'}
                aria-describedby={errors.subject ? 'error-subject' : undefined}
                minLength={5}
                maxLength={120}
                required
              />
              {errors.subject && (
                <div className="inline-field-error" id="error-subject" role="alert">
                  <span aria-hidden="true">⚠</span>
                  <span>{errors.subject}</span>
                </div>
              )}
            </div>

            {/* Row 4: Message & Character counter */}
            <div className="form-group-item">
              <label htmlFor="field-message">
                <span>
                  {t('queries.form.message', 'Your Query / Message')}
                  <span className="required-mark">*</span>
                </span>
              </label>
              <textarea
                id="field-message"
                name="message"
                rows={5}
                placeholder={t(
                  'queries.form.messagePlaceholder',
                  'Describe your question or financial scenario in detail (20–2000 characters)...'
                )}
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'has-error' : ''}
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'error-message' : undefined}
                minLength={20}
                maxLength={2000}
                required
              />
              <div className="char-counter" aria-live="polite">
                {t('queries.form.charCount', { count: formData.message.length })}
              </div>
              {errors.message && (
                <div className="inline-field-error" id="error-message" role="alert">
                  <span aria-hidden="true">⚠</span>
                  <span>{errors.message}</span>
                </div>
              )}
            </div>

            {/* Row 5: Preferred Contact Method */}
            <div className="form-group-item">
              <label>
                <span>{t('queries.form.preferredContact', 'Preferred Contact Method')}</span>
              </label>
              <div className="preferred-contact-options" role="radiogroup">
                {['EMAIL', 'PHONE', 'EITHER'].map((method) => (
                  <label key={method} className="radio-pill-label">
                    <input
                      type="radio"
                      name="preferredContact"
                      value={method}
                      checked={formData.preferredContact === method}
                      onChange={handleChange}
                    />
                    <span>
                      {method === 'EMAIL'
                        ? t('queries.form.contactEmail', 'Email')
                        : method === 'PHONE'
                          ? t('queries.form.contactPhone', 'Phone')
                          : t('queries.form.contactEither', 'Either')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Row 6: Consent Checkbox */}
            <div className="consent-checkbox-item">
              <input
                type="checkbox"
                id="field-consent"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                aria-invalid={errors.consent ? 'true' : 'false'}
                aria-describedby={errors.consent ? 'error-consent' : undefined}
                required
              />
              <label htmlFor="field-consent" className="consent-text">
                {t(
                  'queries.form.consent',
                  'I agree to be contacted about this query and understand this is general educational information, not professional financial advice.'
                )}
              </label>
            </div>
            {errors.consent && (
              <div
                className="inline-field-error"
                id="error-consent"
                role="alert"
                style={{ marginTop: '-12px', marginBottom: '16px' }}
              >
                <span aria-hidden="true">⚠</span>
                <span>{errors.consent}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-submit-row">
              <button
                type="submit"
                className="query-submit-btn"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-sm" aria-hidden="true">
                      ⏳
                    </span>
                    <span>{t('queries.form.submitting', 'Submitting query...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('queries.form.submit', 'Submit Query')}</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Common Questions / Collapsible FAQs ── */}
      <section className="queries-faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title" className="faq-section-title">
          {t('queries.faq.title', 'Frequently Asked Questions')}
        </h2>
        <div className="faq-accordion-list">
          <details className="faq-item">
            <summary className="faq-summary">
              <span>{t('queries.faq.q1', 'Is this personalized financial advice?')}</span>
              <span className="faq-chevron" aria-hidden="true">
                ▼
              </span>
            </summary>
            <div className="faq-content">
              <p>
                {t(
                  'queries.faq.a1',
                  'No. InFinance provides educational calculations and conceptual clarity. We are not SEBI-registered advisers. Always consult a Certified Financial Planner or CA for individual financial decisions.'
                )}
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-summary">
              <span>{t('queries.faq.q2', 'How quickly will I receive a response?')}</span>
              <span className="faq-chevron" aria-hidden="true">
                ▼
              </span>
            </summary>
            <div className="faq-content">
              <p>
                {t(
                  'queries.faq.a2',
                  'Queries are typically reviewed within 24–48 hours. If urgent, feel free to call or WhatsApp directly.'
                )}
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-summary">
              <span>{t('queries.faq.q3', 'Is my personal information kept confidential?')}</span>
              <span className="faq-chevron" aria-hidden="true">
                ▼
              </span>
            </summary>
            <div className="faq-content">
              <p>
                {t(
                  'queries.faq.a3',
                  'Yes. Your contact information is never shared, sold, or used for promotional spam. We only use it to reply to your query.'
                )}
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-summary">
              <span>{t('queries.faq.q4', 'Can I use the calculators while waiting?')}</span>
              <span className="faq-chevron" aria-hidden="true">
                ▼
              </span>
            </summary>
            <div className="faq-content">
              <p>
                {t(
                  'queries.faq.a4',
                  'Absolutely! Check out the interactive calculators below to model your financial projections immediately.'
                )}
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* ── Related Calculator Links ── */}
      <section className="queries-calc-links" aria-labelledby="calc-links-title">
        <h2 id="calc-links-title" className="faq-section-title">
          {t('queries.calcLinks.title', 'Interactive Calculators')}
        </h2>
        <div className="calc-links-grid">
          <Link to="/sip" className="calc-link-card">
            <span>{t('queries.calcLinks.sip', 'SIP & Compounding Planner')}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/loan" className="calc-link-card">
            <span>{t('queries.calcLinks.loan', 'Loan & EMI Payoff Calculator')}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/planning" className="calc-link-card">
            <span>{t('queries.calcLinks.tax', 'Tax Regime Comparison')}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/fixed" className="calc-link-card">
            <span>{t('queries.calcLinks.fixed', 'Fixed Income & PPF / EPF')}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── Educational Disclaimer ── */}
      <section className="home-disclaimer-box" aria-label="Educational Disclaimer">
        <strong>{t('home.disclaimer.title', 'Educational Disclaimer')}: </strong>
        <span>
          {t(
            'home.disclaimer.text',
            'InFinance is an educational platform and is not registered with SEBI as an investment adviser or research analyst. All computations, charts, and simulations are mathematical estimates for learning purposes only. Tax laws, interest rates, and regulations change; verify details with official sources (RBI, Income Tax Dept, EPFO). Consult a certified financial planner or Chartered Accountant before taking financial actions.'
          )}
        </span>
      </section>
    </div>
  )
}
