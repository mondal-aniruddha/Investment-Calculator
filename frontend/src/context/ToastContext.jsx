// ToastContext — moved from src/context/ToastContext.jsx.
// Logic is identical; only the file location changed.
import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    const newToast = { id, message, type }
    setToasts((prev) => [...prev, newToast])
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const toast = useMemo(
    () => ({
      show:    addToast,
      success: (msg, dur) => addToast(msg, 'success', dur),
      error:   (msg, dur) => addToast(msg, 'error',   dur),
      info:    (msg, dur) => addToast(msg, 'info',    dur),
      warning: (msg, dur) => addToast(msg, 'warning', dur),
    }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-icon">
              {t.type === 'success' && '✓'}
              {t.type === 'error'   && '✕'}
              {t.type === 'warning' && '⚠'}
              {t.type === 'info'    && 'ℹ'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context.toast
}
