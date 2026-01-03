'use client'

import HydrationErrorBoundary from '@/components/ui/hydration-error-boundary'
import { ReactNode } from 'react'

interface HydrationWrapperProps {
  children: ReactNode
}

export default function HydrationWrapper({ children }: HydrationWrapperProps) {
  return (
    <HydrationErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">BullRhun</h2>
            <p className="text-gray-400">Initializing application...</p>
          </div>
        </div>
      }
    >
      {children}
    </HydrationErrorBoundary>
  )
}