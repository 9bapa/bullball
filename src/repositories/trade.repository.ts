import { BaseRepository } from './base.repository';
import { 
  BullrhunTrade, 
  CreateTradeData, 
  TradeQueryOptions 
} from '@/types/bullrhun.types';
import { supabase } from '@/lib/supabase';

const supabaseClient = supabase!;

export class TradeRepository extends BaseRepository<BullrhunTrade> {
  constructor() {
    super('bullrhun_trades');
  }

  async createTrade(data: CreateTradeData): Promise<BullrhunTrade> {
    return this.createWithServiceRole(data);
  }

  async findByMint(
    mint: string, 
    options: TradeQueryOptions = {}
  ): Promise<BullrhunTrade[]> {
    const conditions = { mint } as any;
    if (options.venue) conditions.venue = options.venue;
    if (options.traderAddress) conditions.trader_address = options.traderAddress;
    if (options.isSystemBuy !== undefined) conditions.is_system_buy = options.isSystemBuy;
    if (options.cycleId) conditions.cycle_id = options.cycleId;
    
    return this.findMany(conditions, {
      limit: options.limit,
      offset: options.offset,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc',
    });
  }

  async findRecentTrades(
    mint: string, 
    limit: number = 10
  ): Promise<BullrhunTrade[]> {
    return this.findByMint(mint, { limit });
  }

  async findSystemBuys(mint?: string): Promise<BullrhunTrade[]> {
    const conditions = { is_system_buy: true } as any;
    if (mint) conditions.mint = mint;
    
    return this.findMany(conditions, {
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async findUserTrades(mint: string): Promise<BullrhunTrade[]> {
    return this.findByMint(mint, { isSystemBuy: false });
  }

  async findTradesByTrader(
    traderAddress: string, 
    options: TradeQueryOptions = {}
  ): Promise<BullrhunTrade[]> {
    return this.findMany(
      { trader_address: traderAddress },
      {
        limit: options.limit,
        orderBy: options.orderBy || 'created_at',
        orderDirection: options.orderDirection || 'desc',
      }
    );
  }

  async getTradeCount(mint?: string): Promise<number> {
    const conditions = mint ? { mint } : {};
    return this.count(conditions);
  }

  async getTotalTradesInPeriod(
    startDate: string, 
    endDate: string, 
    mint?: string
  ): Promise<number> {
    let query = supabaseClient
      .from('bullrhun_trades')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { count, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTotalTradesInPeriod');
    }

    return count || 0;
  }

  async getTradeVolume(mint?: string): Promise<{
    totalSol: number;
    totalTokens: number;
    tradeCount: number;
  }> {
    let query = supabase
      .from('bullrhun_trades')
      .select('amount_sol, amount_tokens');

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTradeVolume');
    }

    const trades = data || [];
    return {
      totalSol: trades.reduce((sum, trade) => sum + (trade.amount_sol || 0), 0),
      totalTokens: trades.reduce((sum, trade) => sum + (trade.amount_tokens || 0), 0),
      tradeCount: trades.length,
    };
  }

  async getLargestTrades(mint: string, limit: number = 5): Promise<BullrhunTrade[]> {
    return this.findByMint(mint, {
      limit,
      orderBy: 'amount_sol',
      orderDirection: 'desc',
    });
  }

  async getTradesByVenue(mint: string): Promise<Record<string, {
    count: number;
    volumeSol: number;
    volumeTokens: number;
  }>> {
    const { data, error } = await supabase
      .from('bullrhun_trades')
      .select('venue, amount_sol, amount_tokens')
      .eq('mint', mint);

    if (error) {
      this.handleDatabaseError(error, 'getTradesByVenue');
    }

    const trades = data || [];
    const venueStats: Record<string, any> = {};

    trades.forEach(trade => {
      const venue = trade.venue || 'unknown';
      if (!venueStats[venue]) {
        venueStats[venue] = {
          count: 0,
          volumeSol: 0,
          volumeTokens: 0,
        };
      }
      
      venueStats[venue].count++;
      venueStats[venue].volumeSol += trade.amount_sol || 0;
      venueStats[venue].volumeTokens += trade.amount_tokens || 0;
    });

    return venueStats;
  }

  async getTradeStats(mint?: string): Promise<{
    totalTrades: number;
    systemBuys: number;
    userTrades: number;
    totalVolumeSol: number;
    totalVolumeTokens: number;
    averageTradeSizeSol: number;
  }> {
    let query = supabase
      .from('bullrhun_trades')
      .select('amount_sol, amount_tokens, is_system_buy');

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTradeStats');
    }

    const trades = data || [];
    const systemBuys = trades.filter(t => t.is_system_buy);
    const userTrades = trades.filter(t => !t.is_system_buy);
    const totalVolumeSol = trades.reduce((sum, t) => sum + (t.amount_sol || 0), 0);

    return {
      totalTrades: trades.length,
      systemBuys: systemBuys.length,
      userTrades: userTrades.length,
      totalVolumeSol,
      totalVolumeTokens: trades.reduce((sum, t) => sum + (t.amount_tokens || 0), 0),
      averageTradeSizeSol: trades.length > 0 ? totalVolumeSol / trades.length : 0,
    };
  }

  async getLastTrade(mint?: string): Promise<BullrhunTrade | null> {
    let query = supabase
      .from('bullrhun_trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      this.handleDatabaseError(error, 'getLastTrade');
    }

    return data || null;
  }

  async getTradesInTimeRange(
    startDate: string,
    endDate: string,
    mint?: string
  ): Promise<BullrhunTrade[]> {
    let query = supabase
      .from('bullrhun_trades')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTradesInTimeRange');
    }

    return data || [];
  }

  async findLastQualifyingTrader(minAmount: number): Promise<{
    trader_address: string;
    trade_amount_sol: number;
  } | null> {
    const { data, error } = await supabase
      .from('bullrhun_trades')
      .select('trader_address, amount_sol')
      .gte('amount_sol', minAmount)
      .eq('is_system_buy', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.handleDatabaseError(error, 'findLastQualifyingTrader');
    }

    if (!data) return null;

    return {
      trader_address: data.trader_address!,
      trade_amount_sol: data.amount_sol!,
    };
  }

  // Enhanced methods for 11-step flow

  async getLastQualifyingTrade(): Promise<{
    trader_address: string;
    trade_amount_sol: number;
  } | null> {
    return this.findLastQualifyingTrader(0.05); // Default minimum qualifying amount
  }

  async getTotalTrades(mint?: string): Promise<number> {
    let query = supabase
      .from('bullrhun_trades')
      .select('*', { count: 'exact', head: true });

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { count, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTotalTrades');
    }

    return count || 0;
  }
}