/**
 * useMetalsQuery — React Query wrapper for the metals market endpoint.
 *
 * Replaces manual useState + useEffect + setInterval polling in LiveMetalPrices.
 *
 * Features:
 *  - Auto-refetches every 5 minutes (only when tab is visible — RQ handles this)
 *  - Re-fetches on window focus so returning users see fresh prices
 *  - Returns stale data + marks it as stale via `isStale` flag
 *  - Single AbortController per request managed by React Query's signal
 */
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '../../../shared/api/api'

export const METALS_QUERY_KEY = ['market', 'metals']
export const METALS_REFETCH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

async function fetchMetalPrices({ signal }) {
  const res = await fetch(getApiUrl('/api/v1/market/metals'), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  })
  if (!res.ok) throw new Error(`Metals service returned ${res.status}`)
  return res.json()
}

/**
 * @returns {{
 *   data: object|undefined,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   error: Error|null,
 *   refetch: () => void,
 * }}
 */
export function useMetalsQuery() {
  return useQuery({
    queryKey: METALS_QUERY_KEY,
    queryFn: fetchMetalPrices,
    refetchInterval: METALS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false, // pause when tab is hidden
    staleTime: METALS_REFETCH_INTERVAL_MS,
    // Keep previous data visible while refetching so there's no flash of empty state
    placeholderData: (prev) => prev,
    // Do not retry failed fetches — show stale data + badge immediately on error
    retry: 0,
  })
}
