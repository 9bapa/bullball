'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Music, Wallet, Shield, Copy, Check, AlertCircle, Sparkles, DollarSign, Play } from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

const SONG_WALLET_ADDRESS = '8XwLS7t1BwKfMEmv5LWzTELvm8ovRBMaBPbTKTi9XkMC'

export default function AnthemPage() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('listen')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const fetchBalance = async () => {
      setLoadingBalance(true)
      try {
        const response = await fetch(`https://api.mainnet-beta.solana.com/v0/accounts/${SONG_WALLET_ADDRESS}`)
        if (!response.ok) return

        const data = await response.json()
        const balance = data.result?.value?.lamports
        setWalletBalance(balance ? balance / 1e9 : 0)
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoadingBalance(false)
      }
    }

    fetchBalance()
  }, [])

  const getShortAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative">
            <div className="text-center space-y-6">
              <Badge className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border-primary/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Exclusive Release
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-shift">
                  BullRhun Anthem
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The world's first crypto rap song with an encrypted seed phrase hidden in the lyrics.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => window.open('https://x.com/bullrhun/status/2009072616233906351?s=46', '_blank')}
                  className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch on X
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setActiveTab('wallet')}
                  className="h-12 px-8 border-2 hover:bg-muted/50"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Song Wallet
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 pt-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music className="w-4 h-4" />
                  <span>Original Track</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Encrypted Seed</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="listen">
                  <Play className="w-4 h-4 mr-2" />
                  Listen
                </TabsTrigger>
                <TabsTrigger value="wallet">
                  <Wallet className="w-4 h-4 mr-2" />
                  Song Wallet
                </TabsTrigger>
              </TabsList>

              {/* Listen Tab - X Post Embed */}
              <TabsContent value="listen" className="mt-8">
                <div className="max-w-2xl mx-auto">
                  <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Music className="w-5 h-5 text-primary" />
                        BullRhun Anthem - Official Video
                      </CardTitle>
                      <CardDescription>
                        Watch the official music video on X
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[400px]">
                        <blockquote className="twitter-tweet" data-theme="light">
                          <a href="https://twitter.com/bullrhun/status/2009072616233906351">Loading Tweet...</a>
                        </blockquote>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center bg-muted/20">
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Video embedded from X
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://x.com/bullrhun/status/2009072616233906351?s=46', '_blank')}
                      >
                        Open in X
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* Song Wallet Tab */}
              <TabsContent value="wallet" className="mt-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card className="border-primary/30 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Wallet className="w-5 h-5 text-primary" />
                        Song Wallet
                      </CardTitle>
                      <CardDescription>
                        The Solana wallet address encrypted within the BullRhun Anthem lyrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-500" />
                              Wallet Address
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(SONG_WALLET_ADDRESS)}
                              className="h-8"
                            >
                              {copied ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                            <span className="font-mono text-sm break-all flex-1">
                              {SONG_WALLET_ADDRESS}
                            </span>
                            <Badge variant="outline" className="font-mono text-xs shrink-0">
                              {getShortAddress(SONG_WALLET_ADDRESS)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Balance</span>
                            </div>
                            {loadingBalance ? (
                              <div className="animate-pulse h-8 w-32 bg-muted/30 rounded" />
                            ) : (
                              <div className="text-2xl font-bold text-primary">
                                {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : '0.0000 SOL'}
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Wallet className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium">Network</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-500">
                              Solana Mainnet
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <strong className="text-foreground">Creator Rewards:</strong> A percentage of rewards are distributed to this Solana wallet address. This wallet is encrypted within the BullRhun Anthem lyrics - decode the song to discover the address and claim your share of the rewards.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          This wallet is controlled by the BullRhun team and used for creator reward distribution.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
            <MobileBottomNav />
      
    </div>
  )
}
