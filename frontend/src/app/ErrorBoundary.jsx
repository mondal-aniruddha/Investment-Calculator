import { Component } from 'react'
import { Link } from 'react-router-dom'

/**
 * ErrorBoundary — Catches JavaScript errors anywhere in their child component tree,
 * logs the error, and displays a resilient fallback UI.
 *
 * Supports:
 * - Root boundary (app-level full screen fallback)
 * - Route-level boundary (inline card fallback preserving navigation)
 * - Manual reset via "Try again" button
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback
      }

      const isRoot = this.props.level === 'root'
      const errorMsg = this.state.error?.message || 'An unexpected application error occurred.'
      const correlationId = this.state.error?.correlationId

      return (
        <div
          className={`error-boundary-container ${isRoot ? 'error-boundary-root' : 'error-boundary-route'}`}
          role="alert"
          style={{
            padding: isRoot ? '48px 24px' : '32px 20px',
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            className="card"
            style={{
              padding: '32px 24px',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderRadius: '16px',
              background: 'var(--bg-surface, #ffffff)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }} aria-hidden="true">
              ⚠️
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p
              style={{
                color: 'var(--ink-muted, #64748b)',
                fontSize: '14px',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              We encountered an issue rendering this section. You can try refreshing or returning to
              the home page.
            </p>

            {correlationId && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--ink-muted, #64748b)',
                  marginBottom: '16px',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                Tracking ID: {correlationId}
              </div>
            )}

            <div
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <button
                type="button"
                className="btn-primary"
                onClick={this.handleReset}
                style={{ padding: '8px 20px', cursor: 'pointer' }}
              >
                Try again
              </button>
              <Link
                to="/"
                className="btn-secondary"
                style={{
                  padding: '8px 20px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Return to home
              </Link>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left', fontSize: '12px' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--error, #ef4444)' }}>
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    overflowX: 'auto',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-subtle, #f8fafc)',
                    marginTop: '8px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {errorMsg}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
