'use client'

import { useState, useEffect } from 'react'

export interface WalletInfo {
  publicKey: string | null
  isConnected: boolean
  walletName: string | null
  balance: number
  solBalance: number
}

export function useSolanaWallet() {
  const [wallet, setWallet] = useState<WalletInfo>({
    publicKey: null,
    isConnected: false,
    walletName: null,
    balance: 0,
    solBalance: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if wallet is already connected on mount
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      // Check for Phantom wallet
      const { solana } = window as any

      if (solana?.isPhantom) {
        try {
          // Try silent connection first (if already authorized)
          const response = await solana.connect({ onlyIfTrusted: true })
          if (response.publicKey) {
            setWallet({
              publicKey: response.publicKey.toString(),
              isConnected: true,
              walletName: 'Phantom',
              balance: 0, // No mock data
              solBalance: 0 // No mock data
            })
            setError(null)
            console.log('Wallet already connected:', response.publicKey.toString())
          } else {
            // If silent connection fails, try regular connection
            const regularResponse = await solana.connect()
            if (regularResponse.publicKey) {
              setWallet({
                publicKey: regularResponse.publicKey.toString(),
                isConnected: true,
                walletName: 'Phantom',
                balance: 0, // No mock data
                solBalance: 0 // No mock data
              })
              setError(null)
              console.log('Wallet connected:', regularResponse.publicKey.toString())
            }
          }
        } catch (connectionError: any) {
          // User rejected or not authorized - this is expected behavior, not an error
          if (connectionError.code === 4001 || connectionError.message?.includes('User rejected') || connectionError.message?.includes('not authorized')) {
            // Silently handle user rejection - don't show error for expected behavior
            console.log('Wallet not previously authorized - silent connection failed as expected')
          } else {
            // Log unexpected errors but don't show them to user (this is silent connection check)
            console.warn('Unexpected error during silent wallet connection:', connectionError)
          }
        }
      }
    } catch (err) {
      console.error('Error checking wallet availability:', err)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { solana } = window as any

      if (!solana) {
        setError('No Solana wallet detected. Please install Phantom or another compatible wallet.')
        setIsLoading(false)
        return
      }

      // Request connection
      try {
        const response = await solana.connect()

        if (response.publicKey) {
          const publicKey = response.publicKey.toString()

          setWallet({
            publicKey,
            isConnected: true,
            walletName: solana.isPhantom ? 'Phantom' : 'Solana Wallet',
            balance: 0, // No mock data
            solBalance: 0 // No mock data
          })

          console.log('Wallet connected:', {
            publicKey,
            walletName: solana.isPhantom ? 'Phantom' : 'Solana Wallet'
          })
        }
      } catch (connectionError: any) {
        // Handle specific wallet connection errors gracefully
        if (connectionError.code === 4001 || connectionError.message?.includes('User rejected') || connectionError.message?.includes('rejected')) {
          // User explicitly rejected the connection - provide a user-friendly message
          setError('Connection cancelled. You can try connecting again when ready.')
        } else if (connectionError.message?.includes('not authorized') || connectionError.message?.includes('Unauthorized')) {
          setError('Please authorize the wallet connection in your wallet extension.')
        } else {
          // Other connection errors
          setError(connectionError.message || 'Failed to connect wallet. Please try again.')
        }
      }
    } catch (err: any) {
      console.error('Unexpected wallet connection error:', err)
      setError('An unexpected error occurred. Please try refreshing the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any

      if (solana) {
        await solana.disconnect()
      }

      setWallet({
        publicKey: null,
        isConnected: false,
        walletName: null,
        balance: 0,
        solBalance: 0
      })
      setError(null)
    } catch (err) {
      console.error('Wallet disconnection error:', err)
      setError('Failed to disconnect wallet')
    }
  }

  const getShortAddress = (address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const clearError = () => {
    setError(null)
  }

  return {
    wallet,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    checkWalletConnection,
    clearError
  }
}
