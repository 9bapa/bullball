'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Shield, Zap, Star, Users, Package, Truck, Gift } from 'lucide-react'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { BottomNav, SlideMenu } from '@/components/layout/mobile-nav'
import { useCartStore } from '@/store/cart'

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCartStore()

  return (
    <div className="min-h-screen bg-meme-dark text-white">
      {/* Shared Header */}
      <SharedHeader 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
      />

      {/* Slide Menu */}
      <SlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-meme-purple/20 via-blue-900/30 to-meme-dark">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-meme-purple to-meme-blue rounded-3xl flex items-center justify-center mx-auto mb-6 p-4 hover-lift">
                <img 
                  src="/logo.png" 
                  alt="BullRhun Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                About <span className="text-meme-gradient">Bull<span className="italic">Rhun</span></span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                The ultimate crypto, meme, trading merch & swag super store for the modern degenerate trader
              </p>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-black text-meme-purple mb-2">500+</div>
                <div className="text-sm text-gray-400">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-meme-blue mb-2">50+</div>
                <div className="text-sm text-gray-400">Meme Coins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-meme-green mb-2">24/7</div>
                <div className="text-sm text-gray-400">Drops</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-meme-orange mb-2">100%</div>
                <div className="text-sm text-gray-400">Crypto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
                Our <span className="text-meme-gradient">Mission</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                To create the most entertaining and rewarding trading experience for crypto enthusiasts worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card text-center group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-meme-purple to-meme-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-4 text-white font-bold">Quality Merch</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Premium meme-inspired apparel and accessories designed for true crypto fans who live and breathe the culture
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-meme-green to-meme-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-4 text-white font-bold">Fast Trading</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Lightning-fast crypto payments and instant delivery with no KYC requirements or barriers
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center group">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-meme-orange to-meme-purple rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl mb-4 text-white font-bold">Community Rewards</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Trade games, token rewards, and exclusive drops for the most active community members
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-meme-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
                Why Choose <span className="text-meme-gradient">Bull<span className="italic">Rhun</span></span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                We're not just another merch store - we're a complete ecosystem for crypto traders and meme enthusiasts
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-meme-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-meme-purple" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Secure & Trustworthy</h3>
                    <p className="text-gray-300">
                      Built on Solana blockchain with smart contract security and transparent operations
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-meme-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-meme-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Premium Quality</h3>
                    <p className="text-gray-300">
                      High-quality materials and printing with attention to detail in every piece
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-meme-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-meme-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Global Shipping</h3>
                    <p className="text-gray-300">
                      Fast worldwide delivery with tracking and insurance on all orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-meme-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-meme-orange" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Community First</h3>
                    <p className="text-gray-300">
                      Built by degens, for degens - we understand crypto culture and inside jokes
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-meme-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-meme-purple" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Token Utility</h3>
                    <p className="text-gray-300">
                      BullRhun tokens provide exclusive access, governance rights, and trading rewards
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-meme-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-meme-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Auto Rewards</h3>
                    <p className="text-gray-300">
                      Every transaction automatically contributes to buybacks, liquidity, and prize pools
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section className="py-16 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
                <span className="text-meme-gradient">Tokenomics</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                100% of fees reinvested back into the ecosystem for sustainable growth
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">40% Buybacks</h3>
                  <p className="text-sm text-gray-300">
                    Creator fees buy back tokens, creating green candles when market is red
                  </p>
                  <Badge className="mt-4 bg-green-500/20 text-green-400 border-green-500/30">
                    Active Now
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">35% Liquidity</h3>
                  <p className="text-sm text-gray-300">
                    Fees add to liquidity pools, creating strong buy signals for bots
                  </p>
                  <Badge className="mt-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Auto-Adding
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">25% Merch Profits</h3>
                  <p className="text-sm text-gray-300">
                    Merch sales fund buybacks and liquidity for constant upward pressure
                  </p>
                  <Badge className="mt-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Sustainable
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Ready to Join the <span className="text-meme-gradient">Degeneration</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Start shopping, trading, and earning with thousands of crypto enthusiasts
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-meme-purple to-meme-blue hover:from-meme-purple-dark hover:to-meme-blue-dark">
                  <Package className="w-5 h-5 mr-2" />
                  Shop Merch
                </Button>
              </Link>
              <Link href="/token">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Zap className="w-5 h-5 mr-2" />
                  Trade Game
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav activeTab="about" />
      
      {/* Shared Footer */}
      <SharedFooter />
    </div>
  )
}