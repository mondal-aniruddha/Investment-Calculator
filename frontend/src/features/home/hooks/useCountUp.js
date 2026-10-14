import { useState, useEffect, useRef } from 'react'

/**
 * Smooth Count-Up hook (respects prefers-reduced-motion)
 */
export function useCountUp(targetVal, duration = 650) {
  const [currentVal, setCurrentVal] = useState(targetVal)
  const prevValRef = useRef(targetVal)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setCurrentVal(targetVal)
      prevValRef.current = targetVal
      return
    }

    const start = prevValRef.current
    const diff = targetVal - start
    if (diff === 0) return

    let startTime = null
    let frameId = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCurrentVal(Math.round(start + diff * easeOut))

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      } else {
        prevValRef.current = targetVal
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [targetVal, duration])

  return currentVal
}
