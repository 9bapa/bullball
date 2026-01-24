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
  ArrowDownRight,
  Trophy,
  Sparkles,
  Gamepad2,
  Plus,
  Coins,
  Target,
  Flame,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Activity,
  Copy,
  Check,
  AlertTriangle,
  BarChart,
  Droplet,
  PieChart,
  Globe,
  Share2,
  ExternalLink
} from 'lucide-react'
import { VersionedTransaction, Transaction } from '@solana/web3.js'
import { getTokenBalance } from '@/lib/solana'
import { supabase } from '@/lib/supabase'
import { getDexPairPrice, formatNumber, formatCurrency, formatLargeNumber } from '@/lib/dexscreener'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

declare global {
  interface Window {
    solana: {
      signTransaction: (transaction: Transaction) => Promise<Transaction>
      sendTransaction: (transaction: Transaction, options?: { skipPreflight?: boolean }) => Promise<string>
    }
  }
}

interface Token {
  symbol: string
  name: string
  balance: number
  icon: string
  color: string
  mint?: string
  imageUrl?: string
}

interface Game {
  id: string
  token_mint: string
  token_name: string
  token_ticker: string
  token_description?: string
  token_image_url?: string
  token_supply?: number
  token_decimals?: number
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
  pair_address?: string
  dex_id?: string
  price_usd?: number
  volume_usd?: number
  price_change_24h?: number
  liquidity_usd?: number
  marketcap_usd?: number
  fdv_usd?: number
  websites?: Array<{ url: string }>
  socials?: Array<{ platform: string; handle: string }>
  updated_at?: string
}

