'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useSwapStore } from '@/components/swap/useSwapStore'
import { useUserContext } from '@/context/userContext'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowDownUp,
  Wallet,
  RefreshCw,
  ChevronDown,
  Zap,
  Settings,
  Percent,
  Search,
  ArrowUpRight,
  Trophy,
  Sparkles,
  Gamepad2,
  Plus,
  Coins,
  Target,
  Flame,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Copy,
  Check
} from 'lucide-react'
import { VersionedTransaction } from '@solana/web3.js'
import { getBalance, getTokenBalance } from '@/lib/solana'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

interface Token {
  symbol: string
  name: string
  balance: number
  icon: string
  color: string
  mint?: string
}

interface Game {
  id: string
  token_mint: string
  token_name: string
  token_ticker: string
  trade_goal: number
  trade_count: number
  trade_type: 'buys_only' | 'buys_sells'
  min_trade_amount: number
  is_bull_mode: boolean
  game_wallet_address: string
  game_wallet_balance: number
  status: 'active' | 'completed' | 'reset'
  created_at: string
  progress?: number
}

interface Winner {
  id: string
  game_id: string
  token_mint: string
  winner_wallet_address: string
  winning_amount: number
  winning_signature: string
  payout_tx_id: string
  game_stats: any
  won_at: string
  token_name?: string
  token_ticker?: string
}

const SOL_TOKEN: Token = {
  symbol: 'SOL',
  name: 'Solana',
  balance: 0,
  icon: '◎',
  color: '#9945FF',
  mint: 'native'
}

