'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SwapState {
  totalTrades: number
  minimumTradeAmount: number
  platformBalance: {
    bullrun: number
    btc: number
    eth: number
    bnb: number
    sui: number
  }
  swapHistory: Array<{
    id: string
    from: string
    to: string
    amount: number
    timestamp: number
  }>
  incrementTrades: () => void
  updateBalance: (token: string, amount: number) => void
  addSwapHistory: (swap: Omit<SwapState['swapHistory'][0], 'id' | 'timestamp'>) => void
}

const INITIAL_BALANCES = {
  bullrun: 1000000,
  btc: 50,
  eth: 500,
  bnb: 2000,
  sui: 100000
}

export const useSwapStore = create<SwapState>()(
  persist(
    (set) => ({
      totalTrades: 0,
      minimumTradeAmount: 100,
      platformBalance: INITIAL_BALANCES,
      swapHistory: [],
      incrementTrades: () => set((state) => ({ totalTrades: state.totalTrades + 1 })),
      updateBalance: (token, amount) =>
        set((state) => ({
          platformBalance: {
            ...state.platformBalance,
            [token]: state.platformBalance[token as keyof typeof state.platformBalance] + amount
          }
        })),
      addSwapHistory: (swap) =>
        set((state) => ({
          swapHistory: [
            ...state.swapHistory,
            {
              ...swap,
              id: `swap-${Date.now()}-${Math.random()}`,
              timestamp: Date.now()
            }
          ]
        }))
    }),
    {
      name: 'bullrhun-swap-storage',
      partialize: (state) => ({
        totalTrades: state.totalTrades,
        platformBalance: state.platformBalance
      })
    }
  )
)
