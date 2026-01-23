'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface User {
  id?: string
  username: string
  display_name: string
  email?: string
  phone?: string
  bio?: string
  avatar_url: string
  role: 'customer' | 'admin' | 'super_admin'
  points?: number
  redemptions?: number
  created_at?: string
  updated_at?: string
}

interface UserContextType {
  connected: boolean
  publicKey: string | null
  user: User | null
  dbUser: User | null
  isAdmin: boolean
  connecting: boolean
}

export const UserContext = createContext<UserContextType | null>(null)

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}

export function getShortAddress(address: string | null): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const fetchUserData = async () => {
      if (!publicKey) {
        setDbUser(null)
        setLoading(false)
        return
      }
      
      try {
        // Get user data from database using Solana wallet address
        const response = await fetch('/api/user/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: publicKey.toString(),
          }),
        })
        
        if (response.ok) {
          const userData = await response.json()
          console.log('Fetched user data:', userData)
          console.log('User role from API:', userData.user?.role)
          setDbUser(userData.user)
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
  }, [publicKey])
  
  const user: User | null = dbUser ? {
    username: dbUser.username || 'none set',
    display_name: dbUser.display_name || dbUser.username,
    avatar_url: dbUser.avatar_url || '/avatar.jpg',
    role: dbUser.role,
    points: dbUser.points || 0,
    redemptions: dbUser.redemptions || 0,
  } : null
  
  const contextValue: UserContextType = {
    connected,
    publicKey: publicKey?.toString() || null,
    user,
    dbUser,
    isAdmin: dbUser?.role === 'admin' || dbUser?.role === 'super_admin',
    connecting: loading
  }
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}