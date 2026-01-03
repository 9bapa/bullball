'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Coins, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  ExternalLink,
  Copy
} from 'lucide-react'

export function WalletInfo() {
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const connection = new Connection('https://api.mainnet-beta.solana.com')

  const getBalance = async () => {
    if (!publicKey) return
    
    setLoading(true)
    try {
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      getBalance()
    }
  }, [connected, publicKey])

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!connected || !publicKey) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Wallet Details
        </CardTitle>
        <CardDescription>
          Real-time wallet information and blockchain data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SOL Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={getBalance}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="text-2xl font-bold">
            {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
          </div>
          {balance !== null && (
            <div className="text-xs text-muted-foreground">
              ≈ ${(balance * 23.45).toFixed(2)} USD {/* Approximate price */}
            </div>
          )}
        </div>

        <Separator />

        {/* Address Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet Address</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://solscan.io/account/${publicKey.toString()}`, '_blank')}
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
            {publicKey.toString()}
          </code>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Quick Actions</span>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <TrendingUp className="h-3 w-3 mr-1" />
              Portfolio
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Activity className="h-3 w-3 mr-1" />
              Activity
            </Button>
          </div>
        </div>

        {/* Network Info */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Network Information</span>
          <div className="flex gap-2">
            <Badge variant="secondary">Mainnet Beta</Badge>
            <Badge variant="outline">Solana</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}