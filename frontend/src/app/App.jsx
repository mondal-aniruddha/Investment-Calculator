import { useState, useEffect } from 'react'
import { AppProviders } from './providers'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'
import { AppRoutes } from './router'
import { getApiUrl } from '../shared/api/api'

export function App() {
  const [apiOnline, setApiOnline] = useState(false)

  // Poll backend health on mount
  useEffect(() => {
    fetch(getApiUrl('/actuator/health'))
      .then((r) => setApiOnline(r.ok))
      .catch(() => setApiOnline(false))
  }, [])

  return (
    <ErrorBoundary level="root">
      <AppProviders>
        <AppShell apiOnline={apiOnline}>
          <ErrorBoundary level="route">
            <AppRoutes setApiOnline={setApiOnline} />
          </ErrorBoundary>
        </AppShell>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
