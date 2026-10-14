import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — attaches an IntersectionObserver to a ref'd element.
 * Adds the 'revealed' class when the element enters the viewport.
 * The actual fade/slide is handled in animations.css (.reveal, .reveal-stagger).
 * 
 * Respects prefers-reduced-motion: skips the observer and marks all revealed immediately.
 *
 * @param {IntersectionObserverInit} options — threshold, rootMargin, etc.
 * @returns {React.RefObject} — attach to the element you want to reveal
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion preference — show everything immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.classList.add('revealed')
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

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
