'use client'

import React from 'react'
import { 
  DynamicContextProvider, 
  DynamicWidget 
} from "@dynamic-labs/sdk-react-core"
import { SolanaWalletConnectors } from "@dynamic-labs/solana"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { supabase, supabaseService } from "@/lib/supabase"



interface DynamicWalletProviderProps {
  children: React.ReactNode
}

export function DynamicWalletProvider({ children }: DynamicWalletProviderProps) {
  return (
    <DynamicContextProvider 
      settings={{ 
        // You'll need to get your environmentId from https://app.dynamic.xyz/dashboard/developer
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID as string,
        walletConnectors: [SolanaWalletConnectors], 
      }} 
    >
      {children}
    </DynamicContextProvider>
  )
}

export function DynamicWalletButton() {
  const { user, primaryWallet, handleLogOut } = useDynamicContext()

  return (
    <div className="flex items-center gap-2">
      <DynamicWidget />
      {user && (
        <button
          onClick={handleLogOut}
          className="ml-2 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  )
}

export function useDynamicWallet() {
  const { user, primaryWallet } = useDynamicContext()
  const [dbUser, setDbUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!primaryWallet?.address) {
        setDbUser(null)
        setLoading(false)
        return
      }

      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not initialized - user data not available')
        setDbUser(null)
        setLoading(false)
        return
      }

      try {
        // Get user data from database

            const response = await fetch('/api/user/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                wallet_address: primaryWallet.address.toLowerCase(),
              }),
            })

            const result = await response.json()
            if (!response.ok) {
              throw new Error(result.error || 'Failed to create user')
            }
        setDbUser(result.user)
      } catch (error) {
        console.error('Supabase error:', error)
        setDbUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [primaryWallet?.address, supabase])

  // Check if user has admin role from database
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'super_admin'
  
  return {
    connected: !!primaryWallet,
    publicKey: primaryWallet?.address || null,
    user: {
      ...user,
      username: dbUser?.username || 'none set',
      avatar_url: dbUser?.avatar_url || '/avatar.jpg',
      role: dbUser?.role || 'user',
    },
    isAdmin,
    connecting: loading
  }
}