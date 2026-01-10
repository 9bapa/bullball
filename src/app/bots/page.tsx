'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Power,
  Terminal,
  Cpu,
  Wifi,
  WifiOff,
  Plus,
  TrendingUp,
  Eye,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Users,
  Globe,
  ExternalLink,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { useUserContext } from '@/context/userContext'
import { BotConfigModal, BotStats } from '@/components/bots/BotManagement'
import { BotMonitoring } from '@/components/bots/BotMonitoring'
import { DatabaseService, type TokenData, type MigrationData } from '@/services/database.service'
// WebSocket is built into browser

interface BotStatus {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error' | 'maintenance' | 'migrated'
  last_heartbeat: string
  trades_processed: number
  cpu_usage: number
  memory_usage: number
  uptime: string
  connected: boolean
  token_address?: string
  account_address?: string
  type: 'trader' | 'monitor' | 'analyzer'
  migrated_tokens?: string[]
  last_migration?: string
}

interface PageBotConfig {
  id: string
  name: string
  type: 'trader' | 'monitor' | 'analyzer'
  config: {
    trade_amount: number
    max_trades: number
    interval: number
    token_address?: string
    account_address?: string
    strategy: 'aggressive' | 'conservative' | 'balanced'
  }
  enabled: boolean
}



export default function BotPage() {
  const { connected, publicKey, isAdmin, dbUser } = useUserContext()
  const [bots, setBots] = useState<BotStatus[]>([])
  const [configs, setConfigs] = useState<PageBotConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingBot, setEditingBot] = useState<PageBotConfig | null>(null)
  const [subscribedTokens, setSubscribedTokens] = useState<string[]>([])
  const [subscribedAccounts, setSubscribedAccounts] = useState<string[]>([])
  const [newToken, setNewToken] = useState('')
  const [newAccount, setNewAccount] = useState('')
  const [migrationHistory, setMigrationHistory] = useState<MigrationData[]>([])
  const [migratedTokens, setMigratedTokens] = useState<string[]>([])
  const [showMigrationFeed, setShowMigrationFeed] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'just-launched' | 'in-progress' | 'migrated'>('all')
  const [isDemoMode, setIsDemoMode] = useState(false) // Start with real mode
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [dbService] = useState(new DatabaseService())

  useEffect(() => {
    if (!connected) return
    
    fetchBotStatus()
    const interval = setInterval(fetchBotStatus, 5000) // Update every 5 seconds
    
    // Fetch tokens from database
    if (!isDemoMode) {
      dbService.getTokens(100).then(tokens => {
        console.log('📊 Loaded tokens from database:', tokens.length)
        setTokenData(tokens)
      }).catch(error => {
        console.error('❌ Error loading tokens from database:', error)
        setTokenData([])
      })
    }
    
    // Set up real WebSocket connection
    if (!isDemoMode) {
      console.log('🔌 Connecting to PumpPortal WebSocket...')
      
      const websocket = new (window as any).WebSocket('wss://pumpportal.fun/api/data')
      
      websocket.onopen = function open() {
        console.log('✅ Connected to PumpPortal WebSocket')
        
        // Subscribing to token creation events
        const newTokenPayload: any = { 
          method: "subscribeNewToken", 
        } 
        websocket.send(JSON.stringify(newTokenPayload))
        
        // Subscribing to migration events
        const migrationPayload: any = { 
          method: "subscribeMigration", 
        } 
        websocket.send(JSON.stringify(migrationPayload))
        
        // Subscribing to trades made by accounts
        const accountPayload: any = { 
          method: "subscribeAccountTrade", 
          keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
        } 
        websocket.send(JSON.stringify(accountPayload))
        
        // Subscribing to trades on tokens
        const tokenPayload: any = { 
          method: "subscribeTokenTrade", 
          keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
        } 
        websocket.send(JSON.stringify(tokenPayload))
      }
      
      websocket.onmessage = function message(data) {
        try {
          const parsedData = JSON.parse(data.data.toString())
          console.log('📡 WebSocket message received:', parsedData)
          handleRealtimeData(parsedData)
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }
      
      websocket.onerror = function error(error) {
        console.error('🔥 WebSocket error:', error)
      }
      
      websocket.onclose = function close(event) {
        console.log('❌ WebSocket disconnected:', event.code, event.reason)
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!isDemoMode) {
            console.log('🔄 Attempting to reconnect...')
            setWs(new WebSocket('wss://pumpportal.fun/api/data'))
          }
        }, 5000)
      }
      
      setWs(websocket)
      
      return () => {
        if (websocket) {
          websocket.close()
        }
        clearInterval(interval)
      }
    }
    
    return () => {
      clearInterval(interval)
    }
  }, [connected, isDemoMode])

  const handleRealtimeData = (data: any) => {
    switch (data.type) {
      case 'newToken':
        console.log('New token created:', data.token)
        processNewToken(data.token)
        break
      case 'trade':
        updateBotWithTrade(data)
        updateTokenPrice(data)
        break
      case 'migration':
        console.log('Token migrated:', data.token)
        processMigrationEvent(data)
        break
    }
  }

  const processNewToken = async (token: any) => {
    const newToken: TokenData = {
      address: token.mint || token.address,
      name: token.name || 'Unknown Token',
      symbol: token.symbol || 'UNK',
      image: token.imageUrl,
      creator: token.traderPublicKey || token.creator || 'Unknown',
      creatorTokenCount: 1, // Will be updated with real data
      marketCapSol: token.marketCapSol || 0,
      initialBuy: token.initialBuy || 0,
      currentPrice: token.price || 0.00001,
      priceChange24h: 0, // Will be updated with real trades
      volume24h: 0, // Will be updated with real trades
      holders: 0, // Will be updated with real data
      status: 'just-launched',
      launchedAt: token.timestamp || new Date().toISOString(),
      description: token.description,
      twitterUrl: token.twitterUrl,
      websiteUrl: token.websiteUrl,
      isMayhemMode: token.isMayhemMode || false
    }
    
    // Save to database
    await dbService.createToken(newToken)
    
    // Update local state
    setTokenData(prev => [newToken, ...prev.slice(0, 99)]) // Keep latest 100 tokens
  }

  const updateTokenPrice = async (tradeData: any) => {
    setTokenData(prev => prev.map(token => {
      if (token.address === tradeData.tokenAddress) {
        const newPrice = tradeData.price || token.currentPrice
        const priceChange = ((newPrice - token.currentPrice) / token.currentPrice) * 100
        
        const updatedToken = {
          ...token,
          currentPrice: newPrice,
          priceChange24h: token.priceChange24h + priceChange / 24,
          volume24h: token.volume24h + (tradeData.amount || 0),
          status: 'in-progress' as const
        }
        
        // Save to database
        dbService.updateToken(token.address, {
          currentPrice: newPrice,
          priceChange24h: updatedToken.priceChange24h,
          volume24h: updatedToken.volume24h,
          status: 'in-progress'
        })
        
        return updatedToken
      }
      return token
    }))
  }

  const processMigrationEvent = async (migrationData: any) => {
    // Create migration object for display
    const migration: any = {
      tokenAddress: migrationData.tokenAddress,
      fromPlatform: migrationData.fromPlatform || 'PumpPortal',
      toPlatform: migrationData.toPlatform || 'PumpSwap',
      timestamp: migrationData.timestamp || new Date().toISOString(),
      reason: migrationData.reason || 'Platform migration'
    }
    
    // Save to database
    await dbService.createMigration({
      from_platform: migration.fromPlatform || 'PumpPortal',
      to_platform: migration.toPlatform || 'PumpSwap',
      token_address: migrationData.token_address || migrationData.tokenAddress,
      timestamp: migrationData.timestamp || new Date().toISOString(),
      migration_id: migrationData.migrationId || 'migration_' + Date.now()
    })
    
    // Update local state
    setMigrationHistory(prev => [migration, ...prev])
    setMigratedTokens(prev => [...new Set([...prev, migrationData.token_address || migrationData.tokenAddress || ''])])
    
    // Update token status in database and local state
    if (migrationData.tokenAddress) {
      await dbService.updateToken(migrationData.tokenAddress, {
        status: 'migrated'
      })
    }
    
    // Update bot status for migrated token
    setBots(prev => prev.map(bot => {
      if (bot.token_address === migrationData.tokenAddress) {
        return {
          ...bot,
          status: 'migrated',
          last_heartbeat: new Date().toISOString(),
          migrated_tokens: [...(bot.migrated_tokens || []), migrationData.tokenAddress]
        }
      }
      return bot
    }))
  }

  const updateBotWithTrade = (tradeData: any) => {
    setBots(prev => prev.map(bot => {
      if (bot.token_address === tradeData.tokenAddress || bot.account_address === tradeData.account) {
        return {
          ...bot,
          trades_processed: bot.trades_processed + 1,
          last_heartbeat: new Date().toISOString()
        }
      }
      return bot
    }))
  }

  const handleTokenMigration = (migrationData: any) => {
    // Update bot status if monitoring migrated token
    setBots(prev => prev.map(bot => {
      if (bot.token_address === migrationData.tokenAddress) {
        return {
          ...bot,
          status: 'maintenance',
          last_heartbeat: new Date().toISOString()
        }
      }
      return bot
    }))
  }

  const fetchBotStatus = async () => {
    try {
      // Initialize with mock data - will be replaced with real WebSocket data
      const mockBots: BotStatus[] = [
        {
          id: 'trader-001',
          name: 'BullRhun Trader',
          status: 'running',
          last_heartbeat: new Date().toISOString(),
          trades_processed: 1247,
          cpu_usage: 45,
          memory_usage: 62,
          uptime: '2d 14h 32m',
          connected: true,
          token_address: '2XioaBY8RkPnocb2ym7dSuGsDZbxbrYsoTcUHf8Xpump',
          type: 'trader'
        },
        {
          id: 'monitor-002',
          name: 'Price Monitor',
          status: 'running',
          last_heartbeat: new Date().toISOString(),
          trades_processed: 0,
          cpu_usage: 12,
          memory_usage: 28,
          uptime: '1d 8h 15m',
          connected: true,
          token_address: '91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p',
          type: 'monitor'
        },
        {
          id: 'analyzer-003',
          name: 'Market Analyzer',
          status: 'error',
          last_heartbeat: new Date(Date.now() - 300000).toISOString(),
          trades_processed: 892,
          cpu_usage: 0,
          memory_usage: 0,
          uptime: '0d 0h 5m',
          connected: false,
          type: 'analyzer'
        }
      ]
      
      setBots(mockBots)
    } catch (error) {
      console.error('Error fetching bot status:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToToken = () => {
    if (newToken && !subscribedTokens.includes(newToken)) {
      // Add to PumpPortal subscription
      // Direct WebSocket subscription handled in useEffect
      if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
        const subscribePayload: any = {
          method: "subscribeTokenTrade",
          keys: [newToken]
        }
        ws.send(JSON.stringify(subscribePayload))
      }
      
      setSubscribedTokens(prev => [...prev, newToken])
      setNewToken('')
      
      // Add token to display with minimal info
      const displayToken: TokenData = {
        address: newToken,
        name: 'Monitoring Token',
        symbol: 'WATCH',
        image: undefined,
        creator: 'Unknown',
        creatorTokenCount: 0,
        marketCapSol: 0,
        initialBuy: 0,
        currentPrice: 0.00001,
        priceChange24h: 0,
        volume24h: 0,
        holders: 0,
        status: 'in-progress',
        launchedAt: new Date().toISOString(),
        description: 'Token being monitored for trading activity',
        isMayhemMode: false
      }
      
      setTokenData(prev => [displayToken, ...prev.filter(t => t.address !== newToken)])
      
      // Create a monitor bot for this token
      const newBot: BotStatus = {
        id: `token-${Date.now()}`,
        name: `Token Monitor - ${newToken.slice(0, 8)}...`,
        status: 'running',
        last_heartbeat: new Date().toISOString(),
        trades_processed: 0,
        cpu_usage: 5,
        memory_usage: 15,
        uptime: '0d 0h 0m',
        connected: true,
        token_address: newToken,
        type: 'monitor'
      }
      
      setBots(prev => [...prev, newBot])
    }
  }

  const subscribeToAccount = () => {
    if (newAccount && !subscribedAccounts.includes(newAccount)) {
      // Add to PumpPortal subscription
      // Direct WebSocket subscription handled in useEffect
      if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
        const subscribePayload: any = {
          method: "subscribeAccountTrade",
          keys: [newAccount]
        }
        ws.send(JSON.stringify(subscribePayload))
      }
      
      setSubscribedAccounts(prev => [...prev, newAccount])
      setNewAccount('')
      
      // Create a monitor bot for this account
      const newBot: BotStatus = {
        id: `account-${Date.now()}`,
        name: `Account Monitor - ${newAccount.slice(0, 8)}...`,
        status: 'running',
        last_heartbeat: new Date().toISOString(),
        trades_processed: 0,
        cpu_usage: 5,
        memory_usage: 15,
        uptime: '0d 0h 0m',
        connected: true,
        account_address: newAccount,
        type: 'monitor'
      }
      
      setBots(prev => [...prev, newBot])
    }
  }

  const unsubscribeFromToken = (tokenAddress: string) => {
    setSubscribedTokens(prev => prev.filter(t => t !== tokenAddress))
    setBots(prev => prev.filter(bot => bot.token_address !== tokenAddress))
    setTokenData(prev => prev.filter(token => token.address !== tokenAddress))
    
    // Direct WebSocket unsubscription handled in useEffect
      if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
        const unsubscribePayload: any = {
          method: "unsubscribeTokenTrade",
          keys: [tokenAddress]
        }
        ws.send(JSON.stringify(unsubscribePayload))
      }
  }

  const unsubscribeFromAccount = (accountAddress: string) => {
    setSubscribedAccounts(prev => prev.filter(a => a !== accountAddress))
    setBots(prev => prev.filter(bot => bot.account_address !== accountAddress))
    
    // Direct WebSocket unsubscription handled in useEffect
      if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
        const unsubscribePayload: any = {
          method: "unsubscribeAccountTrade",
          keys: [accountAddress]
        }
        ws.send(JSON.stringify(unsubscribePayload))
      }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400 border-green-400/30'
      case 'stopped': return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-400/30'
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'migrated': return 'bg-orange-500/20 text-orange-400 border-orange-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running'
      case 'stopped': return 'Stopped'
      case 'error': return 'Error'
      case 'maintenance': return 'Maintenance'
      case 'migrated': return 'Migrated'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />
      case 'stopped': return <Pause className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'maintenance': return <Settings className="w-4 h-4" />
      case 'migrated': return <RefreshCw className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getTokenStatusColor = (status: string) => {
    switch (status) {
      case 'just-launched': return 'border-green-400 bg-green-500/5'
      case 'in-progress': return 'border-blue-400 bg-blue-500/5'
      case 'migrated': return 'border-orange-400 bg-orange-500/5'
      default: return 'border-gray-400 bg-gray-500/5'
    }
  }

  const getTokenStatusBadge = (status: string) => {
    switch (status) {
      case 'just-launched': return { text: 'Just Launched', color: 'bg-green-500/20 text-green-400 border-green-400/30' }
      case 'in-progress': return { text: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-400/30' }
      case 'migrated': return { text: 'Migrated', color: 'bg-orange-500/20 text-orange-400 border-orange-400/30' }
      default: return { text: status, color: 'bg-gray-500/20 text-gray-400 border-gray-400/30' }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const TokenCard = ({ token }: { token: TokenData }) => {
    const statusBadge = getTokenStatusBadge(token.status)
    const priceChangeColor = token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
    const priceChangeIcon = token.priceChange24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />

    return (
      <Card className={`bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm hover:shadow-meme-purple/10 transition-all duration-300 cursor-pointer border-2 ${getTokenStatusColor(token.status)}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {token.image ? (
                <img 
                  src={token.image} 
                  alt={token.name}
                  className="w-10 h-10 rounded-full object-cover border border-meme-purple/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-meme-purple/30 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-meme-purple" />
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-sm">{token.name}</h3>
                <p className="text-gray-400 text-xs">{token.symbol}</p>
              </div>
            </div>
            <Badge className={statusBadge.color}>
              {statusBadge.text}
            </Badge>
          </div>

          {/* Price Info */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white crypto-number text-sm">{formatPrice(token.currentPrice || 0.00001)}</span>
              <div className={`flex items-center gap-1 ${priceChangeColor}`}>
                {priceChangeIcon}
                <span className="text-xs crypto-number">
                  {(token.priceChange24h || 0) >= 0 ? '+' : ''}{(token.priceChange24h || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-meme-gray/50 rounded p-2">
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <DollarSign className="w-3 h-3" />
                <span>Market Cap</span>
              </div>
              <p className="text-white crypto-number font-bold">{formatMarketCap(token.marketCapSol || 0)}</p>
            </div>
            <div className="bg-meme-gray/50 rounded p-2">
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <Users className="w-3 h-3" />
                <span>Holders</span>
              </div>
              <p className="text-white crypto-number font-bold">{(token.holders || 0).toLocaleString()}</p>
            </div>
            <div className="bg-meme-gray/50 rounded p-2">
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Volume 24h</span>
              </div>
              <p className="text-white crypto-number font-bold">${(token.volume24h || 0).toLocaleString()}</p>
            </div>
            <div className="bg-meme-gray/50 rounded p-2">
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <Star className="w-3 h-3" />
                <span>Creator</span>
              </div>
              <p className="text-white crypto-text font-bold truncate">{(token.creator || 'Unknown').slice(0, 8)}...</p>
            </div>
          </div>

          {/* Creator Info */}
          <div className="mb-3 text-xs">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span>Creator Wallet</span>
              <span className="text-purple-400">{token.creatorTokenCount} tokens</span>
            </div>
            <p className="text-white crypto-text bg-meme-gray/50 rounded p-2 truncate">
              {token.creator || 'Unknown Creator'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 btn-neon-purple text-xs"
              onClick={() => window.open(`https://pump.fun/${token.address}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Pump.fun
            </Button>
            {token.twitterUrl && (
              <Button
                size="sm"
                className="btn-neon-blue text-xs"
                onClick={() => window.open(token.twitterUrl, '_blank')}
              >
                <Globe className="w-3 h-3" />
              </Button>
            )}
            {token.isMayhemMode && (
              <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                <Zap className="w-3 h-3 mr-1" />
                Mayhem
              </Badge>
            )}
          </div>

          {/* Timestamp */}
          <div className="mt-3 pt-2 border-t border-meme-purple/20 text-xs text-gray-400">
            Launched: {new Date(token.launchedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'restart') => {
    console.log(`Bot ${botId}: ${action}`)
    await fetchBotStatus() // Refresh status
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meme-gray via-purple-900 to-meme-gray">
        <SharedHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <WifiOff className="mx-auto h-12 w-12 text-meme-purple mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Connect Wallet Required</h2>
              <p className="text-gray-400">Please connect your wallet to access bot management</p>
            </CardContent>
          </Card>
        </main>
        <SharedFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-meme-gray via-purple-900 to-meme-gray">
      <SharedHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black crypto-title text-white">🤖 Bot Management</h1>
            <div className="flex gap-2">
              {isAdmin && (
                <Button 
                  onClick={() => {
                    setEditingBot(null)
                    setShowConfigModal(true)
                  }}
                  className="btn-neon-green"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bot
                </Button>
              )}
              <Button 
                onClick={fetchBotStatus}
                className="btn-neon-purple"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Token Data Display - 3 Column Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black crypto-title text-white">🚀 Live Token Data</h2>
                {isDemoMode && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
                    ⚠️ Demo Mode
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterStatus('all')}
                  className={`text-xs ${filterStatus === 'all' ? 'btn-neon-purple' : 'bg-meme-gray/70 text-gray-400 border-meme-purple/20'}`}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  onClick={() => setFilterStatus('just-launched')}
                  className={`text-xs ${filterStatus === 'just-launched' ? 'btn-neon-green' : 'bg-meme-gray/70 text-gray-400 border-meme-purple/20'}`}
                  size="sm"
                >
                  Just Launched
                </Button>
                <Button
                  onClick={() => setFilterStatus('in-progress')}
                  className={`text-xs ${filterStatus === 'in-progress' ? 'btn-neon-blue' : 'bg-meme-gray/70 text-gray-400 border-meme-purple/20'}`}
                  size="sm"
                >
                  In Progress
                </Button>
                <Button
                  onClick={() => setFilterStatus('migrated')}
                  className={`text-xs ${filterStatus === 'migrated' ? 'btn-neon-orange' : 'bg-meme-gray/70 text-gray-400 border-meme-purple/20'}`}
                  size="sm"
                >
                  Migrated
                </Button>
                <Button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`text-xs ${isDemoMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' : 'bg-meme-gray/70 text-gray-400 border-meme-purple/20'}`}
                  size="sm"
                >
                  {isDemoMode ? 'Disable Demo' : 'Enable Demo'}
                </Button>
              </div>
            </div>

            {/* 3 Column Token Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {tokenData.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <div className="inline-block animate-pulse">
                    <TrendingUp className="w-12 h-12 text-meme-purple mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Token Data Yet</h3>
                  <p className="text-gray-400">Real-time token data will appear here when PumpPortal detects new tokens</p>
                </div>
              ) : (
                tokenData
                  .filter(token => filterStatus === 'all' || token.status === filterStatus)
                  .map((token, index) => (
                    <TokenCard key={token.address || `token-${index}`} token={token} />
                  ))
              )}
            </div>
          </div>

          {/* Token and Account Subscriptions - Below */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Token Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Token address..."
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple flex-1"
                  />
                  <Button
                    onClick={subscribeToToken}
                    className="btn-neon-purple"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subscribedTokens.length === 0 ? (
                    <p className="text-gray-400 text-sm">No tokens subscribed</p>
                  ) : (
                    subscribedTokens.map((token) => (
                      <div key={token} className="flex items-center justify-between p-2 bg-meme-gray/50 rounded">
                        <span className="text-white font-mono text-sm">{token.slice(0, 8)}...{token.slice(-8)}</span>
                        <Button
                          onClick={() => unsubscribeFromToken(token)}
                          className="btn-neon-red"
                          size="sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Account Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Account address..."
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple flex-1"
                  />
                  <Button
                    onClick={subscribeToAccount}
                    className="btn-neon-purple"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Monitor
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subscribedAccounts.length === 0 ? (
                    <p className="text-gray-400 text-sm">No accounts monitored</p>
                  ) : (
                    subscribedAccounts.map((account) => (
                      <div key={account} className="flex items-center justify-between p-2 bg-meme-gray/50 rounded">
                        <span className="text-white font-mono text-sm">{account.slice(0, 8)}...{account.slice(-8)}</span>
                        <Button
                          onClick={() => unsubscribeFromAccount(account)}
                          className="btn-neon-red"
                          size="sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Bots</p>
                    <p className="text-2xl font-bold text-white">{bots.length}</p>
                  </div>
                  <Bot className="w-8 h-8 text-meme-purple" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Running</p>
                    <p className="text-2xl font-bold text-green-400">
                      {bots.filter(b => b.status === 'running').length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Errors</p>
                    <p className="text-2xl font-bold text-red-400">
                      {bots.filter(b => b.status === 'error').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Trades</p>
                    <p className="text-2xl font-bold text-white">
                      {bots.reduce((sum, bot) => sum + bot.trades_processed, 0)}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-meme-purple" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Migration Monitoring Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Migration Activity
                  </div>
                  <Button
                    onClick={() => setShowMigrationFeed(!showMigrationFeed)}
                    className="btn-neon-purple"
                    size="sm"
                  >
                    {showMigrationFeed ? 'Hide Feed' : 'Show Feed'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Active Migrations</p>
                    <p className="text-2xl font-bold text-orange-400">{migrationHistory.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Migrated Tokens</p>
                    <p className="text-2xl font-bold text-purple-400">{migratedTokens.length}</p>
                  </div>
                </div>

                {showMigrationFeed && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {migrationHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No migrations detected yet</p>
                      </div>
                    ) : (
                      migrationHistory.map((migration, index) => (
                        <div 
                          key={index} 
                          className="border-l-2 border-orange-400 pl-4 py-2 hover:bg-orange-400/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-orange-400 font-mono text-sm">
                              {(migration.tokenAddress || migration.token_address || '').slice(0, 8)}...{(migration.tokenAddress || migration.token_address || '').slice(-8)}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(migration.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white text-sm mb-1">
                            🔄 {migration.fromPlatform || migration.from_platform || 'Unknown'} → {migration.toPlatform || migration.to_platform || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {migration.reason}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Migrated Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {migratedTokens.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No tokens have migrated yet</p>
                    </div>
                  ) : (
                    migratedTokens.map((tokenAddress) => {
                      const relatedBot = bots.find(bot => bot.token_address === tokenAddress)
                      return (
                        <div 
                          key={tokenAddress}
                          className="flex items-center justify-between p-3 bg-meme-gray/50 rounded hover:bg-meme-gray/70 transition-colors"
                        >
                          <div>
                            <p className="text-white font-mono text-sm">
                              {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-8)}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {relatedBot ? relatedBot.name : 'Unknown Bot'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30">
                              Migrated
                            </Badge>
                            <Button
                              onClick={() => window.open(`https://pump.fun/${tokenAddress}`, '_blank')}
                              className="btn-neon-blue"
                              size="sm"
                            >
                              🔗 View on Pump.fun
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bot List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-t-2 border-meme-purple"></div>
                <p className="text-white mt-4">Loading bot status...</p>
              </div>
            ) : bots.length === 0 ? (
              <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Bot className="mx-auto h-12 w-12 text-meme-purple mb-4" />
                  <p className="text-white text-lg">No bots configured</p>
                  <p className="text-gray-400">Subscribe to tokens or accounts to create monitoring bots</p>
                </CardContent>
              </Card>
            ) : (
              bots.map((bot, index) => (
                <Card 
                  key={bot.id} 
                  className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm hover:shadow-meme-purple/10 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                          <Badge className={getStatusColor(bot.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(bot.status)}
                              {getStatusText(bot.status)}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-gray-400 font-mono text-sm">ID: {bot.id}</p>
                        {(bot.token_address || bot.account_address) && (
                          <p className="text-gray-400 font-mono text-xs">
                            Monitoring: {(bot.token_address || bot.account_address)?.slice(0, 8)}...{(bot.token_address || bot.account_address)?.slice(-8)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {bot.status === 'running' ? (
                          <Button
                            onClick={() => handleBotAction(bot.id, 'stop')}
                            className="btn-neon-red"
                            size="sm"
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Stop
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleBotAction(bot.id, 'start')}
                            className="btn-neon-green"
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleBotAction(bot.id, 'restart')}
                          className="btn-neon-purple"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        
                        {isAdmin && (
                          <Button
                            onClick={() => {
                              setEditingBot({
                                id: bot.id,
                                name: bot.name,
                                type: bot.type,
                                config: {
                                  trade_amount: 0.1,
                                  max_trades: 10,
                                  interval: 5000,
                                  strategy: 'balanced',
                                  token_address: bot.token_address,
                                  account_address: bot.account_address
                                },
                                enabled: true
                              })
                              setShowConfigModal(true)
                            }}
                            className="btn-neon-purple"
                            size="sm"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Status
                        </p>
                        <p className="text-white font-mono">
                          {bot.connected ? (
                            <span className="text-green-400">Connected</span>
                          ) : (
                            <span className="text-red-400">Disconnected</span>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          CPU
                        </p>
                        <p className="text-white font-mono">{bot.cpu_usage}%</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          Trades
                        </p>
                        <p className="text-white font-mono">{bot.trades_processed.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Uptime
                        </p>
                        <p className="text-white font-mono">{bot.uptime}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-meme-purple/20">
                      <p className="text-xs text-gray-400">
                        Last heartbeat: {new Date(bot.last_heartbeat).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      <SharedFooter />
      
      {/* Bot Configuration Modal - Admin Only */}
      {isAdmin && (
        <BotConfigModal
          bot={editingBot as any}
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false)
            setEditingBot(null)
          }}
          onSave={(config) => {
            console.log('Bot config saved:', config)
            setShowConfigModal(false)
            setEditingBot(null)
          }}
        />
      )}
    </div>
  )
}