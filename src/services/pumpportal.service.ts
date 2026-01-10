export interface PumpPortalData {
  type: 'newToken' | 'trade' | 'migration' | 'price' | 'volume'
  timestamp: string
  data: any
}

export interface TokenData {
  address: string
  name: string
  symbol: string
  decimals: number
  price: number
  volume: number
  liquidity: number
  holderCount: number
}

export interface TradeData {
  tokenAddress: string
  from: string
  to: string
  amount: number
  price: number
  timestamp: string
  txSignature: string
}

export interface AccountTradeData {
  account: string
  tokenAddress: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: string
  txSignature: string
}

export interface MigrationData {
  tokenAddress: string
  fromPlatform: string
  toPlatform: string
  timestamp: string
  reason: string
}

export class PumpPortalService {
  private ws: WebSocket | null = null
  private apiKey: string
  private subscribers: Map<string, (data: PumpPortalData) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_PUMPPORTAL_API_KEY || 'your-api-key-here'
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws) {
          this.ws.close()
        }

        this.ws = new WebSocket(`wss://pumpportal.fun/api/data?api-key=${this.apiKey}`)

        this.ws.onopen = () => {
          console.log('✅ Connected to PumpPortal WebSocket')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('❌ WebSocket disconnected:', event.code, event.reason)
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            const delay = this.reconnectDelay * this.reconnectAttempts
            console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
            
            setTimeout(() => {
              this.connect().catch(console.error)
            }, delay)
          }
        }

        this.ws.onerror = (error) => {
          console.error('🔥 WebSocket error:', error)
          reject(error)
        }

        this.ws.onerror = (error) => {
          console.error('🔥 WebSocket error:', error)
        }

      } catch (error) {
        console.error('Failed to connect to PumpPortal:', error)
        reject(error)
      }
    })
  }

  private reconnectDelay(): number {
    // Exponential backoff with jitter
    const baseDelay = 1000
    const maxDelay = 30000
    const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts - 1)
    const jitter = Math.random() * 1000
    
    return Math.min(exponentialDelay + jitter, maxDelay)
  }

  private handleMessage(data: any): void {
    // Notify all subscribers of the data
    this.subscribers.forEach((callback, id) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in subscriber ${id}:`, error)
      }
    })

    // Handle specific data types
    switch (data.type) {
      case 'newToken':
        console.log('🪙 New token created:', data.data)
        break
      case 'trade':
        console.log('💰 Trade executed:', data.data)
        break
      case 'migration':
        console.log('🔄 Token migration:', data.data)
        break
      case 'price':
        console.log('📊 Price update:', data.data)
        break
      case 'volume':
        console.log('📈 Volume spike:', data.data)
        break
    }
  }

  subscribeToNewTokens(callback: (data: PumpPortalData) => void): string {
    const id = 'newToken-subscriber'
    this.subscribers.set(id, callback)
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'subscribeNewToken'
      })
    }
    
    return id
  }

  subscribeToTokenTrades(tokenAddresses: string[]): string {
    const id = `tokenTrade-subscriber-${Date.now()}`
    this.subscribers.set(id, (data) => {
      if (data.type === 'trade' && data.data) {
        const tradeData = data.data as TradeData
        if (tokenAddresses.includes(tradeData.tokenAddress)) {
          console.log(`💰 Trade for monitored token:`, tradeData)
        }
      }
    })
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'subscribeTokenTrade',
        keys: tokenAddresses
      })
    }
    
    return id
  }

  subscribeToAccountTrades(accountAddresses: string[]): string {
    const id = `accountTrade-subscriber-${Date.now()}`
    this.subscribers.set(id, (data) => {
      if (data.type === 'trade' && data.data) {
        const tradeData = data.data as AccountTradeData
        if (accountAddresses.includes(tradeData.account)) {
          console.log(`👤 Account trade:`, tradeData)
        }
      }
    })
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'subscribeAccountTrade',
        keys: accountAddresses
      })
    }
    
    return id
  }

  subscribeToMigrations(callback: (data: PumpPortalData) => void): string {
    const id = `migration-subscriber-${Date.now()}`
    this.subscribers.set(id, callback)
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'subscribeMigration'
      })
    }
    
    return id
  }

  unsubscribeFromTokenTrades(tokenAddresses: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'unsubscribeTokenTrade',
        keys: tokenAddresses
      })
    }
  }

  unsubscribeFromAccountTrades(accountAddresses: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'unsubscribeAccountTrade',
        keys: accountAddresses
      })
    }
  }

  unsubscribeFromMigrations(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        method: 'unsubscribeMigration'
      })
    }
  }

  onRealtimeData(callback: (data: PumpPortalData) => void): string {
    const id = `general-subscriber-${Date.now()}`
    this.subscribers.set(id, callback)
    return id
  }

  removeSubscriber(id: string): void {
    this.subscribers.delete(id)
  }

  private send(payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    // Clear all subscribers
    this.subscribers.clear()
    this.reconnectAttempts = 0
  }

  getConnectionStatus(): {
    connected: boolean
    reconnectAttempts: number
    readyState: number
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN || false,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws?.readyState || WebSocket.CLOSED
    }
  }
}

export default PumpPortalService