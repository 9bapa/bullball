'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserInfo {
  principal?: string
  internetIdentity?: string
}

interface AuthStore {
  isConnected: boolean
  userInfo: UserInfo
  connect: () => void
  disconnect: () => void
  setUserInfo: (info: UserInfo) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isConnected: false,
      userInfo: {},
      connect: () => set({ isConnected: true }),
      disconnect: () => set({ isConnected: false, userInfo: {} }),
      setUserInfo: (info) => set({ userInfo: info, isConnected: true }),
    }),
    {
      name: 'bullrhun-auth-storage',
    }
  )
)
