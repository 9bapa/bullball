'use client'

import React from 'react'

interface HydrationErrorBoundaryState {
  hasHydrationError: boolean
}

interface HydrationErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class HydrationErrorBoundary extends React.Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props)
    this.state = { hasHydrationError: false }
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Check if it's a hydration error
    if (error.message.includes('Hydration') || 
        error.message.includes('Text content does not match') ||
        error.message.includes('Server-rendered HTML')) {
      return { hasHydrationError: true }
    }
    return { hasHydrationError: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Hydration error caught:', error)
    console.error('Error info:', errorInfo)
  }

  render() {
    if (this.state.hasHydrationError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading Client Content</h2>
            <p className="text-gray-400">Please wait while we initialize...</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default HydrationErrorBoundary