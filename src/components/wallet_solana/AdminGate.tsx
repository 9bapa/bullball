'use client'

import React from 'react'
import { useUserContext } from '@/context/userContext'
import { WalletIcon } from '@/components/wallet_solana/WalletIcon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Wallet, User } from 'lucide-react'

export function WalletConnectButton() {
  const { connected, user, publicKey, isAdmin } = useUserContext()

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
          {isAdmin ? (
            <>
              <Shield className="w-3 h-3" />
              Admin
            </>
          ) : (
            <>
              <User className="w-3 h-3" />
              Customer
            </>
          )}
        </Badge>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="text-sm text-muted-foreground">
            {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : 'No Wallet'}
          </span>
        </div>
        <WalletIcon />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <WalletIcon />
    </div>
  )
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { connected, isAdmin, publicKey } = useUserContext()
  console.log('🔄 AdminProtectedRoute state:', { connected, isAdmin, publicKey })
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting wallet...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">This wallet does not have admin privileges.</p>
          <p className="text-sm text-muted-foreground">
            Connected: {publicKey}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}