'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AllProductsSection } from '@/components/merch/AllProductsSection'
import { CartButton } from '@/components/merch/CartButton'
import { BottomNav, SlideMenu } from '@/components/layout/mobile-nav'
import { SharedHeader } from '@/components/layout/shared-header'
import { TickerTape } from '@/components/ui/TickerTape'
import { MemeCategories } from '@/components/ui/MemeCategories'
import { Leaderboard, Achievements, QuickStats } from '@/components/ui/Gamification'
import { useCartStore } from '@/store/cart'
import { SubmitDesignModal } from '@/components/modals/SubmitDesignModal'
import { BecomeVendorModal } from '@/components/modals/BecomeVendorModal'
import { SolanaWalletProvider } from '@/components/wallet_solana/WalletProvider'
import { useUserContext } from '@/context/userContext'
import { WalletConnect } from '@/components/wallet_solana/WalletConnect'
import { SharedFooter } from '@/components/layout/shared-footer'
import { 
  Sparkles, 
  TrendingUp,
  Package,
  Star,
  Zap,
  ArrowRight,
  ShoppingCart,
  Menu,
  Coins,
  Trophy,
  Target,
  Gift
} from 'lucide-react'

export default function StoreFront() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const { items } = useCartStore()
  const [isSubmitDesignOpen, setIsSubmitDesignOpen] = useState(false)
  const [isBecomeVendorOpen, setIsBecomeVendorOpen] = useState(false)
  const [tradeGameData, setTradeGameData] = useState<any>(null)
  const { connected, publicKey } = useUserContext()

    // Add ref to prevent multiple API calls
  const metricsFetchedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple API calls during development or re-renders
    if (metricsFetchedRef.current) return
    metricsFetchedRef.current = true
    
    // Fetch trade game data for main page
    const fetchTradeData = async () => {
      try {
        const response = await fetch('/api/bullrhun/metrics')
        const apiData = await response.json()
        setTradeGameData(apiData)
      } catch (error) {
        console.error('Failed to fetch trade game data:', error)
      }
    }
    
    fetchTradeData()
  }, [isLoaded])

  useEffect(() => {
    setIsLoaded(true)
    // Set active tab based on current path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path === '/') setActiveTab('home')
      else if (path === '/explore') setActiveTab('explore')
      else if (path === '/cart') setActiveTab('cart')
      else if (path === '/profile') setActiveTab('profile')
    }
  }, [])

  const quickStats = [
    { label: 'Products', value: '500+', icon: Package, color: 'text-meme-purple' },
    { label: 'Coins', value: '50+', icon: Star, color: 'text-meme-blue' },
    { label: 'Drops', value: '24/7', icon: Zap, color: 'text-meme-green' }
  ]

  const features = [
    {
      icon: TrendingUp,
      title: 'Token Buybacks',
      description: 'Creator fees buy back tokens, creating green candles and driving price up when market is red',
      gradient: 'bg-gradient-green',
      stat: '40% of fees'
    },
    {
      icon: ShoppingCart,
      title: 'Liquidity Growth',
      description: 'Creator fees add liquidity, creating strong buy signals for trading bots and market makers',
      gradient: 'bg-gradient-blue',
      stat: '35% of fees'
    },
    {
      icon: Star,
      title: 'Merch Revenue',
      description: 'Merch profits buy back tokens and add liquidity, ensuring constant upward pressure',
      gradient: 'bg-gradient-purple',
      stat: '25% of profits'
    }
  ]

  return (
    <div className="min-h-screen bg-meme-dark text-white pb-20">
      {/* Shared Header - Responsive */}
      <SharedHeader 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
      />

      {/* Slide Menu */}
      <SlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Hero Section with Ticker - Show on all screen sizes */}
      <section className="pt-16 md:pt-24 min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
        {/* Trending Ticker */}
        {/* <TickerTape className="w-full" /> */}
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 py-12 text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo and Title */}
        <div className="mb-8">
          <div className="w-75 h-75 rounded-2xl flex items-center justify-center mx-auto mb-4 hover-lift p-2">
            <img 
              src="/logo.png" 
              alt="BullRhun Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 font-display">
            <span className="text-meme-gradient">Bull<span className="italic">Rhun</span></span>
            <br />
            <span className="text-white"><small>crypto, meme, trading merch store</small></span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Rock the latest meme-tech swag 
          </p>
                    {/* Trading-Themed Divider */}
          <div className="relative mb-8 py-6">
            {/* Main Line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-xs h-1 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div className="flex-1 bg-meme-purple"></div>
                  <div className="flex-1 bg-meme-blue"></div>
                  <div className="flex-1 bg-meme-green"></div>
                  <div className="flex-1 bg-meme-orange"></div>
                </div>
              </div>
            </div>
            {/* Trading Dots */}
            <div className="relative z-10 flex items-center justify-center gap-4">
              <div className="w-4 h-4 bg-meme-purple rounded-full shadow-xl shadow-meme-purple/50 animate-pulse ring-2 ring-meme-purple/30"></div>
              <div className="w-4 h-4 bg-meme-blue rounded-full shadow-xl shadow-meme-blue/50 ring-2 ring-meme-blue/30"></div>
              <div className="w-4 h-4 bg-meme-green rounded-full shadow-xl shadow-meme-green/50 ring-2 ring-meme-green/30"></div>
              <div className="w-4 h-4 bg-meme-orange rounded-full shadow-xl shadow-meme-orange/50 ring-2 ring-meme-orange/30"></div>
            </div>
          </div>
        </div>
            
        
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="btn-neon-purple text-base sm:text-lg px-8"
                onClick={() => setIsSubmitDesignOpen(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Submit Design
              </Button>
              <Button 
                size="lg" 
                className="btn-neon-green text-base sm:text-lg px-8"
                onClick={() => setIsBecomeVendorOpen(true)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Merch Vendors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Meme Categories Section */}
      {/* <section className="py-12 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
              Shop by <span className="text-meme-gradient">Coin</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Browse our massive collection of meme coin categories
            </p>
          </div>
          
          <MemeCategories /> */}
          
          {/* View All Button */}
          {/* <div className="text-center mt-12">
            <Link href="/categories">
              <Button size="lg" className="btn-neon-blue">
                View All Categories
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div> */}
        {/* </div>
      </section> */}

      {/* Featured Products */}
      <section className="py-12 bg-meme-dark">
        <div className="container mx-auto px-4">
          
          <AllProductsSection />
          
          {/* View All Button */}
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="btn-neon-purple">
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BullRhun Tokenomics Section */}
      <section className="py-16 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              24/7 <span className="text-meme-gradient">Bull<span className="italic">Rhuns</span></span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Every transaction fuels token growth through automated buybacks and liquidity generation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card text-center group relative overflow-hidden">
                <CardContent className="p-8">
                  {/* Stat Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${feature.gradient === 'bg-gradient-green' ? 'bg-green-500' : feature.gradient === 'bg-gradient-blue' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                      {feature.stat}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${feature.gradient} group-hover:scale-110 transition-all duration-300 relative`}>
                    <feature.icon className="w-8 h-8 text-white relative z-10" />
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 ${feature.gradient} opacity-30 blur-xl rounded-2xl`}></div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl mb-4 text-white font-bold">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{feature.description}</p>
                  
                  {/* Bottom Accent */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-green-400 font-semibold">ACTIVE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-white font-semibold">
                  100% of fees reinvested into token growth
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Game Section */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
                <span className="text-meme-gradient">BullRhun</span> Trade Game
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Compete with traders - every qualifying trade counts toward the prize pot!
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Current Pot */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Current Pot</h3>
                  <div className="text-3xl font-black font-mono text-yellow-400 mb-1">
                    {tradeGameData?.dev_wallet?.rewardBalance ? (tradeGameData.dev_wallet.rewardBalance / 1000000000).toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-400">SOL Prize Pool</div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-green-400">ACTIVE GAME</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Progress */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-meme-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Trade Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Current Trades:</span>
                      <span className="text-xl font-bold text-meme-blue">{tradeGameData?.trade_goal?.current_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Goal:</span>
                      <span className="text-xl font-bold text-white">{tradeGameData?.trade_goal?.current_goal || 100}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                      <div className="h-2 bg-gradient-to-r from-meme-purple to-meme-blue rounded-full" style={{ width: `${tradeGameData?.trade_goal?.progress_percentage || 0}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">53 trades to win!</div>
                  </div>
                </div>
              </div>

              {/* Last Winner */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-meme-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Last Winner</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">Prize Won</div>
                    <div className="text-2xl font-bold text-meme-purple">
                        {tradeGameData?.trade_goal?.last_winner_address ? '2.5' : '0.0'} SOL
                      </div>
                    <div className="text-sm text-gray-400 mb-3">Winner Address</div>
                    <div className="bg-black/30 rounded-lg px-3 py-2 font-mono text-xs">
                      {tradeGameData?.trade_goal?.last_winner_address ? 
                        `${tradeGameData.trade_goal.last_winner_address.slice(0, 4)}...${tradeGameData.trade_goal.last_winner_address.slice(-4)}` 
                        : 'No winner yet'
                      }
                    </div>
                    <div className="text-xs text-gray-400 mt-3">
                      {tradeGameData?.trade_goal?.last_winner_at ? 
                        `Won ${Math.floor((Date.now() - new Date(tradeGameData.trade_goal.last_winner_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                        : 'No winner yet'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-gray-300">
                  <span className="text-meme-blue font-semibold">Minimum Trade:</span> {(tradeGameData?.trade_goal?.minimum_trade_amount || 0.05).toFixed(3)} SOL to qualify
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="text-sm text-gray-300">
                  <span className="text-yellow-400 font-semibold">xth trade wins!</span> Every milestone
                </div>
              </div>
            </div>

            {/* Trade Game Wallet */}
            <div className="mt-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-meme-purple to-meme-blue rounded-xl flex items-center justify-center">
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white ml-3">Trade Game Wallet</h3>
                  </div>
                  
                  {connected && publicKey ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center p-4 bg-black/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">BULLRHUN Balance</div>
                        <div className="text-lg font-mono text-meme-purple font-bold">
                          {tradeGameData?.dev_wallet?.tokenBalance ? (tradeGameData.dev_wallet.tokenBalance / 1000000000).toFixed(2) : '0.00'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Address: <span className="font-mono">{publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : 'Not Connected'}</span>
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-black/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">SOL Balance</div>
                        <div className="text-lg font-mono text-blue-300 font-bold">
                          {tradeGameData?.dev_wallet?.solBalance ? (tradeGameData.dev_wallet.solBalance / 1000000000).toFixed(3) : '0.000'} SOL
                        </div>
                        <div className="text-xs text-gray-400">
                          Address: <span className="font-mono">{publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : 'Not Connected'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <WalletConnect />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link href="/token">
                <Button size="lg" className="bg-gradient-to-r from-meme-purple to-meme-blue hover:from-meme-purple-dark hover:to-meme-blue-dark px-8">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Full Trade Game
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav activeTab={activeTab} />
      
      {/* Shared Footer */}
      <SharedFooter />
      
      {/* Modals */}
      <SubmitDesignModal 
        isOpen={isSubmitDesignOpen} 
        onClose={() => setIsSubmitDesignOpen(false)} 
      />
      <BecomeVendorModal 
        isOpen={isBecomeVendorOpen} 
        onClose={() => setIsBecomeVendorOpen(false)} 
      />
    </div>
  )
}