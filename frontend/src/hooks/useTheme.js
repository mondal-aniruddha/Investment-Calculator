import { useState, useEffect } from 'react'

/**
 * useTheme — manages light/dark mode.
 * Persists preference to localStorage under the key 'infinance-theme'.
 * Syncs the :root.dark class on <html>.
 */
export function useTheme() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('infinance-theme') === 'dark'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('infinance-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}
