import { BaseRepository } from './base.repository';
import { supabaseService } from '@/lib/supabase';

export interface BullrhunToken {
  mint: string;
  is_active?: boolean;
  is_graduated?: boolean;
  graduated_at?: string;
  created_at?: string;
  updated_at?: string;
  // Note: price column needs to be added to schema
  price?: number;
  market_cap?: number;
  volume_24h?: number;
}

export interface CreateTokenData {
  mint: string;
  is_active?: boolean;
  is_graduated?: boolean;
  graduated_at?: string;
  price?: number;
  market_cap?: number;
  volume_24h?: number;
}

export class TokenRepository {
  private baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  async createToken(data: CreateTokenData): Promise<BullrhunToken> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tokens/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create token: ${errorData.error}`);
      }

      const result = await response.json();
      return result.token;
    } catch (error) {
      console.error('Token create error:', error);
      throw error;
    }
  }

  async updateTokenPrice(mint: string, price: number): Promise<BullrhunToken> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tokens/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint, price })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update token price: ${errorData.error}`);
      }

      const result = await response.json();
      return result.token;
    } catch (error) {
      console.error('Token price update error:', error);
      throw error;
    }
  }

  async getTokenByMint(mint: string): Promise<BullrhunToken | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tokens/${mint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          return null; // Not found is expected
        }
        throw new Error(`Failed to get token: ${errorData.error}`);
      }

      const result = await response.json();
      return result.token;
    } catch (error) {
      console.error('Token get error:', error);
      return null;
    }
  }

  async updateTokenWithTrade(mint: string, tradeData: {
    price: number;
    amountTokens: number;
    amountSol: number;
    marketCap?: number;
    volume24h?: number;
  }): Promise<BullrhunToken> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tokens/trade-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint,
          price: tradeData.price,
          amountTokens: tradeData.amountTokens,
          amountSol: tradeData.amountSol,
          marketCap: tradeData.marketCap,
          volume24h: tradeData.volume24h
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update token with trade: ${errorData.error}`);
      }

      const result = await response.json();
      console.log(`📈 Updated token ${mint} with price: ${tradeData.price}, tokens: ${tradeData.amountTokens}, SOL: ${tradeData.amountSol}`);
      return result.token;
    } catch (error) {
      console.error('Token trade update error:', error);
      throw error;
    }
  }
}