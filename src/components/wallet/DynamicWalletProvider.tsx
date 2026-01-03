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
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    // Wait for client to be ready and give time for all services to initialize
    const initTimer = setTimeout(() => {
      setIsReady(true)
    }, 1000) // 1 second delay to ensure all services are loaded

    return () => clearTimeout(initTimer)
  }, [])

  // Always provide the context, but only enable features when ready
  return (
    <DynamicContextProvider 
      settings={{ 
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "f76c2b30-394e-4600-9934-a99fbd4b0760",
        walletConnectors: [SolanaWalletConnectors], 
      }}
    >
      {isReady ? (
        children
      ) : (
        <div className="min-h-screen">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
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
  const [dbUser, setDbUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  
  try {
    const { user, primaryWallet } = useDynamicContext()
    
    // Handle null client gracefully
    if (!user && !primaryWallet) {
      return {
        connected: false,
        publicKey: null,
        user: null,
        primaryWallet: null,
        dbUser,
        loading: false,
        isAdmin: false
      }
    }
    
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
          
          if (response.ok) {
            const userData = await response.json()
            setDbUser(userData)
          } else {
            console.error('Failed to fetch user data:', response.statusText)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchUserData()
    }, [primaryWallet])
    
    return {
      connected: !!primaryWallet,
      publicKey: primaryWallet?.address || null,
      user: {
        ...user,
        username: dbUser?.username || 'none set',
        avatar_url: dbUser?.avatar_url || '/avatar.jpg',
        role: dbUser?.role || 'user',
      },
      dbUser,
      isAdmin: dbUser?.role === 'admin' || dbUser?.role === 'super_admin',
      connecting: loading
    }
  } catch (error) {
    console.warn('Dynamic SDK not available, using fallback state:', error)
    return {
      connected: false,
      publicKey: null,
      user: null,
      primaryWallet: null,
      dbUser,
      loading: false,
      isAdmin: false
    }
  }
}