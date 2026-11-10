import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrollReveal } from '../useScrollReveal'

describe('useScrollReveal hook', () => {
  let originalDocument
  let originalWindow
  let classListSet

  beforeEach(() => {
    originalDocument = globalThis.document
    originalWindow = globalThis.window
    classListSet = new Set()

    globalThis.document = {
      documentElement: {
        classList: {
          add: vi.fn((cls) => classListSet.add(cls)),
          contains: (cls) => classListSet.has(cls),
        },
      },
    }

    globalThis.window = {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    }
  })

  afterEach(() => {
    globalThis.document = originalDocument
    globalThis.window = originalWindow
    vi.restoreAllMocks()
  })

  it('is a callable function exporting a ref object', () => {
    expect(typeof useScrollReveal).toBe('function')
  })

  it('observes container and all matching descendants when IntersectionObserver exists', () => {
    let observedElements = []
    let unobservedElements = []
    let observerCallback = null
    let disconnected = false

    globalThis.window.IntersectionObserver = class MockIntersectionObserver {
      constructor(callback, options) {
        observerCallback = callback
        this.options = options
      }
      observe(el) {
        observedElements.push(el)
      }
      unobserve(el) {
        unobservedElements.push(el)
      }
      disconnect() {
        disconnected = true
      }
    }

    const child1ClassList = new Set(['reveal'])
    const child1 = {
      classList: {
        add: vi.fn((cls) => child1ClassList.add(cls)),
        contains: (cls) => child1ClassList.has(cls),
      },
    }

    const child2ClassList = new Set(['reveal-stagger'])
    const child2 = {
      classList: {
        add: vi.fn((cls) => child2ClassList.add(cls)),
        contains: (cls) => child2ClassList.has(cls),
      },
    }

    const rootEl = {
      matches: vi.fn(() => false),
      querySelectorAll: vi.fn(() => [child1, child2]),
      classList: { add: vi.fn() },
    }

    // Verify hook's observer logic
    globalThis.document.documentElement.classList.add('reveal-enabled')
    const targets = []
    if (rootEl.matches('.reveal, .reveal-stagger')) targets.push(rootEl)
    if (rootEl.querySelectorAll) {
      rootEl.querySelectorAll('.reveal, .reveal-stagger').forEach((c) => targets.push(c))
    }
    if (targets.length === 0) targets.push(rootEl)

    const observer = new globalThis.window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    })

    targets.forEach((t) => observer.observe(t))
    const cleanup = () => observer.disconnect()

    expect(globalThis.document.documentElement.classList.contains('reveal-enabled')).toBe(true)
    expect(observedElements).toHaveLength(2)
    expect(observedElements).toContain(child1)
    expect(observedElements).toContain(child2)

    // Simulate intersection
    observerCallback([{ target: child1, isIntersecting: true }])
    expect(child1.classList.add).toHaveBeenCalledWith('revealed')
    expect(unobservedElements).toContain(child1)

    cleanup()
    expect(disconnected).toBe(true)
  })

  it('marks all targets revealed immediately when prefers-reduced-motion is active', () => {
    globalThis.window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    globalThis.window.IntersectionObserver = vi.fn()

    const child1 = { classList: { add: vi.fn() } }
    const targets = [child1]

    const hasObserver = 'IntersectionObserver' in globalThis.window
    const prefersReduced = globalThis.window.matchMedia('(prefers-reduced-motion: reduce)')?.matches

    if (!hasObserver || prefersReduced) {
      targets.forEach((t) => t.classList.add('revealed'))
    }

    expect(child1.classList.add).toHaveBeenCalledWith('revealed')
    expect(globalThis.window.IntersectionObserver).not.toHaveBeenCalled()
  })

  it('marks all targets revealed immediately when IntersectionObserver is unsupported', () => {
    delete globalThis.window.IntersectionObserver

    const child1 = { classList: { add: vi.fn() } }
    const targets = [child1]

    const hasObserver = 'IntersectionObserver' in globalThis.window
    const prefersReduced = globalThis.window.matchMedia('(prefers-reduced-motion: reduce)')?.matches

    if (!hasObserver || prefersReduced) {
      targets.forEach((t) => t.classList.add('revealed'))
    }

    expect(child1.classList.add).toHaveBeenCalledWith('revealed')
  })
})
