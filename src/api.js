// InFinance API client with sessionStorage and 401 interception

export async function request(path, options = {}) {
  // Backward compatibility: migrate token from localStorage to sessionStorage if found
  let token = sessionStorage.getItem('infinance-token')
  if (!token && typeof localStorage !== 'undefined') {
    const legacyToken = localStorage.getItem('infinance-token')
    if (legacyToken) {
      sessionStorage.setItem('infinance-token', legacyToken)
      localStorage.removeItem('infinance-token')
      token = legacyToken
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(path, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    sessionStorage.removeItem('infinance-token')
    sessionStorage.removeItem('infinance-user')
    window.dispatchEvent(new CustomEvent('infinance-session-expired'))
  }

  const text = await response.text()
  let payload = {}
  if (text.trim()) {
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error(`The backend returned an invalid response (${response.status}).`)
    }
  }

  if (!response.ok) {
    const msg = payload.message || payload.error || `The backend returned ${response.status}.`
    const err = new Error(msg)
    err.status = response.status
    err.code = payload.code
    err.fieldErrors = payload.fieldErrors || []
    throw err
  }

  return payload
}
