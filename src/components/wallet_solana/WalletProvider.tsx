'use client'

import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

// Import CSS styles for wallet adapter UI
import '@solana/wallet-adapter-react-ui/styles.css'

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Use mainnet-beta network
  const network = clusterApiUrl('mainnet-beta')
  const endpoint = useMemo(() => network, [])

  // Start with empty wallets array - modal will show available wallets automatically
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

// Hook for wallet state
export function useSolanaWallet() {
  const { publicKey, connected, connecting, disconnect, select, wallets } = useWallet()
  const network = clusterApiUrl('mainnet-beta')
  
  return {
    publicKey,
    connected,
    connecting,
    disconnect,
    select,
    wallets,
    network,
  }
}