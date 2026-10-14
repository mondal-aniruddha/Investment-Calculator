import { useEffect, useRef } from 'react'

/**
 * useReveal — Reusable IntersectionObserver hook for scroll-triggered reveals.
 * Progressive enhancement:
 * - Elements are visible by default in HTML/CSS.
 * - Only after client-side mount, if IntersectionObserver is supported and
 *   prefers-reduced-motion is false, do we attach the observer and trigger the reveal.
 * - Once an element enters viewport (threshold ~0.15), it gets the 'revealed' class
 *   and is immediately unobserved.
 *
 * @param {Object} options IntersectionObserver options
 * @returns {React.RefObject} Ref to attach to the animated container or element
 */
export function useReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If reduced motion is requested or IntersectionObserver is unsupported, reveal immediately
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('revealed')
      return
    }

    // Mark as ready for reveal animation (enables the subtle initial translation & opacity)
    el.classList.add('reveal-ready')

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
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px 0px -30px 0px',
        ...options,
      }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [options.threshold, options.rootMargin])

  return ref
}
