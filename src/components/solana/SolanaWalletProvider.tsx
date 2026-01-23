'use client'

import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Network configuration
  const network = clusterApiUrl('mainnet-beta')
 const endpoint = useMemo(() => network, [])

  // Wallet adapters configuration
 const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect={true}>
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