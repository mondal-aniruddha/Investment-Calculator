/**
 * queryClient — Singleton QueryClient for @tanstack/react-query.
 *
 * Defaults chosen for a financial data app:
 *  - staleTime: 60s  → Calculator results stay "fresh" for 60s before background refetch
 *  - gcTime:    5min → Detached query cache lives for 5 minutes (previously called cacheTime)
 *  - retry:     1    → One silent retry on network errors before surfacing the error
 *  - refetchOnWindowFocus: true → Revalidate when user returns to the tab
 */
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})
