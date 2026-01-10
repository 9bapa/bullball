// Database Service for BullRhun - connects WebSocket data to Supabase

interface TokenData {
  address: string
  name: string
  symbol: string
  image?: string
  creator: string
  creatorTokenCount: number
  marketCapSol: number
  initialBuy: number
  currentPrice: number
  priceChange24h: number
  volume24h: number
  holders: number
  status: 'just-launched' | 'in-progress' | 'migrated'
  launchedAt: string
  description?: string
  twitterUrl?: string
  websiteUrl?: string
  isMayhemMode: boolean
}

interface TradeData {
  tokenAddress: string
  price: number
  amount: number
  timestamp: string
  trader: string
  type: 'buy' | 'sell'
}

interface MigrationData {
  from_platform: string
  to_platform: string
  token_address: string
  timestamp: string
  migration_id: string
}

class DatabaseService {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }

  // Token CRUD operations
  async createToken(tokenData: TokenData): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bullrhun_tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          token_address: tokenData.address,
          name: tokenData.name,
          symbol: tokenData.symbol,
          creator: tokenData.creator,
          initial_buy: tokenData.initialBuy,
          market_cap_sol: tokenData.marketCapSol,
          uri: tokenData.image,
          description: tokenData.description,
          is_mayhem_mode: tokenData.isMayhemMode,
          created_at: tokenData.launchedAt
        })
      })

      if (!response.ok) {
        console.error('❌ Error creating token in database:', await response.text())
      } else {
        console.log('✅ Token created in database:', tokenData.address)
      }
    } catch (error) {
      console.error('❌ Database error creating token:', error)
    }
  }

  async updateToken(tokenAddress: string, updates: Partial<TokenData>): Promise<void> {
    try {
      const updateData: any = {}
      
      if (updates.currentPrice !== undefined) updateData.current_price = updates.currentPrice
      if (updates.priceChange24h !== undefined) updateData.price_change_24h = updates.priceChange24h
      if (updates.volume24h !== undefined) updateData.volume_24h = updates.volume24h
      if (updates.holders !== undefined) updateData.holders = updates.holders
      if (updates.status !== undefined) updateData.status = updates.status

      const response = await fetch(`${this.supabaseUrl}/rest/v1/bullrhun_tokens?token_address=eq.${tokenAddress}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        console.error('❌ Error updating token in database:', await response.text())
      } else {
        console.log('✅ Token updated in database:', tokenAddress)
      }
    } catch (error) {
      console.error('❌ Database error updating token:', error)
    }
  }

  async getTokens(limit: number = 100, status?: string): Promise<TokenData[]> {
    try {
      let url = `${this.supabaseUrl}/rest/v1/bullrhun_tokens?order=created_at.desc&limit=${limit}`
      
      if (status) {
        url += `&status=eq.${status}`
      }

      const response = await fetch(url, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      })

      if (!response.ok) {
        console.error('❌ Error fetching tokens from database:', await response.text())
        return []
      }

      const tokens = await response.json()
      
      // Convert database format to TokenData interface
      return tokens.map((token: any) => ({
        address: token.token_address,
        name: token.name,
        symbol: token.symbol,
        image: token.uri,
        creator: token.creator,
        creatorTokenCount: token.creator_token_count || 0,
        marketCapSol: token.market_cap_sol || 0,
        initialBuy: token.initial_buy || 0,
        currentPrice: token.current_price || 0.00001,
        priceChange24h: token.price_change_24h || 0,
        volume24h: token.volume_24h || 0,
        holders: token.holders || 0,
        status: token.status || 'just-launched',
        launchedAt: token.created_at,
        description: token.description,
        twitterUrl: token.twitter_url,
        websiteUrl: token.website_url,
        isMayhemMode: token.is_mayhem_mode || false
      }))
    } catch (error) {
      console.error('❌ Database error fetching tokens:', error)
      return []
    }
  }

  // Trade operations
  async createTrade(tradeData: TradeData): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bullrhun_trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          token_address: tradeData.tokenAddress,
          wallet_address: tradeData.trader,
          amount: tradeData.amount,
          price: tradeData.price,
          trade_time: tradeData.timestamp
        })
      })

      if (!response.ok) {
        console.error('❌ Error creating trade in database:', await response.text())
      } else {
        console.log('✅ Trade created in database:', tradeData.tokenAddress)
      }
    } catch (error) {
      console.error('❌ Database error creating trade:', error)
    }
  }

  // Migration operations
  async createMigration(migrationData: MigrationData): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bullrhun_migrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          token_address: migrationData.token_address,
          from_platform: migrationData.from_platform,
          to_platform: migrationData.to_platform,
          migration_id: migrationData.migration_id,
          created_at: migrationData.timestamp
        })
      })

      if (!response.ok) {
        console.error('❌ Error creating migration in database:', await response.text())
      } else {
        console.log('✅ Migration created in database:', migrationData.token_address)
      }
    } catch (error) {
      console.error('❌ Database error creating migration:', error)
    }
  }

  // Token creator operations
  async updateTokenCreator(creatorAddress: string, updates: { tokenCount?: number; successRate?: number }): Promise<void> {
    try {
      const updateData: any = {}
      
      if (updates.tokenCount !== undefined) updateData.total_tokens_created = updates.tokenCount
      if (updates.successRate !== undefined) updateData.success_rate = updates.successRate

      const response = await fetch(`${this.supabaseUrl}/rest/v1/bullrhun_token_creators?creator_wallet=eq.${creatorAddress}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        console.error('❌ Error updating token creator in database:', await response.text())
      } else {
        console.log('✅ Token creator updated in database:', creatorAddress)
      }
    } catch (error) {
      console.error('❌ Database error updating token creator:', error)
    }
  }
}

export { DatabaseService, type TokenData, type TradeData, type MigrationData }