'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Gift, DollarSign, Activity, Clock, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface TradeEntry {
  id: string
  signature: string
  venue: string | null
  amountSol?: number | null
  amountTokens?: number | null
  pricePerToken?: number | null
  createdAt: Date
}

interface LiquidityEntry {
  id: string
  poolKey: string
  quoteAmountSol: number
  baseAmountTokens?: string | null
  lpTokens?: string | null
  slippage?: number
  depositSig?: string | null
  burnSig?: string | null
  createdAt: Date
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

  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [liquidity, setLiquidity] = useState<LiquidityEntry[]>([])

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

    const checkAndTriggerCycle = async () => {
      try {
        const response = await fetch('/api/bullball/cycle-check')
        if (response.ok) {
          const data = await response.json()
          console.log('Cycle check:', data)
          
          if (data.shouldRun) {
            console.log('Triggering bull cycle...')
            const triggerResponse = await fetch('/api/bullball/cycle-check', { method: 'POST' })
            if (triggerResponse.ok) {
              const result = await triggerResponse.json()
              console.log('Cycle triggered:', result)
              // Refresh all data after successful cycle
              fetchStats()
              fetchFeed()
              fetchGifts()
              fetchDevWallet()
              fetchTrade()
            }
          }
        }
      } catch (error) {
        console.error('Cycle check error:', error)
      }
    }

    // Fetch all data immediately
    fetchStats()
    fetchFeed()
    fetchGifts()
    fetchDevWallet()
    fetchTrade()
    
    // Set up intervals for regular updates
    const statsInterval = setInterval(fetchStats, 10000)
    const feedInterval = setInterval(fetchFeed, 10000)
    const giftsInterval = setInterval(fetchGifts, 15000)
    const devInterval = setInterval(fetchDevWallet, 20000)
    const tradeInterval = setInterval(fetchTrade, 10000)
    
    // Check for cycle every 2 minutes (120 seconds)
    checkAndTriggerCycle() // Check immediately on load
    const cycleInterval = setInterval(checkAndTriggerCycle, 120000)

