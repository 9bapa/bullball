'use client'

import dynamic from 'next/dynamic'

// Dynamic imports for client-side only components
export const ChartComponent = dynamic(() => import('./chart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 h-64 rounded-lg"></div>
})

export const WalletConnectComponent = dynamic(() => import('./wallet-connect'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 h-12 rounded-lg"></div>
})

export const TradingChart = dynamic(() => import('./trading-chart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 h-96 rounded-lg"></div>
})