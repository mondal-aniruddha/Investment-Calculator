/**
 * Global App Providers — Phase 5 update.
 *
 * Added QueryClientProvider (React Query) for server-state management.
 * Wrap order (outermost → innermost):
 *   HelmetProvider → QueryClientProvider → BrowserRouter → ToastProvider → AuthProvider
 *
 * React Query (server state) sits outside the router so query caches survive
 * navigation. Auth and Toast contexts sit inside the router so they can use
 * navigation hooks if needed in the future.
 */
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../shared/lib/queryClient'
import { ToastProvider } from '../context/ToastContext'
import { AuthProvider } from '../context/AuthContext'

export function AppProviders({ children }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
