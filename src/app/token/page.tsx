'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Gift, DollarSign, Activity, Clock, Zap, AlertCircle, CheckCircle, ArrowRight, Target, Trophy } from 'lucide-react'
import { CartButton } from '@/components/merch/CartButton'
import { AllProductsSection } from '@/components/merch/AllProductsSection'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { isClient, safeGetWindow, safeGetDate, safeScrollY, safeAddEventListener } from '@/lib/hydration-utils'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { BottomNav, SlideMenu } from '@/components/layout/mobile-nav'
import { useCartStore } from '@/store/cart'

// BullRhun interfaces
interface BullrhunMetrics {
  total_cycles: number
  total_fees_collected: number
  total_trades: number
  total_rewards_sent: number
  current_sol_price: number
  last_cycle_at: string | null
  next_cycle_in: number
  total_tokens_bought: number
  total_gifts_sent: number
  total_sol_spent: number
}

interface TradeGoal {
  current_goal: number
  current_count: number
  minimum_trade_amount: number
  last_winner_address: string | null
  last_winner_at: string | null
  progress_percentage: number
}

export default function TokenPage() {
  const [data, setData] = useState<any>(null)
  const [activities, setActivities] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>>([])
  const [countdown, setCountdown] = useState(120)
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'step_update' | 'winner_announcement' | 'goal_reset';
    timestamp: string;
  }>>([])
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCartStore()

  // Scroll handling for header visibility
  useEffect(() => {
    if (!isClient()) return;
    
    const handleScroll = () => {
      const currentScrollY = safeScrollY();
      
      const scrollingUp = currentScrollY < lastScrollY;
      setIsScrollingUp(scrollingUp);
      
      if (currentScrollY > 100) {
        setIsHeaderVisible(scrollingUp);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const cleanup = safeAddEventListener('scroll', handleScroll, { passive: true });
    return () => cleanup?.();
  }, [lastScrollY]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/bullrhun/metrics')
        const apiData = await response.json()
        setData(apiData)
        setActivities(apiData.activities || [])
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    const setupBroadcastSubscription = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const channel = supabaseClient
          .channel('bullrhun_broadcasts')
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'bullrhun_broadcasts' },
            (payload) => {
              if (payload.new.message_type === 'winner_announcement' || 
                  payload.new.message_type === 'goal_reset') {
                
                const toast = {
                  id: payload.new.id,
                  message: payload.new.message_content,
                  type: payload.new.message_type,
                  timestamp: payload.new.broadcast_at
                }
                
                setToasts(prev => [toast, ...prev.slice(0, 4)])
                
                setTimeout(() => {
                  setToasts(prev => prev.filter(t => t.id !== toast.id))
                }, 8000)
              }
            }
          )
          .subscribe()

      } catch (error) {
        console.error('Failed to setup broadcast subscription:', error)
      }
    }

    fetchData()
    setupBroadcastSubscription()
    
    return () => {
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 120
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(4)
  }

  const getOrdinal = (num: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const v = num % 100
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = safeGetDate().getTime()
    const seconds = Math.floor((now - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 120) return '1 min ago'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    return `${Math.floor(seconds / 3600)} hours ago`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      case 'online': return 'text-emerald-400'
      case 'offline': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      failed: 'bg-red-500/10 border-red-500/20 text-red-400',
      online: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      offline: 'bg-red-500/10 border-red-500/20 text-red-400',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500/10 border-gray-500/20 text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Shared Header */}
      <SharedHeader 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
      />

      {/* Slide Menu */}
      <SlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 relative z-10" style={{ paddingTop: '90px' }}>

        {/* Solana Meme Token Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="px-6">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">Solana Meme Token</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
          
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <div className="text-center border border-emerald-500/30 rounded-lg p-4 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-300">
                <a
                  href="https://pump.fun/coin/2XioaBY8RkPnocb2ym7dSuGsDZbxbrYsoTcUHf8Xpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                >
                  2Xioa...8Xpump
                </a>
              </div>
              <div className="text-center border border-blue-500/30 rounded-lg p-4 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-300">
                <a href="https://x.com/bullrhun" target="_blank" className="flex justify-center items-center h-full">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400 hover:text-blue-300 transition-colors">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow Section */}
        <div className="mb-16 max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="px-6">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">Flywheel Tek + Trader Rewards</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
          
          <div className=" backdrop-blur-sm rounded-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <p className="text-lg text-emerald-300 font-medium">Next BullRhun</p>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-3xl md:text-4xl font-black font-mono text-emerald-300 tracking-tight">
                  {formatTime(countdown)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden max-w-xs">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${((120 - countdown) / 120) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-emerald-400 font-semibold">Every 2 Minutes</span> • Auto-execution cycle
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg hover:bg-emerald-500/30 transition-all duration-300">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-300 font-semibold">Claim Fees</span>
                </div>
                
                <div className="hidden md:flex text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300 font-semibold">Buy Tokens</span>
                </div>
                
                <div className="hidden md:flex text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-all duration-300">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-red-300 font-semibold">Add Liquidity</span>
                </div>
                
                <div className="hidden md:flex text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-lg hover:bg-orange-500/30 transition-all duration-300">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-300 font-semibold">Share Profits</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="px-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-400">Automated System</span>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-emerald-400">
                <span className="text-xl font-bold tracking-wide">Creator Fees</span>
                <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data && data.overview && (
                  <>
                <p className="text-4xl font-black font-mono text-emerald-300 tracking-tight">
                  {formatNumber(data.overview.totalFeesCollected)} SOL
                </p>

                <p className="text-sm text-gray-400 font-medium">
                  ${(data.overview.totalFeesCollected * data.overview.currentSolPrice).toFixed(2)} USD
                </p>
                </>
                                )}

                <Separator className="bg-emerald-500/20" />
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>Auto-claimed every 2 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-purple-400">
                <span className="text-xl font-bold tracking-wide">Tokens Bought</span>
                <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data && data.overview && (
                <p className="text-4xl font-black font-mono text-purple-300 tracking-tight">
                  {formatNumber(data.overview.totalTokensBought)}
                </p>
                )}
                <p className="text-sm text-gray-400 font-medium">BULLBALL tokens</p>
                <Separator className="bg-purple-500/20" />
                <div className="flex items-center text-sm text-purple-400 font-semibold">
                  <Activity className="w-4 h-4 mr-2" />
                  <span>Buy Back + Liquidty</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-orange-400">
                <span className="text-xl font-bold tracking-wide">Gifts Sent</span>
                <Gift className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data && data.overview && (
                  <>
                <p className="text-4xl font-black font-mono text-orange-300 tracking-tight">
                  {formatNumber(data.overview.totalRewardsSent)} SOL
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  ${(data.overview.totalRewardsSent * data.overview.currentSolPrice).toFixed(2)} USD
                </p>
                </>
                                )}

                <Separator className="bg-orange-500/20" />
                <div className="flex items-center text-sm text-orange-400 font-semibold">
                  <Gift className="w-4 h-4 mr-2" />
                  <span>xth trade wins gift</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade Goal Progress */}
        <Card className="mb-12 relative bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border-indigo-500/30 backdrop-blur-sm overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-md border-b border-indigo-400/30 z-10 transform -translate-y-full group-hover:translate-y-0 transition-all duration-300">
            <div className="flex items-center justify-center space-x-3 py-3">
              <Target className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-sm font-black text-white tracking-widest uppercase">xth Trade Wins Gift</span>
              <Trophy className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-400/30">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-300">GIFT GOAL PROGRESS</span>
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 font-medium mb-1">Target</p>
                  <p className="text-xl font-black font-mono text-indigo-300">
                    {data?.trade_goal?.current_goal || 100}
                    <sup className="text-xs text-indigo-400 ml-1">{getOrdinal(data?.trade_goal?.current_goal || 100)}</sup>
                  </p>
                  <p className="text-xs text-gray-500">trade wins</p>
                </div>
                
                <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 font-medium mb-1">Progress</p>
                  <p className="text-xl font-black font-mono text-purple-300">{data?.trade_goal?.current_count || 0}</p>
                  <p className="text-xs text-gray-500">current trades</p>
                </div>
                
                <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 font-medium mb-1">Gift Bag</p>
                  <p className="text-xl font-black font-mono text-green-300">
                    {formatNumber(data?.dev_wallet?.rewardBalance || 0)} SOL
                  </p>
                  <p className="text-xs text-gray-500">wallet rewards</p>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${data?.trade_goal?.progress_percentage || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0 trades</span>
                  <span className="text-xs text-gray-500">{data?.trade_goal?.current_goal || 100} trades</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-sm font-bold text-yellow-300">LAST WINNER</h4>
                </div>
                {data?.trade_goal?.last_winner_address ? (
                  <div>
                    <p className="text-lg font-mono text-yellow-200 font-semibold mb-1">
                      {data.trade_goal.last_winner_address.slice(0, 4)}...{data.trade_goal.last_winner_address.slice(-4)}
                    </p>
                    {data.trade_goal.last_winner_at && (
                      <p className="text-xs text-gray-400">
                        Won at {new Date(data.trade_goal.last_winner_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No winner yet - be first!</p>
                )}
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-indigo-300">REQUIREMENTS</h4>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Minimum Trade Amount</p>
                  <p className="text-lg font-mono text-indigo-200 font-bold">
                    {(data?.trade_goal?.minimum_trade_amount || 0.05).toFixed(3)} SOL
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Only trades above this amount qualify</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-300">GAME ACTIVE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Notifications */}
        <div className="fixed top-1/2 right-4 z-[100] space-y-3 max-w-sm transform -translate-y-1/2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                p-4 rounded-lg shadow-xl border transform transition-all duration-500
                ${toast.type === 'winner_announcement' 
                  ? 'bg-gradient-to-r from-yellow-500/95 to-orange-500/95 border-yellow-400/50 shadow-yellow-500/30' 
                  : toast.type === 'goal_reset'
                  ? 'bg-gradient-to-r from-purple-500/95 to-indigo-500/95 border-purple-400/50 shadow-purple-500/30'
                  : 'bg-gradient-to-r from-blue-500/95 to-cyan-500/95 border-blue-400/50 shadow-blue-500/30'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                  toast.type === 'winner_announcement' 
                    ? 'bg-yellow-300 animate-pulse' 
                    : toast.type === 'goal_reset'
                    ? 'bg-purple-300 animate-pulse'
                    : 'bg-blue-300 animate-pulse'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white/80">
                      {toast.type === 'winner_announcement' 
                        ? '🎉 WINNER!' 
                        : toast.type === 'goal_reset'
                        ? '🎯 NEW GOAL'
                        : '📢 UPDATE'
                      }
                    </span>
                    <span className="text-xs text-white/60">
                      {new Date(toast.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    toast.type === 'winner_announcement' 
                      ? 'text-white font-bold' 
                      : toast.type === 'goal_reset'
                      ? 'text-white font-semibold'
                      : 'text-white'
                  }`}>
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="mb-12 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-orange-900/20 border-purple-700/30 backdrop-blur-sm">
          <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-400/30">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-300">MEME COIN MERCH</span>
                </div>
              </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-between">
                <span>🔥 All Products</span>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>←</span>
                  <span>Scroll for all products</span>
                  <span>→</span>
                </div>
              </h3>
            
              <AllProductsSection />
            </div>

            <div className="text-center pt-6 border-t border-gray-700">
              <CartButton />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-emerald-500/20 backdrop-blur-sm bg-black/40 mt-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-sm">
            <p className="text-gray-400 font-mono text-xs text-center">copyright © 2024 Bullrhun. All rights reserved. Not financial service</p>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-bold tracking-wide text-center">24/7 Bull<em>Rhun</em></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}