export default function SwapPage() {
  const { connected, publicKey } = useUserContext()
  const { minimumTradeAmount, incrementTrades, addSwapHistory } = useSwapStore()
  const { toast } = useToast()
  const [fromToken, setFromToken] = useState<Token>(SOL_TOKEN)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateGame, setShowCreateGame] = useState(false)
  const [slippage, setSlippage] = useState('0.5')
  const [deadline, setDeadline] = useState('20')
  const [searchTerm, setSearchTerm] = useState('')
  const [splTokens, setSplTokens] = useState<Token[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [newTokenMint, setNewTokenMint] = useState('')
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenTicker, setNewTokenTicker] = useState('')
  const [copiedGameWallet, setCopiedGameWallet] = useState<string | null>(null)

  useEffect(() => {
    fetchSplTokens()
    fetchGames()
    fetchWinners()
  }, [])

  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletBalances()
    }
  }, [connected, publicKey, splTokens])

  const fetchWalletBalances = async () => {
    if (!publicKey) return

    try {
      const solBalance = await getBalance(publicKey)
      setFromToken(prev => prev ? { ...prev, balance: solBalance } : prev)

      const updatedSplTokens = await Promise.all(
        splTokens.map(async (token) => {
          if (token.mint && token.mint !== 'native') {
            const tokenBalance = await getTokenBalance(token.mint, publicKey)
            return { ...token, balance: tokenBalance }
          }
          return token
        })
      )
      setSplTokens(updatedSplTokens)
    } catch (error) {
      console.error('Failed to fetch wallet balances:', error)
    }
  }

  const fetchSplTokens = async () => {
    try {
      const response = await fetch('/api/bullrhun/games')
      const data = await response.json()
      console.log('Fetched games:', data)
      if (data.games && data.games.length > 0) {
        const gameTokens = data.games.map((game: Game) => ({
          symbol: game.token_ticker || 'TOKEN',
          name: game.token_name || 'Token',
          balance: 0,
          icon: '🪙',
          color: '#14F195',
          mint: game.token_mint
        }))
        setSplTokens(gameTokens)
      }
    } catch (error) {
      console.error('Failed to fetch SPL tokens:', error)
    }
  }

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/bullrhun/games')
      const data = await response.json()
      if (data.games) {
        setGames(data.games)
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
    }
  }

  const fetchWinners = async () => {
    try {
      const response = await fetch('/api/bullrhun/winners?limit=10')
      const data = await response.json()
      if (data.winners) {
        setWinners(data.winners)
      }
    } catch (error) {
      console.error('Failed to fetch winners:', error)
    }
  }

  const handleCreateGame = async () => {
    if (!newTokenMint || !newTokenName || !newTokenTicker) {
      toast({
        title: 'Error',
        description: 'Please fill in all token fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/bullrhun/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenMint: newTokenMint,
          tokenName: newTokenName,
          tokenTicker: newTokenTicker
        })
      })

      const data = await response.json()

      if (data.game) {
        toast({
          title: 'Game Created!',
          description: `BullRhun game for ${newTokenName} created successfully`,
          variant: 'default'
        })
        setShowCreateGame(false)
        setNewTokenMint('')
        setNewTokenName('')
        setNewTokenTicker('')
        fetchGames()
        fetchSplTokens()
      } else {
        const errorMessage = data.error || 'Failed to create game';
        toast({
          title: response.status === 409 ? 'Token Already Registered' : 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to create game:', error)
      toast({
        title: 'Error',
        description: 'Failed to create game',
        variant: 'destructive'
      })
    }
  }

  const handleSwapTokens = async () => {
    const amount = parseFloat(fromAmount)
    if (!amount || isNaN(amount)) return

    if (!connected || !publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to swap tokens',
        variant: 'destructive'
      })
      return
    }

    if (!fromToken) {
      toast({
        title: 'Select Token',
        description: 'Please select a token to swap from',
        variant: 'destructive'
      })
      return
    }

    if (!toToken) {
      toast({
        title: 'Select Token',
        description: 'Please select a token to swap to',
        variant: 'destructive'
      })
      return
    }

    setIsSwapping(true)

    const action = fromToken.mint === 'native' ? 'buy' : 'sell'
    const mint = fromToken.mint === 'native' ? toToken.mint : fromToken.mint

    try {
      const response = await fetch('https://pumpportal.fun/api/trade-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: publicKey,
          action: action,
          mint: mint,
          denominatedInSol: 'true',
          amount: parseFloat(fromAmount),
          slippage: parseFloat(slippage),
          priorityFee: 0.00001,
          pool: 'auto'
        })
      })

      if (response.status === 200) {
        const data = await response.arrayBuffer()
        const tx = VersionedTransaction.deserialize(new Uint8Array(data))

        const signTransaction = await (window as any).solana.signTransaction(tx)
        const signedTx = VersionedTransaction.deserialize(new Uint8Array(signTransaction.serialize()))

        const signature = await (window as any).solana.sendTransaction(signedTx)

        addSwapHistory({
          from: fromToken.symbol,
          to: toToken.symbol,
          amount
        })

        if (amount >= minimumTradeAmount) {
          incrementTrades()
        }

        toast({
          title: 'Swap Successful!',
          description: `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`,
          variant: 'default'
        })

        setFromAmount('')
        setToAmount('')
      } else {
        const errorText = await response.text()
        toast({
          title: 'Swap Failed',
          description: errorText,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Swap error:', error)
      toast({
        title: 'Swap Failed',
        description: 'Failed to execute swap',
        variant: 'destructive'
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const calculateToAmount = (fromAmt: string) => {
    const amt = parseFloat(fromAmt)
    if (!amt || isNaN(amt)) return ''
    return amt.toFixed(6)
  }

  const handleCopyGameWallet = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedGameWallet(address)
    toast({
      title: 'Copied to clipboard',
      description: 'Game wallet address copied successfully',
    })
    setTimeout(() => setCopiedGameWallet(null), 2000)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (fromToken && toToken) {
      setToAmount(calculateToAmount(value))
    }
  }

  const handlePercentageClick = (percent: number) => {
    if (!fromToken) return
    const amount = (fromToken!.balance * percent / 100).toString()
    setFromAmount(amount)
    if (toToken) {
      setToAmount(calculateToAmount(amount))
    }
  }

  const swapTokenOrder = () => {
    if (!fromToken || !toToken) return
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    if (toToken && fromToken) {
      setToAmount(calculateToAmount(toAmount))
    }
  }

  const handleTokenSelect = (token: Token) => {
    if (showTokenSelector === 'from') {
      setFromToken(token)
      if (toToken) {
        setToAmount(calculateToAmount(fromAmount))
      }
    } else {
      setToToken(token)
      if (fromToken) {
        setToAmount(calculateToAmount(fromAmount))
      }
    }
    setShowTokenSelector(null)
    setSearchTerm('')
  }

  const filteredTokens = [SOL_TOKEN, ...splTokens].filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAvatarForAddress = (address: string) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']
    const index = parseInt(address.slice(0, 8), 16) % colors.length
    return colors[index]
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl relative text-center mb-8">
              <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Zap className="w-4 h-4 mr-2" />
                BullRhun Trading Game
              </Badge>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-2">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                  Swap & Play
                </span>
              </h1>
              <p className="text-muted-foreground">
                Trade SOL and SPL tokens to compete for the prize pot!
              </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-center items-start gap-6 max-w-7xl mx-auto">
              <div className="w-full lg:w-auto lg:flex-1 max-w-xl">
                <Card className="border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold">Swap</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSettings(true)}
                          className="hover:bg-primary/10"
                        >
                          <Settings className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                          <RefreshCw className="h-5 w-5 text-primary" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {!connected && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                              Connect Your Wallet
                            </p>
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                              Connect your wallet to start trading tokens
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">You Pay</label>
                        <span className="text-sm text-muted-foreground">
                          {fromToken ? `${fromToken.balance.toLocaleString()} ${fromToken.symbol}` : 'Select token'}
                        </span>
                      </div>
                      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-background hover:border-primary/20 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={fromAmount}
                                onChange={(e) => handleFromAmountChange(e.target.value)}
                                disabled={!connected || isSwapping || !fromToken}
                                className="flex-1 text-3xl font-bold border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                              />
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => setShowTokenSelector('from')}
                              className="flex items-center gap-2 px-4 py-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                              disabled={!connected}
                            >
                              <span className="text-2xl">{fromToken?.icon || '◎'}</span>
                              <div className="text-left">
                                <div className="font-semibold text-sm">{fromToken?.symbol || 'Select'}</div>
                                <div className="text-xs text-muted-foreground">{fromToken?.name || 'Token'}</div>
                              </div>
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </div>

                          {connected && fromToken && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-primary/10">
                              {[
                                { label: '25%', value: 25 },
                                { label: '50%', value: 50 },
                                { label: '75%', value: 75 },
                                { label: 'MAX', value: 100 }
                              ].map((item) => (
                                <Button
                                  key={item.label}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePercentageClick(item.value)}
                                  disabled={isSwapping}
                                  className="flex-1 text-xs font-semibold border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                                >
                                  {item.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex items-center justify-center -my-3 relative z-10">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={swapTokenOrder}
                        disabled={!connected || isSwapping || !fromToken || !toToken}
                        className="h-10 w-10 rounded-full border-2 border-primary/20 bg-background hover:border-primary/40 hover:bg-primary/10 shadow-lg hover:shadow-xl transition-all"
                      >
                        <ArrowDownUp className="h-5 w-5 text-primary" />
                      </Button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">You Receive</label>
                        <span className="text-sm text-muted-foreground">
                          {toToken ? `${toToken.balance.toLocaleString()} ${toToken.symbol}` : 'Select token'}
                        </span>
                      </div>
                      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-background hover:border-primary/20 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="text-3xl font-bold text-primary">
                                {toAmount || '0.00'}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => setShowTokenSelector('to')}
                              className="flex items-center gap-2 px-4 py-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                              disabled={!connected}
                            >
                              <span className="text-2xl">{toToken?.icon || '◎'}</span>
                              <div className="text-left">
                                <div className="font-semibold text-sm">{toToken?.symbol || 'Select'}</div>
                                <div className="text-xs text-muted-foreground">{toToken?.name || 'Token'}</div>
                              </div>
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {fromAmount && toAmount && (
                      <div className="p-4 rounded-xl bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Trading Fee</span>
                          <span className="font-medium">1% (0.05% game wallet + 0.05% platform)</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>Gas Cost</span>
                          <span>~0.00001 SOL</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSwapTokens}
                      disabled={!connected || isSwapping || !fromAmount || !toAmount || !toToken}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                    >
                      {isSwapping ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Swapping...
                        </>
                      ) : (
                        'Swap Tokens'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {(() => {
                  const gameToken = toToken?.mint !== 'native' ? toToken : fromToken?.mint !== 'native' ? fromToken : null
                  if (!gameToken) return null
                  const game = games.find(g => g.token_mint === gameToken.mint && g.status === 'active')
                  if (!game) return null
                  return (
                    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">Game Stats</span>
                          {game.is_bull_mode && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              BULL MODE
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Trades</span>
                              <span className="font-bold text-lg">
                                {game.trade_count} / {game.trade_goal}
                              </span>
                            </div>
                            <Progress value={(game.trade_count / game.trade_goal) * 100} className="h-3" />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Prize Pot</span>
                            <div className="flex items-center gap-2">
                              <Coins className="h-4 w-4 text-green-600" />
                              <span className="font-bold text-xl text-green-600">
                                {(game.game_wallet_balance || 0).toFixed(2)} SOL
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="p-3 rounded-lg bg-background/50">
                              <p className="text-xs text-muted-foreground">Min Trade</p>
                              <p className="font-bold">{game.min_trade_amount} SOL</p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/50">
                              <p className="text-xs text-muted-foreground">Game Wallet</p>
                              <button
                                onClick={() => handleCopyGameWallet(game.game_wallet_address)}
                                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                              >
                                {copiedGameWallet === game.game_wallet_address ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span className="font-bold text-xs">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span className="font-bold text-xs">
                                      {game.game_wallet_address ? `${game.game_wallet_address.slice(0, 6)}...${game.game_wallet_address.slice(-4)}` : 'N/A'}
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}
              </div>

              <div className="w-full lg:w-auto lg:flex-1">
                <Tabs defaultValue="status" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="status">Info</TabsTrigger>
                    <TabsTrigger value="games">Games</TabsTrigger>
                    <TabsTrigger value="winners">Winners</TabsTrigger>
                    <TabsTrigger value="explainer">How?</TabsTrigger>
                  </TabsList>

                  <TabsContent value="status" className="space-y-4">
                    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-purple-500/5 to-accent/5">
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-4">
                            <Flame className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                              24/7 BullRhuns
                            </span>
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Create 24/7 BullRhuns with the BullRhun game to energize your community and bring your charts back to life
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 rounded-xl bg-background/50 text-center border border-primary/10">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Activity className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Active Games</p>
                            </div>
                            <p className="text-2xl font-bold">{games.filter(g => g.status === 'active').length}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-background/50 text-center border border-primary/10">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <p className="text-xs text-muted-foreground">Total Winners</p>
                            </div>
                            <p className="text-2xl font-bold">{winners.length}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-background/50 text-center border border-primary/10">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Coins className="h-4 w-4 text-green-600" />
                                <p className="text-xs text-muted-foreground">Total Prize Pot</p>
                              </div>
                              <p className="text-2xl font-bold text-green-600">
                                {games.filter(g => g.status === 'active').reduce((sum, g) => sum + (g.game_wallet_balance || 0), 0).toFixed(2)} SOL
                              </p>
                            </div>

                          <div className="p-4 rounded-xl bg-background/50 text-center border border-primary/10">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <TrendingUp className="h-4 w-4 text-purple-500" />
                              <p className="text-xs text-muted-foreground">Total Trades</p>
                            </div>
                            <p className="text-2xl font-bold">
                              {games.reduce((sum, g) => sum + g.trade_count, 0)}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200/50 dark:border-yellow-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 rounded-lg bg-yellow-500/20">
                                <Flame className="h-5 w-5 text-yellow-600" />
                              </div>
                              <p className="font-semibold text-sm">Bull Mode Active</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {games.filter(g => g.is_bull_mode && g.status === 'active').length} games with high stakes and bigger prizes
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/50 dark:border-blue-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <p className="font-semibold text-sm">Community Driven</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Every trade contributes to the prize pot and energizes your community
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 rounded-lg bg-purple-500/20">
                                <Clock className="h-5 w-5 text-purple-600" />
                              </div>
                              <p className="font-semibold text-sm">Auto Goal Reduction</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Goals drop by 15 after 5+ minutes of inactivity to keep games moving
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gamepad2 className="h-5 w-5 text-primary" />
                          Quick Start Guide
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              1
                            </div>
                            <div>
                              <p className="font-medium">Create a Game</p>
                              <p className="text-sm text-muted-foreground">
                                Register an SPL token to create a BullRhun game with random settings
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Trade Your Token</p>
                              <p className="text-sm text-muted-foreground">
                                Each trade adds 0.05% to the prize pot and counts towards the goal
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Hit the Goal</p>
                              <p className="text-sm text-muted-foreground">
                                The trader who reaches the goal wins the entire prize pot!
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              4
                            </div>
                            <div>
                              <p className="font-medium">Game Resets</p>
                              <p className="text-sm text-muted-foreground">
                                New random goal, new pot, new champion - endless excitement
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <p className="font-semibold text-sm">Fee Structure</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Each trade incurs a 1% fee: 0.05% goes to the game wallet (prize pot) and 0.05% goes to the platform wallet.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 space-y-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <p className="font-semibold text-sm">Bull Mode Bonus</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Games with goals over 300 trades enter Bull Mode with higher stakes and bigger prizes!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="games" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Registered Tokens</h3>
                      <Button onClick={() => setShowCreateGame(true)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Game
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {games.length === 0 ? (
                        <Card className="border-dashed border-2">
                          <CardContent className="p-8 text-center">
                            <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                              No BullRhun games yet. Create one to get started!
                            </p>
                            <Button onClick={() => setShowCreateGame(true)} variant="outline">
                              Create First Game
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        games
                          .sort((a, b) => (b.game_wallet_balance || 0) - (a.game_wallet_balance || 0))
                          .map((game) => (
                            <Card key={game.id} className="border-primary/10 hover:border-primary/30 transition-colors">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    {game.is_bull_mode && (
                                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        BULL MODE
                                      </Badge>
                                    )}
                                    <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                                      {game.status}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {game.trade_type === 'buys_only' ? 'Buys Only' : 'Buys and Sells'}
                                  </span>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Token</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">{game.token_ticker ? game.token_ticker[0] : '🪙'}</span>
                                      <span className="font-semibold">{game.token_name || 'Token'}</span>
                                      <span className="text-xs text-muted-foreground">({game.token_ticker || 'TOKEN'})</span>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Target className="h-5 w-5 text-primary" />
                                      <span className="text-sm font-semibold">Game Stats</span>
                                    </div>

                                    <div className="space-y-3">
                                      <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                          <span className="text-muted-foreground">Trades</span>
                                          <span className="font-bold text-lg">
                                            {game.trade_count} / {game.trade_goal}
                                          </span>
                                        </div>
                                        <Progress value={(game.trade_count / game.trade_goal) * 100} className="h-3" />
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Prize Pot</span>
                                        <div className="flex items-center gap-2">
                                          <Coins className="h-4 w-4 text-green-600" />
                                          <span className="font-bold text-xl text-green-600">
                                            {(game.game_wallet_balance || 0).toFixed(2)} SOL
                                          </span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="p-3 rounded-lg bg-muted/20">
                                          <p className="text-xs text-muted-foreground">Min Trade</p>
                                          <p className="font-bold">{game.min_trade_amount} SOL</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/20">
                                          <p className="text-xs text-muted-foreground">Game Wallet</p>
                                          <button
                                            onClick={() => handleCopyGameWallet(game.game_wallet_address)}
                                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                                          >
                                            {copiedGameWallet === game.game_wallet_address ? (
                                              <>
                                                <Check className="h-3 w-3" />
                                                <span className="font-bold text-xs">Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-3 w-3" />
                                                <span className="font-bold text-xs">
                                                  {game.game_wallet_address ? `${game.game_wallet_address.slice(0, 6)}...${game.game_wallet_address.slice(-4)}` : 'N/A'}
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="winners" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Hall of Champions
                      </h3>
                      <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                        {winners.length}
                      </Badge>
                    </div>

                    <Card className="border-primary/10">
                      <CardContent className="p-6">
                        {winners.length === 0 ? (
                          <div className="text-center py-8">
                            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              No winners yet. Start trading to become the first champion!
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {winners.map((winner, index) => (
                              <div
                                key={winner.id}
                                className="flex-shrink-0 w-48 p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-200/50 dark:border-yellow-800/50"
                              >
                                <div className="flex items-center justify-center mb-3">
                                  <div className="relative">
                                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gray-400'} flex items-center justify-center`}>
                                      <span className="text-xs font-bold text-white">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800">
                                      <AvatarFallback className={getAvatarForAddress(winner.winner_wallet_address)}>
                                        {winner.winner_wallet_address.slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                </div>

                                <div className="text-center space-y-2">
                                  <div className="flex items-center justify-center gap-1">
                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                    <span className="font-bold text-sm text-yellow-700 dark:text-yellow-400">
                                      {winner.winning_amount.toFixed(3)} SOL
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-lg">{winner.token_ticker || 'TOKEN'}</span>
                                  </div>

                                  <div className="text-xs text-muted-foreground">
                                    {winner.token_name || 'Token'}
                                  </div>

                                  <Separator />

                                  <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-1 text-xs">
                                      <Wallet className="h-3 w-3" />
                                      <span className="font-mono">
                                        {winner.winner_wallet_address.slice(0, 6)}...{winner.winner_wallet_address.slice(-4)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                      <span>Won {new Date(winner.won_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  {winner.payout_tx_id && (
                                    <a
                                      href={`https://solscan.io/tx/${winner.payout_tx_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                                    >
                                      View Transaction
                                      <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="explainer" className="space-y-4">
                    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-purple-500/5 to-accent/5">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Flame className="h-6 w-6 text-primary" />
                          Create 24/7 BullRhuns
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <p className="text-lg font-semibold mb-2">
                            With the BullRhun game
                          </p>
                          <p className="text-muted-foreground">
                            Energize your community, bring your charts back to life
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              1
                            </div>
                            <div>
                              <p className="font-medium">Create a Game</p>
                              <p className="text-sm text-muted-foreground">
                                Register an SPL token to create a BullRhun game with random settings
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Trade and Compete</p>
                              <p className="text-sm text-muted-foreground">
                                Each trade adds 0.05% to the prize pot and counts towards the goal
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Hit the Goal</p>
                              <p className="text-sm text-muted-foreground">
                                The trader who reaches the goal wins the prize pot!
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                              4
                            </div>
                            <div>
                              <p className="font-medium">Game Resets</p>
                              <p className="text-sm text-muted-foreground">
                                New random goal, new pot, new champion - endless excitement
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 space-y-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <p className="font-semibold text-sm">Fee Distribution</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Each trade incurs a 1% fee: 0.05% goes to the game wallet (prize pot) and 0.05% goes to the platform wallet.
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 space-y-2">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-yellow-600" />
                              <p className="font-semibold text-sm">Bull Mode</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Games with goals over 300 trades enter Bull Mode with higher stakes and bigger prizes!
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
        </section>
      </main>

      <Footer />
                <MobileBottomNav />

      <Dialog open={!!showTokenSelector} onOpenChange={() => setShowTokenSelector(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Token</DialogTitle>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-primary/10 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{token.icon}</span>
                  <div>
                    <p className="font-semibold">{token.name}</p>
                    <p className="text-sm text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  {token.mint === 'native' ? (
                    <p className="font-semibold text-xs text-primary">Native</p>
                  ) : (
                    <p className="font-semibold text-xs text-muted-foreground">
                      {token.mint?.slice(0, 6)}...{token.mint?.slice(-4)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Swap Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Slippage Tolerance</label>
              </div>
              <div className="flex gap-2">
                {['0.1', '0.5', '1.0'].map((value) => (
                  <Button
                    key={value}
                    variant={slippage === value ? 'default' : 'outline'}
                    onClick={() => setSlippage(value)}
                    className="flex-1"
                    size="sm"
                  >
                    {value}%
                  </Button>
                ))}
                <Input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  placeholder="Custom"
                  className="w-20 text-center"
                  step="0.1"
                  min="0"
                  max="50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your transaction will revert if the price changes unfavorably by more than this percentage
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Transaction Deadline</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="flex-1"
                  min="1"
                  max="60"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your transaction will revert if it is pending for more than this long
              </p>
            </div>

            <Button onClick={() => setShowSettings(false)} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateGame} onOpenChange={setShowCreateGame}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create BullRhun Game</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Token Mint Address</label>
              <Input
                placeholder="Enter SPL token address..."
                value={newTokenMint}
                onChange={(e) => setNewTokenMint(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Token Name</label>
              <Input
                placeholder="Enter token name..."
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Token Ticker</label>
              <Input
                placeholder="Enter token symbol..."
                value={newTokenTicker}
                onChange={(e) => setNewTokenTicker(e.target.value)}
              />
            </div>

            <div className="p-4 rounded-xl bg-muted/20 space-y-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Game Settings</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Random trade goal (50-1000), trade type (buys only or buys and sells), min trade amount (0.1-10 SOL), and Bull Mode (greater than 3 SOL) will be auto-generated.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGame(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGame}>
              Create Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
