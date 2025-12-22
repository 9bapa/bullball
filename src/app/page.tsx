'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    creatorFeesCollected: 0,
    tokensBought: 0,
    giftsSentToTraders: 0,
    lastUpdate: new Date().toISOString(),
    nextCycleIn: 120,
    totalProfitCycles: 0,
    currentSolPrice: 0
  })
  
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const [giftHistory, setGiftHistory] = useState<GiftHistory[]>([])

  const [devWallet, setDevWallet] = useState<DevWallet>({
    address: '',
    balance: 0,
    totalReceived: 0,
    totalSent: 0
  })
  const [tradeGoal, setTradeGoal] = useState<number>(0)
  const [tradeCount, setTradeCount] = useState<number>(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/bullball/stats')
        const data = await response.json()
        setMetrics(data)
      } catch {}
    }

    const fetchFeed = async () => {
      try {
        const response = await fetch('/api/bullball/feed')
        const data = await response.json()
        setActivities(data.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })))
      } catch {}
    }

    const fetchGifts = async () => {
      try {
        const response = await fetch('/api/bullball/gifts')
        const data = await response.json()
        setGiftHistory(data.map((g: any) => ({ ...g, timestamp: new Date(g.timestamp) })))
      } catch {}
    }

    const fetchDevWallet = async () => {
      try {
        const response = await fetch('/api/bullball/dev-wallet')
        const data = await response.json()
        setDevWallet(data)
      } catch {}
    }

    const fetchTrade = async () => {
      try {
        const response = await fetch('/api/bullball/trade')
        const data = await response.json()
        setTradeGoal(data.current_threshold || 0)
        setTradeCount(data.current_count || 0)
      } catch {}
    }

    const countdownInterval = setInterval(() => {
      setMetrics(prev => {
        const newNextCycleIn = prev.nextCycleIn > 0 ? prev.nextCycleIn - 1 : 120
        if (prev.nextCycleIn === 1) {
          fetchStats()
          fetchFeed()
          fetchGifts()
          fetchDevWallet()
          fetchTrade()
        }
        
        return { ...prev, nextCycleIn: newNextCycleIn }
      })
    }, 1000)

    fetchStats()
    fetchFeed()
    fetchGifts()
    fetchDevWallet()
    fetchTrade()
    const statsInterval = setInterval(fetchStats, 10000)
    const feedInterval = setInterval(fetchFeed, 10000)
    const giftsInterval = setInterval(fetchGifts, 15000)
    const devInterval = setInterval(fetchDevWallet, 20000)
    const tradeInterval = setInterval(fetchTrade, 10000)

    return () => {
      clearInterval(countdownInterval)
      clearInterval(statsInterval)
      clearInterval(feedInterval)
      clearInterval(giftsInterval)
      clearInterval(devInterval)
      clearInterval(tradeInterval)
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
                  Bull Ball
                </h1>
                <p className="text-sm text-emerald-400/80 font-mono font-semibold tracking-wider">$BULLBALL</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">LIVE</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">BULLBALL</p>
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
            BULLISH AUTO-COMPOUNDING
            <br />
            <span className="text-6xl md:text-8xl">$$ ENGINE</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Every 2 minutes: <span className="text-emerald-400 font-semibold">Claim Fees</span> → <span className="text-purple-400 font-semibold">Buy Tokens</span> → <span className="text-blue-400 font-semibold">Add Liquidity</span> → <span className="text-red-400 font-semibold">Burn LP</span> → <span className="text-orange-400 font-semibold">Share Profits</span>
          </p>
        </div>

        {/* Cycle Timer */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border-emerald-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-300">Next Profit Cycle</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400">{formatTime(metrics.nextCycleIn)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Total Cycles</p>
                  <p className="text-xl font-bold text-purple-400">{metrics.totalProfitCycles}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gift className="w-6 h-6 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-300">Next Gift</p>
                    <p className="text-2xl font-bold font-mono text-orange-400">{tradeGoal || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Current Trades</p>
                  <p className="text-xl font-bold text-orange-400">{tradeCount || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${((120 - metrics.nextCycleIn) / 120) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${tradeGoal ? Math.min(100, (tradeCount / tradeGoal) * 100) : 0}%` }}></div>
                </div>
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
                <p className="text-sm text-gray-400 font-medium">BULLBALL tokens</p>
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
                <p className="text-xs text-emerald-400 font-mono font-semibold">Every 2 min</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Buy Tokens</p>
                <p className="text-xs text-purple-400 font-mono font-semibold">50% of SOL</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Add Liquidity</p>
                <p className="text-xs text-blue-400 font-mono font-semibold">Pool tokens</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-red-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Burn LP</p>
                <p className="text-xs text-red-400 font-mono font-semibold">Reduce supply</p>
              </div>
              <div className="space-y-3 group">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-500/30 transition-colors group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-sm font-bold text-gray-300 tracking-wide">Gift Traders</p>
                <p className="text-xs text-orange-400 font-mono font-semibold">Random rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-black tracking-wider">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">LIVE ACTIVITY FEED</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 && (
                <div className="flex items-center justify-center p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                  <span className="text-yellow-400 font-mono font-semibold">N/A</span>
                </div>
              )}
              {activities.map((activity, index) => (
                <div 
                  key={activity.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    index === 0 ? 'animate-pulse shadow-lg' : ''
                  } ${getActivityColor(activity.type)} hover:scale-[1.02]`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getActivityDotColor(activity.type)} ${
                      index === 0 ? 'animate-pulse' : ''
                    }`}></div>
                    <span className="text-white font-semibold tracking-wide">{activity.description}</span>
                  </div>
                  <span className={`${getActivityTextColor(activity.type)} text-sm font-mono font-semibold`}>
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gift History Section */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-black tracking-wider">
              <Gift className="w-6 h-6 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">GIFT HISTORY</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {giftHistory.length === 0 && (
                <div className="flex items-center justify-center p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                  <span className="text-orange-400 font-mono font-semibold">N/A</span>
                </div>
              )}
              {giftHistory.map((gift, index) => (
                <div 
                  key={gift.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold tracking-wide">{gift.trader}</p>
                      <p className="text-orange-400 text-xs font-mono">{gift.txHash}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-orange-300">
                      {gift.amount.toFixed(3)} SOL
                    </p>
                    <p className="text-xs text-gray-400">
                      {getTimeAgo(gift.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dev Wallet Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-black tracking-wider">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DEVELOPER WALLET</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/30 border border-blue-500/20">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Wallet Address</p>
                  <p className="text-blue-400 font-mono font-semibold text-sm">{devWallet.address || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-blue-500/20">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Balance</p>
                  <p className="text-2xl font-bold font-mono text-blue-300">
                    {devWallet.balance.toFixed(4)} SOL
                  </p>
                  <p className="text-sm text-gray-400">
                    ${(devWallet.balance * metrics.currentSolPrice).toFixed(2)} USD
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/30 border border-green-500/20">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Received</p>
                  <p className="text-xl font-bold font-mono text-green-300">
                    {devWallet.totalReceived.toFixed(4)} SOL
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/30 border border-red-500/20">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Sent</p>
                  <p className="text-xl font-bold font-mono text-red-300">
                    {devWallet.totalSent.toFixed(4)} SOL
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-emerald-500/20 backdrop-blur-sm bg-black/40 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400 font-mono text-xs">Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-bold tracking-wide">AUTO-COMPOUNDING ENABLED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
