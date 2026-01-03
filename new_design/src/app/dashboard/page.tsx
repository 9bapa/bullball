'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Gift, DollarSign, Activity, Clock, Zap } from 'lucide-react'

interface TokenMetrics {
  creatorFeesCollected: number
  tokensBought: number
  giftsSentToTraders: number
  lastUpdate: string
  nextCycleIn: number
  totalProfitCycles: number
  currentSolPrice: number
}

interface ActivityItem {
  id: string
  type: 'fees' | 'liquidity' | 'gift'
  description: string
  timestamp: Date
  amount?: string
}

interface GiftHistory {
  id: string
  trader: string
  amount: number
  timestamp: Date
  txHash: string
}

interface DevWallet {
  address: string
  balance: number
  totalReceived: number
  totalSent: number
}

export default function ProfitBallDashboard() {
  const [metrics, setMetrics] = useState<TokenMetrics>({
    creatorFeesCollected: 2.4567,
    tokensBought: 1234567,
    giftsSentToTraders: 0.8923,
    lastUpdate: new Date().toISOString(),
    nextCycleIn: 120,
    totalProfitCycles: 156,
    currentSolPrice: 145.32
  })
  
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'fees',
      description: 'Fees claimed & tokens bought',
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: '2',
      type: 'liquidity',
      description: 'Liquidity added & LP burned',
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: '3',
      type: 'gift',
      description: 'Gift sent to trader',
      timestamp: new Date(Date.now() - 300000),
    }
  ])

  const [giftHistory, setGiftHistory] = useState<GiftHistory[]>([
    {
      id: '1',
      trader: '7xKsTG...z3M9',
      amount: 0.125,
      timestamp: new Date(Date.now() - 300000),
      txHash: '3J8n9K2...7LmQ'
    },
    {
      id: '2',
      trader: '9WpRfA...x2N4',
      amount: 0.089,
      timestamp: new Date(Date.now() - 600000),
      txHash: '5Km7Pq3...9RtX'
    },
    {
      id: '3',
      trader: '2LmHdY...8Vb1',
      amount: 0.156,
      timestamp: new Date(Date.now() - 900000),
      txHash: '8Nq4Jx2...3WsZ'
    }
  ])

  const [devWallet, setDevWallet] = useState<DevWallet>({
    address: 'DEV7w4n...3Pq9X',
    balance: 245.67,
    totalReceived: 1250.89,
    totalSent: 1005.22
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/profit-ball/stats')
        const data = await response.json()
        setMetrics(data)
        if (data.giftHistory) {
          setGiftHistory(data.giftHistory.map((gift: any) => ({
            ...gift,
            timestamp: new Date(gift.timestamp)
          })))
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Simulate random updates for demo
        setMetrics(prev => ({
          ...prev,
          creatorFeesCollected: prev.creatorFeesCollected + (Math.random() * 0.01),
          tokensBought: prev.tokensBought + Math.floor(Math.random() * 100),
          giftsSentToTraders: Math.random() > 0.8 ? prev.giftsSentToTraders + (Math.random() * 0.1) : prev.giftsSentToTraders,
          totalProfitCycles: prev.nextCycleIn === 1 ? prev.totalProfitCycles + 1 : prev.totalProfitCycles
        }))
      }
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setMetrics(prev => {
        const newNextCycleIn = prev.nextCycleIn > 0 ? prev.nextCycleIn - 1 : 120
        
        // When cycle completes, add new activity
        if (prev.nextCycleIn === 1) {
          const newActivity: ActivityItem = {
            id: Date.now().toString(),
            type: Math.random() > 0.7 ? 'gift' : Math.random() > 0.5 ? 'liquidity' : 'fees',
            description: Math.random() > 0.7 
              ? 'Gift sent to trader' 
              : Math.random() > 0.5 
                ? 'Liquidity added & LP burned'
                : 'Fees claimed & tokens bought',
            timestamp: new Date(),
          }
          setActivities(prevActivities => [newActivity, ...prevActivities.slice(0, 4)])
          fetchStats() // Fetch new stats
        }
        
        return { ...prev, nextCycleIn: newNextCycleIn }
      })
    }, 1000)

    fetchStats()
    const statsInterval = setInterval(fetchStats, 10000) // Update every 10 seconds

    return () => {
      clearInterval(countdownInterval)
      clearInterval(statsInterval)
    }
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(4)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'fees': return 'bg-green-500/10 border-green-500/20'
      case 'liquidity': return 'bg-blue-500/10 border-blue-500/20'
      case 'gift': return 'bg-purple-500/10 border-purple-500/20'
    }
  }

  const getActivityDotColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'fees': return 'bg-green-400'
      case 'liquidity': return 'bg-blue-400'
      case 'gift': return 'bg-purple-400'
    }
  }

  const getActivityTextColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'fees': return 'text-green-400'
      case 'liquidity': return 'text-blue-400'
      case 'gift': return 'text-purple-400'
    }
  }

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 120) return '1 min ago'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    return `${Math.floor(seconds / 3600)} hours ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      {/* Header */}
      <header className="border-b border-emerald-500/20 backdrop-blur-sm bg-black/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-emerald-500/25">
                P
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Profit Ball
                </h1>
                <p className="text-sm text-emerald-400/80 font-mono font-semibold tracking-wider">$P-BALL</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                asChild
                variant="outline" 
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-bold"
              >
                <a href="/">🛍️ Store</a>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">LIVE</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">SOL Price</p>
                <p className="text-lg font-mono font-bold text-emerald-400">${metrics.currentSolPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-tight">
            AUTO-COMPOUNDING
            <br />
            <span className="text-6xl md:text-8xl">PROFIT ENGINE</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Every 2 minutes: <span className="text-emerald-400 font-semibold">Claim Fees</span> → <span className="text-purple-400 font-semibold">Buy Tokens</span> → <span className="text-blue-400 font-semibold">Add Liquidity</span> → <span className="text-red-400 font-semibold">Burn LP</span> → <span className="text-orange-400 font-semibold">Share Profits</span>
          </p>
        </div>

        {/* Cycle Timer */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border-emerald-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-sm text-gray-300">Next Profit Cycle</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400">
                    {formatTime(metrics.nextCycleIn)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Total Cycles</p>
                <p className="text-xl font-bold text-purple-400">{metrics.totalProfitCycles}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-black/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((120 - metrics.nextCycleIn) / 120) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Creator Fees Card */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-emerald-400">
                <span className="text-xl font-bold tracking-wide">Creator Fees</span>
                <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-4xl font-black font-mono text-emerald-300 tracking-tight">
                  {formatNumber(metrics.creatorFeesCollected)} SOL
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  ${(metrics.creatorFeesCollected * metrics.currentSolPrice).toFixed(2)} USD
                </p>
                <Separator className="bg-emerald-500/20" />
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>Auto-claimed every 2 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tokens Bought Card */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-purple-400">
                <span className="text-xl font-bold tracking-wide">Tokens Bought</span>
                <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-4xl font-black font-mono text-purple-300 tracking-tight">
                  {formatNumber(metrics.tokensBought)}
                </p>
                <p className="text-sm text-gray-400 font-medium">P-BALL tokens</p>
                <Separator className="bg-purple-500/20" />
                <div className="flex items-center text-sm text-purple-400 font-semibold">
                  <Activity className="w-4 h-4 mr-2" />
                  <span>50% of fees used for buying</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gifts Sent Card */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-orange-400">
                <span className="text-xl font-bold tracking-wide">Gifts Sent</span>
                <Gift className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-4xl font-black font-mono text-orange-300 tracking-tight">
                  {formatNumber(metrics.giftsSentToTraders)} SOL
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  ${(metrics.giftsSentToTraders * metrics.currentSolPrice).toFixed(2)} USD
                </p>
                <Separator className="bg-orange-500/20" />
                <div className="flex items-center text-sm text-orange-400 font-semibold">
                  <Gift className="w-4 h-4 mr-2" />
                  <span>Random trader rewards</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <Card className="mb-12 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-black text-center bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent tracking-wider">
              PROFIT BALL MECHANICS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-5 text-center">
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-emerald-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Claim Fees</p>
                <p className="text-xs text-emerald-400 font-mono">Every 2 min</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Buy Tokens</p>
                <p className="text-xs text-purple-400 font-mono">50% of fees</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Add Liquidity</p>
                <p className="text-xs text-blue-400 font-mono">Pool creation</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-red-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Burn LP</p>
                <p className="text-xs text-red-400 font-mono">Deflationary</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Gift Traders</p>
                <p className="text-xs text-orange-400 font-mono">Random rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-black text-center bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent tracking-wider">
              LIVE ACTIVITY FEED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className={`flex items-center justify-between p-4 rounded-lg border ${getActivityColor(activity.type)} hover:scale-[1.02] transition-transform`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getActivityDotColor(activity.type)} animate-pulse`}></div>
                    <div>
                      <p className="font-semibold text-white">{activity.description}</p>
                      <p className="text-sm text-gray-400">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${getActivityTextColor(activity.type)}`}>
                    {activity.amount || 'Processing...'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gift History */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-black text-center bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
              GIFT HISTORY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {giftHistory.map((gift) => (
                <div key={gift.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-mono text-sm text-orange-300">{gift.trader}</p>
                      <p className="text-xs text-gray-400">{getTimeAgo(gift.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-300">{gift.amount.toFixed(4)} SOL</p>
                    <p className="text-xs text-gray-400 font-mono">{gift.txHash}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dev Wallet */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-black text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
              DEVELOPER WALLET
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
                  <p className="font-mono text-blue-300 bg-black/30 p-3 rounded-lg border border-blue-500/20">
                    {devWallet.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Current Balance</p>
                  <p className="text-2xl font-black text-blue-300">
                    {devWallet.balance.toFixed(4)} SOL
                  </p>
                  <p className="text-sm text-gray-400">
                    ${(devWallet.balance * metrics.currentSolPrice).toFixed(2)} USD
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Received</p>
                  <p className="text-xl font-bold text-green-300">
                    +{devWallet.totalReceived.toFixed(4)} SOL
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Sent</p>
                  <p className="text-xl font-bold text-red-300">
                    -{devWallet.totalSent.toFixed(4)} SOL
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-emerald-500/20 backdrop-blur-sm bg-black/40 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400 font-mono text-xs">
              Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-bold tracking-wide">PROFIT BALL ENGINE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}