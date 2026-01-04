'use client'

import { useUserContext } from '@/context/userContext'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui'
import { Wallet } from 'lucide-react'

export function WalletIcon() {
  const { connected } = useUserContext()
  if (connected) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-meme-purple to-meme-blue p-1.5 flex items-center justify-center">
        <svg 
          className="w-5 h-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2m0 0l2-2m6 2l2 2m0 0l2-2" 
          />
        </svg>
      </div>
    )
  }

  return (
    <WalletModalButton className="p-2 text-gray-400 hover:text-meme-purple transition-colors rounded-lg hover:bg-white/10">
      <Wallet className="h-6 w-6" />
    </WalletModalButton>
  )
}