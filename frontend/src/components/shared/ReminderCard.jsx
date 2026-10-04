/**
 * ReminderCard — ICS calendar export for SIP/tax-planning review reminders.
 * Identical logic to original, extracted as a standalone component.
 */
export function ReminderCard() {
  const [date, setDate] = useState('')

  const download = () => {
    if (!date) return
    const stamp = date.replaceAll('-', '') + 'T090000'
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${stamp}`,
      'SUMMARY:Review SIP and tax-saving plan',
      'DESCRIPTION:Educational reminder from InFinance. Verify current official rules and rates before acting.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
    link.download = 'infinance-reminder.ics'
    link.click()
  }

  return (
    <div className="card reminder-card">
      <div className="section-label">REMINDERS</div>
      <h2>Review your plan</h2>
      <p style={{ color: 'var(--ink-muted)', fontSize: '14px', margin: '4px 0 16px' }}>
        Export a calendar reminder for a SIP or tax-planning review.
      </p>
      <div className="field-row">
        <label htmlFor="reminder-date">
          Reminder date
          <input
            id="reminder-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px', marginTop: '6px', background: 'transparent', width: '100%' }}
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={download}
          disabled={!date}
          style={{ marginTop: '28px' }}
          aria-label="Export calendar reminder"
        >
          <span>Export .ics</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

// Missing import at top
import { useState } from 'react'
