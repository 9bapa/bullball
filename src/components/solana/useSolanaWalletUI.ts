'use client'

import { useMemo, useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  WalletModal, 
  WalletMultiButton,
  useWalletModal,
} from '@solana/wallet-adapter-react-ui'

export interface SolanaWalletState {
  wallet: any | null
  publicKey: string | null
  isConnected: boolean
  walletName: string | null
  balance: number
  solBalance: number
  isLoading: boolean
  error: string | null
  connect: () => void
  disconnect: () => void
  getShortAddress: (address: string | null) => string
  clearError: () => void
}

export function useSolanaWallet() {
  const { publicKey, connected, connecting, wallet, connect, disconnect, select } = useWallet()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState(0)
  const [solBalance, setSolBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const connectWallet = useCallback(async () => {
    setError(null)
    try {
      // This will open wallet modal for wallet selection
      setVisible(true)
    } catch (error) {
      console.error('Wallet connection error:', error)
      setError('Failed to connect wallet')
    }
  }, [setVisible])

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      setBalance(0)
      setSolBalance(0)
      setError(null)
      console.log('Wallet disconnected')
    } catch (error) {
      console.error('Wallet disconnect error:', error)
    }
  }, [disconnect])

  const getShortAddress = useCallback((address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [])

  // Update local state based on wallet connection
  useEffect(() => {
    if (publicKey && connected) {
      // Balance is handled by the second useEffect
    } else {
      // Reset balances when not connected
      const resetBalances = () => {
        setBalance(0)
        setSolBalance(0)
      }
      resetBalances()
    }
  }, [publicKey, connected])

  // Simulate balance fetching (replace with actual balance fetching)
  useEffect(() => {
    if (connected && publicKey) {
      // TODO: Replace with actual balance fetching from Solana
      // Mock balance - will be replaced with actual fetching
      const fetchBalance = () => {
        const mockBalance = Math.random() * 10
        setBalance(mockBalance)
        setSolBalance(mockBalance)
      }
      
      fetchBalance()
    }
  }, [connected, publicKey])

  const walletState = useMemo((): SolanaWalletState => ({
    wallet: {
      publicKey: publicKey?.toString() || null,
      isConnected: connected,
      walletName: wallet?.adapter?.name || null,
      balance,
      solBalance
    },
    publicKey: publicKey?.toString() || null,
    isConnected: connected,
    walletName: wallet?.adapter?.name || null,
    balance,
    solBalance,
    isLoading: connecting,
    error,
    connect: connectWallet,
    disconnect: disconnectWallet,
    getShortAddress,
    clearError
    }), [connected, connecting, wallet, publicKey, balance, solBalance, error, connectWallet, disconnectWallet, getShortAddress, clearError])

  return walletState
}