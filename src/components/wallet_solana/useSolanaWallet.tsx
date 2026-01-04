'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'

export function useSolanaWallet() {
  const [isClient, setIsClient] = useState(false)
  const [dbUser, setDbUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const wallet = useWallet()
  
  if (!isClient) {
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
  
  const primaryWallet = wallet.connected && wallet.publicKey ? {
    address: wallet.publicKey.toString(),
    adapter: wallet.wallet?.adapter
  } : null
  
  if (!wallet.connected && !primaryWallet) {
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
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!primaryWallet?.address) {
        setDbUser(null)
        setLoading(false)
        return
      }
      
      setLoading(true)
      
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
      username: dbUser?.username || 'none set',
      avatar_url: dbUser?.avatar_url || '/avatar.jpg',
      role: dbUser?.role || 'user',
    },
    primaryWallet,
    dbUser,
    isAdmin: dbUser?.role === 'admin' || dbUser?.role === 'super_admin',
    connecting: wallet.connecting || loading,
    disconnect: wallet.disconnect,
    select: wallet.select,
    wallets: wallet.wallets,
    // Additional direct wallet access for components that need it
    wallet: wallet.wallet,
    connectedWallet: wallet.wallet
  }
}