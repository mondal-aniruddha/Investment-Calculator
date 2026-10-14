/**
 * useCalculator — Public API shim (Phase 5).
 *
 * Now delegates to useCalculatorMutation (React Query useMutation) internally.
 * The return shape is identical to the pre-Phase-5 version so every feature
 * hook (useSipForm, useLoanForm, …) and every page component continue to work
 * without modification.
 *
 * @param {(online: boolean) => void} [setApiOnline]
 */
import { useCalculatorMutation } from './useCalculatorMutation'

export function useCalculator(setApiOnline) {
  return useCalculatorMutation(setApiOnline)
}

export default useCalculator
