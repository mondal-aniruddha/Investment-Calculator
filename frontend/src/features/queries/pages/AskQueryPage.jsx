/**
 * AskQueryPage.jsx — "Ask a Finance Query" interactive page.
 * Allows visitors to write and submit personal finance queries.
 * Displays site team identity (Aniruddha Mondal + Kuhika Das) and direct contact details.
 */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import {
  DEFAULT_OWNER_CONFIG,
  DEFAULT_TEAM,
  formatWhatsAppHref,
  formatMailtoHref,
} from '../../../shared/config/owner'
import { submitFinanceQuery, fetchOwnerContact, fetchTeam } from '../services/queryService'
import '../../../styles/queries.css'

// ── Icons ─────────────────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function MailIcon() {
  return (
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
  )
}

// ── Reusable founder card ──────────────────────────────────────────────────────

function FounderCard({ member, waMessage, successSubject, successRefId, isSuccessCard }) {
  const { t } = useTranslation()

  const waText = isSuccessCard
    ? successSubject && successSubject.trim()
      ? `Hi ${member.name.split(' ')[0]}, I have a finance query regarding "${successSubject.trim()}" (Ref: ${successRefId}) from InFinance.`
      : `Hi ${member.name.split(' ')[0]}, I have a finance query (Ref: ${successRefId}) from InFinance.`
    : waMessage || `Hi ${member.name.split(' ')[0]}, I have a finance query from InFinance.`

  const roleText = t(`queries.founders.roles.${member.id}`, member.role)

  return (
    <article className="founder-card" aria-label={`${member.name} — ${roleText}`}>
      <div className="founder-card-header">
        <div className="owner-avatar-bubble" aria-hidden="true">
          {member.initials || member.name.charAt(0)}
        </div>
        <div>
          <h3 className="founder-name">{member.name}</h3>
          <div className="owner-role-tag">{roleText}</div>
        </div>
      </div>

      {member.shortBio && <p className="founder-bio">{member.shortBio}</p>}

      <div className="founder-contacts">
        <a
          href={formatWhatsAppHref(member.whatsapp, waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="owner-whatsapp-btn"
          aria-label={t('queries.founders.whatsappAriaLabel', {
            name: member.name,
            defaultValue: `Chat with ${member.name} on WhatsApp (opens in a new tab)`,
          })}
        >
          <WhatsAppIcon />
          <span>{t('queries.founders.chatOn', 'Chat on WhatsApp')}</span>
        </a>

        <a
          href={formatMailtoHref(member.email, 'InFinance Consultation Query')}
          className="owner-contact-pill"
          aria-label={`Email ${member.name} at ${member.email}`}
        >
          <MailIcon />
          <span>{member.email}</span>
        </a>
      </div>
    </article>
  )
}

// ── Category keys ─────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AskQueryPage() {
  const { t } = useTranslation()
  const foundersRef = useRef(null)

  // Owner contact details state (fetched from backend with fallback)
  const [owner, setOwner] = useState(DEFAULT_OWNER_CONFIG)
  // Full team list
  const [team, setTeam] = useState(DEFAULT_TEAM)

  // Form field state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    category: '',
    subject: '',
    message: '',
    preferredContact: 'EMAIL',
    assignedTo: 'ANYONE',
    consent: false,
    honeypot: '',
  })

  // Validation & UI status state
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successData, setSuccessData] = useState(null)
  const [copiedRef, setCopiedRef] = useState(false)

  // Fetch owner + team on mount
  useEffect(() => {
    let mounted = true
    fetchOwnerContact().then((details) => {
      if (mounted && details) setOwner(details)
    })
    fetchTeam().then((members) => {
      if (mounted && Array.isArray(members) && members.length > 0) setTeam(members)
    })
    return () => {
      mounted = false
    }
  }, [])

  // Scroll to co-founder card
  const scrollToFounders = (e) => {
    e.preventDefault()
    foundersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

    const trimmedWhatsApp = formData.whatsapp.trim()
    if (trimmedWhatsApp) {
      const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/
      if (!phoneRegex.test(trimmedWhatsApp)) {
        errs.whatsapp = t(
          'queries.errors.whatsappInvalid',
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
    const submittedSubject = formData.subject.trim()
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        category: formData.category,
        subject: submittedSubject,
        message: formData.message.trim(),
        preferredContact: formData.preferredContact,
        assignedTo: formData.assignedTo,
        consent: formData.consent,
        honeypot: formData.honeypot || null,
      }

      const response = await submitFinanceQuery(payload)
      setSuccessData({
        ...response,
        subject: submittedSubject,
      })
      setErrors({})
      // Reset form
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        category: '',
        subject: '',
        message: '',
        preferredContact: 'EMAIL',
        assignedTo: 'ANYONE',
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

  // Co-founder (second team member) for the shortcut link
  const coFounder = team.length > 1 ? team[1] : null

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

      {/* ── Owner Identity Section (Top) — quick-contact for founder ── */}
      <section className="owner-card-top" aria-label="Site founder quick contact">
        <div className="owner-card-grid">
          <div className="owner-profile-meta">
            <div className="owner-avatar-bubble" aria-hidden="true">
              {owner.name ? owner.name.charAt(0) : 'A'}
            </div>
            <div>
              <h2 className="owner-name-title">{owner.name}</h2>
              <div className="owner-role-tag">
                {t('queries.ownerCard.nameLabel', 'Founder & Lead Developer')}
              </div>
            </div>
          </div>

          <div className="owner-direct-callout">
            <span aria-hidden="true">💬</span>
            <span>
              {t(
                'queries.ownerCard.callPrompt',
                'Prefer a quick chat? Message me on WhatsApp or email me directly.'
              )}
            </span>
          </div>

          <div className="owner-contacts-list">
            <a
              href={formatWhatsAppHref(
                owner.whatsapp,
                'Hi Aniruddha, I have a finance query from InFinance.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="owner-whatsapp-btn"
              aria-label="Chat with Aniruddha Mondal on WhatsApp (opens in a new tab)"
            >
              <WhatsAppIcon />
              <span>{t('queries.ownerCard.chatOn', 'Chat on WhatsApp')}</span>
            </a>

            <a
              href={formatMailtoHref(owner.email, 'InFinance Consultation Query')}
              className="owner-contact-pill"
              aria-label={`Email ${owner.email}`}
            >
              <MailIcon />
              <span>{owner.email}</span>
            </a>
          </div>

          {/* Shortcut to co-founder */}
          {coFounder && (
            <p className="owner-cofounder-shortcut">
              {t('queries.ownerCard.orCoFounder', 'Or reach our co-founder')}{' '}
              <a
                href="#meet-founders"
                onClick={scrollToFounders}
                className="owner-cofounder-link"
                aria-label={`Scroll to ${coFounder.name}'s contact card`}
              >
                {coFounder.name} ↓
              </a>
            </p>
          )}
        </div>
      </section>

      {/* ── Meet the Founders ── */}
      <section
        id="meet-founders"
        ref={foundersRef}
        className="founders-section"
        aria-labelledby="founders-title"
      >
        <h2 id="founders-title" className="founders-title">
          {t('queries.founders.sectionTitle', 'Meet the Founders')}
        </h2>
        <p className="founders-disclaimer-note">
          {t(
            'queries.founders.disclaimerNote',
            'We share general educational information and are not SEBI-registered investment advisers.'
          )}
        </p>

        <div className="founders-grid">
          {team.map((member) => (
            <FounderCard key={member.id} member={member} />
          ))}
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
            {/* Both founders' contact buttons in success state */}
            <div className="success-team-contacts">
              {team.map((member) => (
                <FounderCard
                  key={member.id}
                  member={member}
                  isSuccessCard
                  successSubject={successData.subject}
                  successRefId={successData.referenceId}
                />
              ))}
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

            {/* Row 2: WhatsApp & Category */}
            <div className="form-grid-row">
              <div className="form-group-item">
                <label htmlFor="field-whatsapp">
                  <span>{t('queries.form.whatsapp', 'WhatsApp Number (Optional)')}</span>
                </label>
                <input
                  type="tel"
                  id="field-whatsapp"
                  name="whatsapp"
                  placeholder={t('queries.form.whatsappPlaceholder', 'e.g. +91 98765 43210')}
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className={errors.whatsapp ? 'has-error' : ''}
                  aria-invalid={errors.whatsapp ? 'true' : 'false'}
                  aria-describedby={errors.whatsapp ? 'error-whatsapp' : undefined}
                  maxLength={32}
                />
                {errors.whatsapp && (
                  <div className="inline-field-error" id="error-whatsapp" role="alert">
                    <span aria-hidden="true">⚠</span>
                    <span>{errors.whatsapp}</span>
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
                {['EMAIL', 'WHATSAPP', 'EITHER'].map((method) => (
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
                        : method === 'WHATSAPP'
                          ? t('queries.form.contactWhatsApp', 'WhatsApp')
                          : t('queries.form.contactEither', 'Either')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Row 6: Who should answer? */}
            <div className="form-group-item">
              <label htmlFor="field-assignedTo">
                <span>{t('queries.form.assignedTo', 'Who should answer?')}</span>
              </label>
              <select
                id="field-assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="ANYONE">{t('queries.form.assignedAnyone', 'Anyone')}</option>
                <option value="ANIRUDDHA">Aniruddha Mondal</option>
                {coFounder && <option value="KUHIKA">{coFounder.name}</option>}
              </select>
            </div>

            {/* Row 7: Consent Checkbox */}
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
