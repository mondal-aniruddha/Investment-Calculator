import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — attaches an IntersectionObserver to a ref'd element
 * and all its `.reveal` / `.reveal-stagger` descendants.
 * Adds the 'revealed' class when each element enters the viewport.
 * Scoped by '.reveal-enabled' in animations.css for safe degradation.
 *
 * Respects prefers-reduced-motion: skips the observer and marks all revealed immediately.
 *
 * @param {IntersectionObserverInit} options — threshold, rootMargin, etc.
 * @returns {React.RefObject} — attach to the element or container you want to reveal
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('reveal-enabled')
    }

    const el = ref.current
    if (!el) return

    // Find all targets to observe: the element itself (if matching) and all matching descendants
    const targets = []
    if (el.matches?.('.reveal, .reveal-stagger')) {
      targets.push(el)
    }
    if (el.querySelectorAll) {
      el.querySelectorAll('.reveal, .reveal-stagger').forEach((child) => {
        targets.push(child)
      })
    }
    if (targets.length === 0) {
      targets.push(el)
    }

    // Fallback if IntersectionObserver is unsupported or user prefers reduced motion
    const hasObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (!hasObserver || prefersReduced) {
      targets.forEach((target) => target.classList.add('revealed'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    )

    targets.forEach((target) => observer.observe(target))

    return () => {
      observer.disconnect()
    }
  }, [])

  return ref
}