    const fetchTrades = async () => {
      if (!supabase) return
      const { data } = await supabase
        .from('trade_history')
        .select('id,signature,venue,amount_sol,amount_tokens,price_per_token,created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        signature: t.signature,
        venue: t.venue || null,
        amountSol: t.amount_sol != null ? Number(t.amount_sol) : null,
        amountTokens: t.amount_tokens != null ? Number(t.amount_tokens) : null,
        pricePerToken: t.price_per_token != null ? Number(t.price_per_token) : null,
        createdAt: new Date(t.created_at)
      }))
      setTrades(mapped)
    }

    const fetchLiquidity = async () => {
      if (!supabase) return
      const { data } = await supabase
        .from('liquidity_history')
        .select('id,pool_key,quote_amount_sol,base_amount_tokens,lp_tokens,slippage,deposit_sig,burn_sig,created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      const mapped = (data || []).map((l: any) => ({
        id: l.id,
        poolKey: l.pool_key,
        quoteAmountSol: Number(l.quote_amount_sol),
        baseAmountTokens: l.base_amount_tokens ?? null,
        lpTokens: l.lp_tokens ?? null,
        slippage: l.slippage ?? undefined,
        depositSig: l.deposit_sig ?? null,
        burnSig: l.burn_sig ?? null,
        createdAt: new Date(l.created_at)
      }))
      setLiquidity(mapped)
    }

    fetchTrades()
    fetchLiquidity()

    let tradeChannel: any = null
    let liqChannel: any = null
    if (supabase) {
      tradeChannel = supabase
        .channel('realtime-trades')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trade_history' }, payload => {
          const t: any = payload.new
          const entry: TradeEntry = {
            id: t.id,
            signature: t.signature,
            venue: t.venue || null,
            amountSol: t.amount_sol != null ? Number(t.amount_sol) : null,
            amountTokens: t.amount_tokens != null ? Number(t.amount_tokens) : null,
            pricePerToken: t.price_per_token != null ? Number(t.price_per_token) : null,
            createdAt: new Date(t.created_at || new Date())
          }
          setTrades(prev => [entry, ...prev].slice(0, 20))
        })
        .subscribe()

      liqChannel = supabase
        .channel('realtime-liquidity')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'liquidity_history' }, payload => {
          const l: any = payload.new
          const entry: LiquidityEntry = {
            id: l.id,
            poolKey: l.pool_key,
            quoteAmountSol: Number(l.quote_amount_sol || 0),
            baseAmountTokens: l.base_amount_tokens ?? null,
            lpTokens: l.lp_tokens ?? null,
            slippage: l.slippage ?? undefined,
            depositSig: l.deposit_sig ?? null,
            burnSig: l.burn_sig ?? null,
            createdAt: new Date(l.created_at || new Date())
          }
          setLiquidity(prev => [entry, ...prev].slice(0, 20))
        })
        .subscribe()
    }

    return () => {
      clearInterval(statsInterval)
      clearInterval(feedInterval)
      clearInterval(giftsInterval)
      clearInterval(devInterval)
      clearInterval(tradeInterval)
      clearInterval(cycleInterval)
      if (tradeChannel) supabase && supabase.removeChannel(tradeChannel)
      if (liqChannel) supabase && supabase.removeChannel(liqChannel)
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
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-emerald-500/25">
                <Image src="/bullrhun.PNG" alt="BullRhun" width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Orbitron, monospace' }}>
                  BullRhun
                </h1>
                <p className="text-sm text-emerald-400/80 font-mono font-semibold tracking-wider">$BULLRHUN</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-6">
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
            </div> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 relative z-10">
        {/* Hero Section */}
        <div className="mb-12 max-w-5xl mx-auto text-center md:text-left">
          <div className="mx-auto md:float-left md:mr-8 w-48 h-48 md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-4 border-emerald-400 shadow-lg shadow-emerald-500/25" style={{ shapeOutside: 'circle(50%)' }}>
            <Image src="/bullrhun.PNG" alt="BullRhun" width={300} height={300} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-tight">
            INFINITE BULLRHUN
            <br />
            <span className="text-6xl md:text-8xl">$$ ENGINE</span>
          </h3>
          <div className="md:clear-both"></div>
        </div>

        <div className="mb-12 max-w-5xl mx-auto text-centr">
          <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed mt-3 text-center">
            Every 2 minutes: <span className="text-emerald-400 font-semibold">Claim Fees</span> → <span className="text-purple-400 font-semibold">Buy Tokens</span> → <span className="text-blue-400 font-semibold">Add Liquidity</span> → <span className="text-red-400 font-semibold">Burn LP</span> → <span className="text-orange-400 font-semibold">Share Profits</span>
          </p>
          </div>
        <div className="mb-12 flex justify-center">
          <div className="col-span-3 text-center border-2 border-dashed border-emerald-500/50 rounded-lg p-6 bg-emerald-500/5">
            <a
              href="https://pump.fun/coin/2XioaBY8RkPnocb2ym7dSuGsDZbxbrYsoTcUHf8Xpump"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl md:text-3xl text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
            >
              2Xioa...8Xpump
            </a>
          </div>
        </div>
        {/* Cycle Timer */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border-emerald-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-300">Next Bull Cycle</p>
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
              BULL RHUN MECHANICS
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

        <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 to-emerald-500/10 border-yellow-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-black tracking-wider">
              <Activity className="w-6 h-6 text-emerald-400" />
              <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">TRADE HISTORY</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trades.length === 0 && (
                <div className="flex items-center justify-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <span className="text-emerald-400 font-mono font-semibold">N/A</span>
                </div>
              )}
              {trades.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <a
                        href={`https://solscan.io/tx/${t.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-semibold tracking-wide hover:text-emerald-400 transition-colors underline"
                      >
                        {t.signature.slice(0, 8)}...{t.signature.slice(-8)}
                      </a>
                      <p className="text-emerald-400 text-xs font-mono">{t.venue || 'pump'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300 font-mono">
                      {t.amountSol != null ? `${t.amountSol?.toFixed?.(4)} SOL` : t.amountTokens != null ? `${t.amountTokens} tokens` : '—'}
                    </p>
                    <p className="text-xs text-gray-400">{getTimeAgo(t.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 to-red-500/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-center space-x-3 text-xl font-black tracking-wider">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">LIQUIDITY & BURN HISTORY</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liquidity.length === 0 && (
                <div className="flex items-center justify-center p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <span className="text-blue-400 font-mono font-semibold">N/A</span>
                </div>
              )}
              {liquidity.map(l => (
                <div key={l.id} className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold tracking-wide">Pool {l.poolKey.slice(0, 8)}...{l.poolKey.slice(-8)}</p>
                      <p className="text-blue-400 text-xs font-mono">
                        Deposit {l.depositSig ? (
                          <a
                            href={`https://solscan.io/tx/${l.depositSig}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-300 underline"
                          >
                            {l.depositSig.slice(0, 8)}...{l.depositSig.slice(-8)}
                          </a>
                        ) : 'N/A'}
                        {l.burnSig ? (
                          <>
                            {' · Burn '}
                            <a
                              href={`https://solscan.io/tx/${l.burnSig}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-300 underline"
                            >
                              {l.burnSig.slice(0, 8)}...{l.burnSig.slice(-8)}
                            </a>
                          </>
                        ) : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300 font-mono">{l.quoteAmountSol.toFixed(4)} SOL</p>
                      <p className="text-xs text-gray-400">{getTimeAgo(l.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gift History Section */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex flex-col items-center text-xl font-black tracking-wider">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-orange-400" />
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">GIFT HISTORY</span>
              </div>
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mt-2">{tradeGoal - tradeCount} trader gets creator fees</span>
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
                      <p className="text-white font-semibold tracking-wide">{gift.trader.slice(0, 8)}...{gift.trader.slice(-8)}</p>
                      <p className="text-orange-400 text-xs font-mono">
                        <a
                          href={`https://solscan.io/tx/${gift.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-orange-300 underline"
                        >
                          {gift.txHash.slice(0, 8)}...{gift.txHash.slice(-8)}
                        </a>
                      </p>
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
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Developer Wallet Address</p>
              <p className="text-blue-400 font-mono font-semibold text-lg break-all">{devWallet.address || 'N/A'}</p>
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
