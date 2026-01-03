'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook for client-side only operations
export function useClientSide<T>(value: T, fallback?: T): T {
  const [isClient, setIsClient] = useState(false)
  const [stateValue, setStateValue] = useState(value)

  useEffect(() => {
    setIsClient(true)
    setStateValue(value)
  }, [value])

  return isClient ? stateValue : (fallback || value)
}

// Hook for window object
export function useWindow() {
  const [windowObj, setWindowObj] = useState<typeof window | null>(null)

  useEffect(() => {
    setWindowObj(window)
  }, [])

  return windowObj
}