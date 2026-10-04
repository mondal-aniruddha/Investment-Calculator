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
 *
 * Usage:
 *   const ref = useScrollReveal()
 *   <section ref={ref} className="reveal">...</section>
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
            observer.unobserve(entry.target) // Once revealed, stop observing
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

/**
 * useScrollRevealAll — apply reveal to all children matching a selector.
 * Useful for animating a list of cards one-by-one.
 *
 * @param {string} selector — CSS selector for children (default: '.reveal-child')
 */
export function useScrollRevealAll(selector = '.reveal-child') {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const children = container.querySelectorAll(selector)
    if (prefersReduced) {
      children.forEach((el) => el.classList.add('revealed'))
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
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )

    children.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector])

  return containerRef
}
