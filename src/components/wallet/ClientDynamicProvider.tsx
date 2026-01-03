'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues
const DynamicWalletProvider = dynamic(
  () => import('./DynamicWalletProvider').then(mod => ({ default: mod.DynamicWalletProvider })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
  }
)

export default DynamicWalletProvider