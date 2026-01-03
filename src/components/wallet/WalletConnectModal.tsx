'use client'

import { useState, useEffect } from 'react'
import { DynamicWalletButton, useDynamicWallet } from './DynamicWalletProvider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  X, 
  ArrowRight,
  Shield,
  Star,
  Zap
} from 'lucide-react'

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  popular?: boolean
  recommended?: boolean
}

const walletOptions: WalletOption[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Most popular Solana wallet',
    popular: true
  },
  {
    id: 'solflare',
    name: 'Solflare', 
    icon: '☀️',
    description: 'Secure Solana wallet',
    recommended: true
  }
]

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

// This component is no longer needed since WalletModalButton handles its own modal
export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  // Component kept for backwards compatibility but not used
  return null
}

export function WalletConnectButton() {
  const { connected, connecting, publicKey } = useDynamicWallet()

  console.log('Dynamic Wallet state:', { connected, publicKey: publicKey?.toString() })

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
          Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <DynamicWalletButton />
    </div>
  )
}