// Hydration-safe utility functions

export const isClient = () => typeof window !== 'undefined'

export const safeGetWindow = <T extends keyof Window>(key: T): Window[T] | null => {
  if (typeof window === 'undefined') return null
  return window[key]
}

export const safeGetLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const safeSetLocalStorage = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const safeGetDate = () => {
  if (typeof window === 'undefined') {
    return new Date('2024-01-01') // Consistent server date
  }
  return new Date()
}

export const safeRandom = () => {
  if (typeof window === 'undefined') {
    return 0.5 // Consistent server value
  }
  return Math.random()
}

export const safeScrollY = (): number => {
  if (typeof window === 'undefined') return 0
  return window.scrollY
}

export const safeAddEventListener = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): (() => void) | null => {
  if (typeof window === 'undefined') return null
  
  const wrappedListener = (e: WindowEventMap[K]) => {
    try {
      listener.call(window, e)
    } catch (error) {
      console.error('Event listener error:', error)
    }
  }
  
  window.addEventListener(type, wrappedListener, options)
  return () => window.removeEventListener(type, wrappedListener, options)
}