interface Trade {
  id: string
  game_id: string
  trader_wallet_address: string
  amount: number
  price_usd?: number
  price_native?: number
  transaction_signature: string
  trade_type: 'buy' | 'sell'
  created_at: string
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
  mint: 'native',
  imageUrl: '/solana_logo.webp'
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
  const [activeTab, setActiveTab] = useState('status')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newTokenMint, setNewTokenMint] = useState('')
  const [startingAmount, setStartingAmount] = useState('')
  const [isCreatingGame, setIsCreatingGame] = useState(false)
  const [copiedAddresses, setCopiedAddresses] = useState<Record<string, boolean>>({})
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [boostAmount, setBoostAmount] = useState('')
  const [isBoosting, setIsBoosting] = useState(false)
  const [selectedGameForBoost, setSelectedGameForBoost] = useState<Game | null>(null)
  const [boosts, setBoosts] = useState<any[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [dexPrice, setDexPrice] = useState<{ priceUsd?: number; volume?: number; priceChange?: number; liquidity?: number }>({})

  useEffect(() => {
    fetchSplTokens()
    fetchGames()
    fetchWinners()

    const gamesSubscription = supabase
      .channel('bullrhun_games_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bullrhun_games' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newGame = payload.new
            setGames(prev => [...prev, newGame])
          } else if (payload.eventType === 'UPDATE') {
            const oldRecord = payload.old
            setGames(prev => prev.map(game => 
              game.id === oldRecord.id ? payload.new : game
            ))
          } else if (payload.eventType === 'DELETE') {
            setGames(prev => prev.filter(game => game.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      gamesSubscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const tradesSubscription = supabase
      .channel('bullrhun_trades_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bullrhun_games_trades' },
        (payload) => {
          const newTrade = payload.new
          if (selectedGame && newTrade.game_id === selectedGame.id) {
            setTrades(prev => [newTrade, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      tradesSubscription.unsubscribe()
    }
  }, [selectedGame])

  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletBalances()
    }
  }, [connected, publicKey])

  const fetchWalletBalances = async () => {
    if (!publicKey) return

    try {
      const response = await fetch('/api/solana/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKey.toString() })
      })
      const data = await response.json()
      const solBalance = data.balance
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
          mint: game.token_mint,
          imageUrl: game.token_image_url || undefined
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
        return data.games
      }
      return null
    } catch (error) {
      console.error('Failed to fetch games:', error)
      return null
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

  const fetchTrades = async (gameId: string) => {
    try {
      const response = await fetch(`/api/bullrhun/trades?game_id=${gameId}`)
      const data = await response.json()
      if (data.trades) {
        setTrades(data.trades)
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    }
  }

  const fetchDexPrice = async (pairId: string) => {
    try {
      const pairs = await getDexPairPrice(pairId)
      if (pairs && pairs.length > 0) {
        const pair = pairs[0]
        setDexPrice({
          priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : undefined,
          volume: pair.volume?.h24,
          priceChange: pair.priceChange?.h24,
          liquidity: pair.liquidity?.usd,
        })
      }
    } catch (error) {
      console.error('Failed to fetch DexScreener price:', error)
    }
  }

  const refreshGame = async (gameId: string) => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/bullrhun/games?mint=${games.find(g => g.id === gameId)?.token_mint}`)
      const data = await response.json()
      if (data.games && data.games.length > 0) {
        setGames(prev => prev.map(g => g.id === gameId ? data.games[0] : g))
        toast({
          title: 'Game Refreshed',
          description: 'Game data updated successfully',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Refresh Failed',
          description: 'Failed to refresh game data',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to refresh game:', error)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh game data',
        variant: 'destructive'
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const refreshAllGames = async () => {
    setIsRefreshing(true)
    try {
      await fetchGames()
      toast({
        title: 'Games Refreshed',
        description: 'All games data updated successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to refresh games:', error)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh games data',
        variant: 'destructive'
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchBoosts = async (gameId: string) => {
    try {
      const response = await fetch(`/api/bullrhun/boosts?game_id=${gameId}`)
      const data = await response.json()
      if (data.boosts) {
        setBoosts(data.boosts)
      }
    } catch (error) {
      console.error('Failed to fetch boosts:', error)
    }
  }

  const handleBoost = (game: Game) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to boost this game',
        variant: 'destructive'
      })
      return
    }
    setSelectedGameForBoost(game)
    setBoostAmount('')
    setShowBoostModal(true)
    fetchBoosts(game.id)
    fetchTrades(game.id)
    if (game.pair_address) {
      fetchDexPrice(game.pair_address)
    }
  }

  const handleConfirmBoost = async () => {
    if (!selectedGameForBoost || !connected || !publicKey) return

    const amount = parseFloat(boostAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      })
      return
    }

    if (amount < 0.01) {
      toast({
        title: 'Minimum Amount',
        description: 'Minimum boost amount is 0.01 SOL',
        variant: 'destructive'
      })
      return
    }

    setIsBoosting(true)

    try {
      const balanceResponse = await fetch('/api/solana/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKey.toString() })
      })
      const balanceData = await balanceResponse.json()
      const solBalance = balanceData.balance
      if (solBalance < amount) {
        toast({
          title: 'Insufficient Balance',
          description: `You need at least ${amount} SOL to boost`,
          variant: 'destructive'
        })
        return
      }

      const boostResponse = await fetch('/api/bullrhun/boosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGameForBoost.id,
          amount: amount,
          userPublicKey: publicKey.toString()
        })
      })

      const boostData = await boostResponse.json()

      if (boostData.transaction) {
        try {
          const transactionBuffer = Buffer.from(boostData.transaction, 'base64')
          const transaction = Transaction.from(transactionBuffer)

          const { signTransaction, sendTransaction } = window.solana

          if (!signTransaction || !sendTransaction) {
            throw new Error('Wallet not connected')
          }

          const signedTransaction = await signTransaction(transaction)
          const signature = await sendTransaction(signedTransaction)

          toast({
            title: 'Boost Sent!',
            description: `Transaction sent. Boosting ${amount} SOL to the prize pot!`,
            variant: 'default'
          })

          setShowBoostModal(false)
          setBoostAmount('')
          refreshGame(selectedGameForBoost.id)
        } catch (txError) {
          console.error('Failed to send transaction:', txError)
          toast({
            title: 'Transaction Failed',
            description: 'Boost failed. Please try again.',
            variant: 'destructive'
          })
        }
      } else {
        const errorMessage = boostData.error || 'Failed to create boost'
        toast({
          title: 'Boost Failed',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to boost:', error)
      toast({
        title: 'Boost Failed',
        description: 'Failed to create boost',
        variant: 'destructive'
      })
    } finally {
      setIsBoosting(false)
    }
  }

  const handleCreateGame = async () => {
    if (!newTokenMint) {
      toast({
        title: 'Error',
        description: 'Please enter a token mint address',
        variant: 'destructive'
      })
      return
    }

    const startingAmountNum = startingAmount ? parseFloat(startingAmount) : 0

    if (startingAmountNum > 0) {
      if (!connected || !publicKey) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet to deposit SOL',
          variant: 'destructive'
        })
        return
      }

      if (isNaN(startingAmountNum) || startingAmountNum <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid starting amount',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch('/api/solana/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKey.toString() })
      })
      const data = await response.json()
      const solBalance = data.balance
      if (solBalance < startingAmountNum) {
        toast({
          title: 'Insufficient Balance',
          description: `You need at least ${startingAmountNum} SOL to create this game`,
          variant: 'destructive'
        })
        return
      }
    }

    setIsCreatingGame(true)

    try {
      const response = await fetch('/api/bullrhun/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenMint: newTokenMint,
          startingAmount: startingAmountNum,
          userPublicKey: publicKey?.toString()
        })
      })

      const data = await response.json()

      if (data.game) {
        if (data.transaction) {
          try {
            const transactionBuffer = Buffer.from(data.transaction, 'base64')
            const transaction = Transaction.from(transactionBuffer)

            const { signTransaction, sendTransaction } = window.solana

            if (!signTransaction || !sendTransaction) {
              throw new Error('Wallet not connected')
            }

            const signedTransaction = await signTransaction(transaction)
            const signature = await sendTransaction(signedTransaction)

            toast({
              title: 'Transaction Sent',
              description: `SOL transfer initiated. Waiting for confirmation...`,
              variant: 'default'
            })
          } catch (txError) {
            console.error('Failed to send transaction:', txError)
            toast({
              title: 'Transaction Failed',
              description: 'Game created but SOL transfer failed. Please try again.',
              variant: 'destructive'
            })
          }
        }

        toast({
          title: 'Game Created!',
          description: `BullRhun game for ${data.game.tokenName} (${data.game.tokenTicker}) created successfully${startingAmountNum > 0 ? ` with ${startingAmountNum} SOL starting amount` : ''}`,
          variant: 'default'
        })
        setShowCreateGame(false)
        setNewTokenMint('')
        setStartingAmount('')
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
    } finally {
      setIsCreatingGame(false)
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

        const gameDetails = games.find(g => g.token_mint === mint)
        if (gameDetails) {
          try {
            const price = gameDetails.price_usd || null
            const priceNative = parseFloat(fromAmount) / parseFloat(toAmount)
            
            await fetch('/api/bullrhun/trades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gameId: gameDetails.id,
                traderWalletAddress: publicKey?.toString(),
                amount: parseFloat(fromAmount),
                priceUsd: price,
                priceNative: priceNative,
                transactionSignature: signature,
                tradeType: action
              })
            })
          } catch (tradeError) {
            console.error('Failed to record trade:', tradeError)
          }
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
    setCopiedAddresses(prev => ({ ...prev, [address]: true }))
    toast({
      title: 'Copied to clipboard',
      description: 'Game wallet address copied successfully',
    })
    setTimeout(() => {
      setCopiedAddresses(prev => {
        const newState = { ...prev }
        delete newState[address]
        return newState
      })
    }, 2000)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (fromToken && toToken) {
      setToAmount(calculateToAmount(value))
      if (activeTab === 'status') {
        setActiveTab('games')
      }
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

  const handleTokenSelect = async (token: Token) => {
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
    
    const gameDetails = games.find(g => g.token_mint === token.mint)
    if (gameDetails) {
      if (!gameDetails.pair_address) {
        try {
          await fetch(`/api/bullrhun/games/${gameDetails.id}/dex-update`, {
            method: 'POST'
          })
          await fetchGames()
        } catch (error) {
          console.error('Failed to fetch DexScreener data:', error)
        }
      }
      fetchTrades(gameDetails.id)
      if (gameDetails.pair_address) {
        fetchDexPrice(gameDetails.pair_address)
      }
      setActiveTab('trades')
    } else {
      setActiveTab('games')
    }
  }

  const handleTradeNow = async (game: Game) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      })
      return
    }

    let gameToken = splTokens.find(t => t.mint === game.token_mint)

    if (!gameToken) {
      gameToken = {
        symbol: game.token_ticker,
        name: game.token_name,
        balance: 0,
        icon: game.token_image_url || '',
        color: 'bg-primary',
        mint: game.token_mint,
        imageUrl: game.token_image_url
      }
    }

    setFromToken(SOL_TOKEN)
    setToToken(gameToken)
    setFromAmount('')
    setToAmount('')
    
    let updatedGame = game
    
    if (!game.pair_address) {
      console.log(`Fetching DexScreener data for game ${game.id} with token mint: ${game.token_mint}`)
      try {
        const dexUpdateResponse = await fetch(`/api/bullrhun/games/${game.id}/dex-update`, {
            method: 'POST'
          })
        const dexUpdateData = await dexUpdateResponse.json()
        
        console.log('DexScreener response:', dexUpdateData)
        
        if (dexUpdateData.error) {
          console.warn(`DexScreener error for ${game.token_ticker}:`, dexUpdateData.error)
          toast({
            title: 'DexScreener Data Not Available',
            description: `No trading pair found for ${game.token_ticker}. This token may not have any liquidity on Solana yet.`,
          })
        } else if (dexUpdateData.game) {
          updatedGame = dexUpdateData.game
          console.log(`Updated game ${game.id} with pair address: ${updatedGame.pair_address}`)
          
          setGames(prevGames => prevGames.map(g => 
            g.id === updatedGame.id ? { ...g, ...updatedGame } : g
          ))
        }
      } catch (error) {
        console.error('Failed to fetch DexScreener data:', error)
        toast({
          title: 'DexScreener Error',
          description: 'Failed to fetch trading pair data. Please try again.',
          variant: 'destructive',
        })
      }
    } else {
      console.log(`Game ${game.id} already has pair address: ${game.pair_address}`)
    }
    
    fetchTrades(updatedGame.id)
    if (updatedGame.pair_address) {
      fetchDexPrice(updatedGame.pair_address)
    } else {
      console.log(`No pair address available for ${game.token_ticker}, cannot fetch price`)
    }
    
    setActiveTab('games')
    toast({
      title: 'Swap Ready',
      description: updatedGame.pair_address 
        ? `Swap SOL for ${gameToken.symbol} to trade in game`
        : `${gameToken.symbol} has no trading pair yet. Check back later.`,
    })
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
                  Swap & Win
                </span>
              </h1>
              <p className="text-muted-foreground">
                xth trade wins the pot
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
                          {fromToken ? `${fromToken.balance?.toLocaleString() ?? '0'} ${fromToken.symbol}` : 'Select token'}
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
                              {fromToken?.imageUrl ? (
                                <img
                                  src={fromToken.imageUrl}
                                  alt={fromToken.symbol}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = ''
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <span className="text-2xl">{fromToken?.icon || '◎'}</span>
                              )}
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
                              {toToken?.imageUrl ? (
                                <img
                                  src={toToken.imageUrl}
                                  alt={toToken.symbol}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = ''
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <span className="text-2xl">{toToken?.icon || '◎'}</span>
                              )}
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
              </div>

              <div className="w-full lg:w-auto lg:flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="status">Info</TabsTrigger>
                    <TabsTrigger value="games">Status</TabsTrigger>
                    <TabsTrigger value="trades">Trades</TabsTrigger>
                    <TabsTrigger value="winners">Winners</TabsTrigger>
                    <TabsTrigger value="explainer">How?</TabsTrigger>
                  </TabsList>

                  <TabsContent value="status" className="space-y-4">
                    {!toToken ? (
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
                    ) : (
                      (() => {
                        const gameDetails = games.find(g => g.token_mint === toToken.mint)
                        
                        if (!gameDetails || !gameDetails.pair_address) {
                          return (
                            <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-purple-500/5 to-accent/5">
                              <CardContent className="p-6">
                                <div className="text-center">
                                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-4">
                                    <Flame className="h-8 w-8 text-white" />
                                  </div>
                                  <h3 className="text-xl font-bold mb-2">No Pricing Data Available</h3>
                                  <p className="text-muted-foreground max-w-md mx-auto">
                                    Pricing data will be displayed here once available for this token.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        }

                        const priceChange = gameDetails.price_change_24h || 0
                        const isPositive = priceChange >= 0

                        return (
                          <Card className="border-primary/10">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <Coins className="h-6 w-6 text-primary" />
                                  Token Pricing
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {gameDetails.dex_id?.toUpperCase() || 'DEX'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                  <CardHeader>
                                    <CardTitle className="text-base">Current Price</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-primary mb-1">
                                          {formatCurrency(gameDetails.price_usd ?? 0)}
                                        </p>
                                      <p className="text-sm text-muted-foreground">
                                        {dexPrice && dexPrice.priceUsd ? `${Number(dexPrice.priceUsd).toFixed(6)} SOL` : 'Loading...'}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className={`bg-gradient-to-br ${isPositive ? 'from-green-500/10 to-green-600/5' : 'from-red-500/10 to-red-600/5'} border ${isPositive ? 'border-green-200/50 dark:border-green-800/50' : 'border-red-200/50 dark:border-red-800/50'}`}>
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      24h Change
                                      {isPositive ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center">
                                      <p className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/50 dark:border-blue-800/50">
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <BarChart className="h-5 w-5 text-blue-600" />
                                      24h Volume
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center">
                                      <p className="text-3xl font-bold text-blue-600">
                                        {formatLargeNumber(gameDetails.volume_usd ?? 0)}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50">
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <Droplet className="h-5 w-5 text-purple-600" />
                                      Liquidity
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center">
                                      <p className="text-3xl font-bold text-purple-600">
                                        {formatLargeNumber(gameDetails.liquidity_usd || 0)}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-800/50">
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <PieChart className="h-5 w-5 text-amber-600" />
                                      Market Cap
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center">
                                      <p className="text-3xl font-bold text-amber-600">
                                        {formatLargeNumber(gameDetails.marketcap_usd || 0)}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/50">
                                  <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <Target className="h-5 w-5 text-emerald-600" />
                                      FDV
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center">
                                      <p className="text-3xl font-bold text-emerald-600">
                                        {formatLargeNumber(gameDetails.fdv_usd || 0)}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {gameDetails.websites && gameDetails.websites.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    Websites
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {gameDetails.websites.map((website, idx) => (
                                      <a
                                        key={idx}
                                        href={website.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-sm hover:bg-primary/20 transition-colors flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        Website
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {gameDetails.socials && gameDetails.socials.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Share2 className="h-4 w-4 text-primary" />
                                    Social Links
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {gameDetails.socials.map((social, idx) => (
                                      <a
                                        key={idx}
                                        href={`https://twitter.com/${social.handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-sm hover:bg-primary/20 transition-colors flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        {social.platform}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {gameDetails.pair_address && (
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-primary/10">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Pair Address:</span>
                                    <code className="text-xs bg-background px-2 py-1 rounded">
                                      {gameDetails.pair_address.slice(0, 8)}...{gameDetails.pair_address.slice(-8)}
                                    </code>
                                  </div>
                                  <a
                                    href={`https://dexscreener.com/solana/${gameDetails.pair_address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    View on DexScreener
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })()
                    )}
                  </TabsContent>

                  <TabsContent value="games" className="space-y-4">
                    {!toToken ? (
                      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-purple-500/5 to-accent/5">
                        <CardContent className="p-12 text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-6">
                            <Target className="h-10 w-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3">
                            Select a Token to View Stats
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Choose a token from the swap form to see its game statistics, prize pot, and trading progress.
                          </p>
                          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/20">
                            <ChevronDown className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-primary">Select a token above to get started</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      (() => {
                        const gameDetails = games.find(g => g.token_mint === toToken.mint)
                        
                        if (!gameDetails) {
                          return (
                            <Card className="border-dashed border-2">
                              <CardContent className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
                                  <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No Game Found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  This token is not currently registered in a BullRhun game.
                                </p>
                                <Button onClick={() => setShowCreateGame(true)} variant="outline">
                                  Create Game
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        }

                        return (
                          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  {gameDetails.is_bull_mode && (
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      BULL MODE
                                    </Badge>
                                  )}
                                  <Badge variant={gameDetails.status === 'active' ? 'default' : 'secondary'}>
                                    {gameDetails.status}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {gameDetails.trade_type === 'buys_only' ? 'Buys Only' : 'Buys and Sells'}
                                </span>
                              </div>

                              <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                  <div className="flex items-center gap-3">
                                    {gameDetails.token_image_url ? (
                                      <img
                                        src={gameDetails.token_image_url}
                                        alt={gameDetails.token_name || 'Token'}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                                        onError={(e) => {
                                          e.currentTarget.src = ''
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl">
                                        {gameDetails.token_ticker ? gameDetails.token_ticker[0] : '🪙'}
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-bold text-lg">{gameDetails.token_name || 'Token'}</h4>
                                      <p className="text-sm text-muted-foreground">{gameDetails.token_ticker || 'TOKEN'}</p>
                                    </div>
                                  </div>
                                  <Button onClick={() => handleBoost(gameDetails)} size="lg" className="gap-2">
                                    <Flame className="h-5 w-5" />
                                    Boost
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                    <CardHeader>
                                      <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-base">Game Progress</CardTitle>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                          <span className="text-muted-foreground">Trades Progress</span>
                                          <span className="font-bold text-lg">
                                            {gameDetails.trade_count} / {gameDetails.trade_goal}
                                          </span>
                                        </div>
                                        <Progress value={(gameDetails.trade_count / gameDetails.trade_goal) * 100} className="h-3" />
                                      </div>
                                      <div className="p-3 rounded-lg bg-background/50">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Trade Type</span>
                                          <Badge variant="outline" className="text-xs">
                                            {gameDetails.trade_type === 'buys_only' ? 'Buys Only' : 'Buys and Sells'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-200/50 dark:border-green-800/50">
                                    <CardHeader>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Coins className="h-5 w-5 text-green-600" />
                                          <CardTitle className="text-base">Prize Pot</CardTitle>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => refreshGame(gameDetails.id)}
                                          disabled={isRefreshing}
                                          className="h-8 w-8 hover:bg-green-500/20"
                                          title="Refresh game data"
                                        >
                                          <RefreshCw className={`h-4 w-4 text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="text-center py-4">
                                        <p className="text-4xl font-bold text-green-600">
                                          {(gameDetails.game_wallet_balance || 0).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">SOL</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-background/50 text-center">
                                          <p className="text-xs text-muted-foreground mb-1">Min Trade</p>
                                          <p className="font-bold text-lg">{gameDetails.min_trade_amount} SOL</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background/50">
                                          <p className="text-xs text-muted-foreground mb-1">Game Wallet</p>
                                          <button
                                            onClick={() => handleCopyGameWallet(gameDetails.game_wallet_address)}
                                            className="w-full flex items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
                                          >
                                            {copiedAddresses[gameDetails.game_wallet_address] ? (
                                              <>
                                                <Check className="h-3 w-3" />
                                                <span className="font-bold text-xs">Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-3 w-3" />
                                                <span className="font-bold text-xs">
                                                  {gameDetails.game_wallet_address ? `${gameDetails.game_wallet_address.slice(0, 6)}...${gameDetails.game_wallet_address.slice(-4)}` : 'N/A'}
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {gameDetails.token_description && (
                                  <Card className="bg-muted/20 border border-primary/10">
                                    <CardContent className="p-4">
                                      <p className="text-sm text-muted-foreground line-clamp-3">
                                        {gameDetails.token_description}
                                      </p>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()
                    )}
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

                  <TabsContent value="trades" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Trade History
                      </h3>
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        {trades.length}
                      </Badge>
                    </div>

                    <Card className="border-primary/10">
                      <CardContent className="p-0">
                        {trades.length === 0 ? (
                          <div className="text-center py-12 px-6">
                            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Trades Yet</h3>
                            <p className="text-sm text-muted-foreground">
                              Start trading to see your trade history here!
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-primary/10 bg-gradient-to-r from-primary/5 via-purple-500/5 to-accent/5">
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Time
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Trader
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Type
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Amount (SOL)
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Price (USD)
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    TX Signature
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {trades.map((trade, index) => (
                                  <tr
                                    key={trade.id}
                                    className={`border-b border-primary/5 hover:bg-muted/30 transition-colors ${
                                      index === trades.length - 1 ? 'border-b-0' : ''
                                    }`}
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(trade.created_at).toLocaleString()}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="font-mono text-xs font-medium text-primary hover:underline cursor-pointer" title={trade.trader_wallet_address}>
                                        {trade.trader_wallet_address.slice(0, 6)}...{trade.trader_wallet_address.slice(-4)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs font-medium ${
                                          trade.trade_type === 'buy'
                                            ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
                                            : 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400'
                                        }`}
                                      >
                                        <span className="flex items-center gap-1">
                                          {trade.trade_type === 'buy' ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                          ) : (
                                            <ArrowDownRight className="h-3 w-3" />
                                          )}
                                          {trade.trade_type.toUpperCase()}
                                        </span>
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <span className="font-mono text-sm font-semibold">
                                        {formatNumber(trade.amount, 6)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      {trade.price_usd ? (
                                        <span className="font-mono text-sm text-muted-foreground">
                                          ${formatNumber(trade.price_usd, 6)}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      {trade.transaction_signature ? (
                                        <a
                                          href={`https://solscan.io/tx/${trade.transaction_signature}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          <span className="font-mono">
                                            {trade.transaction_signature.slice(0, 8)}...{trade.transaction_signature.slice(-8)}
                                          </span>
                                        </a>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">N/A</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Active Games</h2>
              </div>
              <Button onClick={() => setShowCreateGame(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Game
              </Button>
            </div>

            {games.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No BullRhun Games Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create one to get started and energize your community!
                  </p>
                  <Button onClick={() => setShowCreateGame(true)} size="lg">
                    Create First Game
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games
                  .sort((a, b) => (b.game_wallet_balance || 0) - (a.game_wallet_balance || 0))
                  .map((game) => (
                    <Card key={game.id} className="border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            {game.is_bull_mode && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                <Sparkles className="h-3 w-3 mr-1" />
                                BULL MODE
                              </Badge>
                            )}
                            <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                              {game.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {game.trade_type === 'buys_only' ? 'Buys Only' : 'Buys & Sells'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="text-center">
                          {game.token_image_url ? (
                            <img
                              src={game.token_image_url}
                              alt={game.token_name || 'Token'}
                              className="w-16 h-16 mx-auto mb-3 rounded-full object-cover border-2 border-primary/20"
                              onError={(e) => {
                                e.currentTarget.src = ''
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="text-4xl mb-3">{game.token_ticker ? game.token_ticker[0] : '🪙'}</div>
                          )}
                          <h3 className="font-bold text-lg">{game.token_name || 'Token'}</h3>
                          <p className="text-sm text-muted-foreground">({game.token_ticker || 'TOKEN'})</p>

                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Trades Progress</span>
                              <span className="font-bold">
                                {game.trade_count} / {game.trade_goal}
                              </span>
                            </div>
                            <Progress value={(game.trade_count / game.trade_goal) * 100} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 rounded-lg bg-muted/20">
                              <p className="text-xs text-muted-foreground mb-1">Prize Pot</p>
                              <p className="font-bold text-lg text-green-600">
                                {(game.game_wallet_balance || 0).toFixed(2)} SOL
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/20">
                              <p className="text-xs text-muted-foreground mb-1">Min Trade</p>
                              <p className="font-bold text-lg">{game.min_trade_amount} SOL</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-2">Token Address</p>
                            <button
                              onClick={() => handleCopyGameWallet(game.token_mint)}
                              className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors"
                            >
                              {copiedAddresses[game.token_mint] ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span className="font-bold text-sm">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span className="font-bold text-sm font-mono">
                                    {game.token_mint 
                                      ? `${game.token_mint.slice(0, 6)}...${game.token_mint.slice(-4)}`
                                      : 'N/A'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-2">Game Wallet</p>
                            <button
                              onClick={() => handleCopyGameWallet(game.game_wallet_address)}
                              className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors"
                            >
                              {copiedAddresses[game.game_wallet_address] ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span className="font-bold text-sm">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span className="font-bold text-sm font-mono">
                                    {game.game_wallet_address 
                                      ? `${game.game_wallet_address.slice(0, 6)}...${game.game_wallet_address.slice(-4)}`
                                      : 'N/A'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {game.status === 'active' && (
                          <Button 
                            className="w-full" 
                            onClick={() => handleTradeNow(game)}
                          >
                            Trade Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
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
                  {token.imageUrl ? (
                    <img
                      src={token.imageUrl}
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                      onError={(e) => {
                        e.currentTarget.src = ''
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{token.icon}</span>
                  )}
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

      <Dialog open={showBoostModal} onOpenChange={setShowBoostModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                Boost Game
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedGameForBoost && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {selectedGameForBoost.token_ticker?.slice(0, 2) || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{selectedGameForBoost.token_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Prize Pot: {(selectedGameForBoost.game_wallet_balance || 0).toFixed(2)} SOL
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Boost Amount (SOL)</label>
              <Input
                type="number"
                placeholder="Enter amount to boost..."
                value={boostAmount}
                onChange={(e) => setBoostAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: 0.01 SOL
              </p>
            </div>

            {connected && publicKey && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-muted-foreground">
                  Your Balance: <span className="font-semibold text-green-600">{fromToken?.balance?.toFixed(4) || 'Loading...'} SOL</span>
                </p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Warning: This SOL will be transferred from your wallet to game wallet and is <strong>non-refundable</strong>. It will be added to prize pot.
              </p>
            </div>

            {boosts.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3">Recent Boosts</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {boosts.slice(0, 5).map((boost) => (
                    <div key={boost.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/20">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">
                          {boost.user_wallet_address.slice(0, 6)}...{boost.user_wallet_address.slice(-4)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{boost.amount} SOL</p>
                        <p className="text-muted-foreground">
                          {new Date(boost.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoostModal(false)} disabled={isBoosting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBoost} disabled={isBoosting || !boostAmount || parseFloat(boostAmount) < 0.01}>
              {isBoosting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Boosting...
                </>
              ) : (
                `Boost ${boostAmount || '0'} SOL`
              )}
            </Button>
          </DialogFooter>
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
              <p className="text-xs text-muted-foreground mt-1">
                Token name, ticker, and image will be fetched automatically from the Solana blockchain
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Starting Amount (SOL)</label>
              <Input
                type="number"
                placeholder="Optional - Enter starting SOL amount..."
                value={startingAmount}
                onChange={(e) => setStartingAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="flex items-start gap-2 mt-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Warning: This SOL will be transferred from your wallet to the game wallet and is <strong>non-refundable</strong>. It will stay in the game wallet until a winner is declared.
                </p>
              </div>
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
            <Button variant="outline" onClick={() => setShowCreateGame(false)} disabled={isCreatingGame}>
              Cancel
            </Button>
            <Button onClick={handleCreateGame} disabled={isCreatingGame}>
              {isCreatingGame ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                'Create Game'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
