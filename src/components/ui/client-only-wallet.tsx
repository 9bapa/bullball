'use client'

import { useEffect, useState } from 'react'
import { isClient } from '@/lib/hydration-utils'

interface ClientOnlyWalletProps {
  children: React.ReactNode
}

export default function ClientOnlyWallet({ children }: ClientOnlyWalletProps) {
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    if (isClient()) {
      setIsClientReady(true)
    }
  }, [])

  if (!isClientReady) {
    return (
      <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg" />
    )
  }

  return <>{children}</>
}