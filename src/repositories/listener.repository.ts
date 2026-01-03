import { BaseRepository } from './base.repository';
import { BullrhunListener } from '@/types/bullrhun.types';
import { config } from '@/config';
import { supabaseService } from '@/lib/supabase';

const supabaseClient = supabaseService;

export class ListenerRepository extends BaseRepository<BullrhunListener> {
  constructor() {
    super('bullrhun_listeners');
  }

  async getListenerStatus(): Promise<BullrhunListener> {
    let status = await this.findById(1);
    
    if (!status) {
      status = await this.create({
        id: 1,
        monitored_mint: config.BULLRHUN_MINT,
        total_trades_monitored: 0,
        current_trade_threshold: 30,
        current_trade_count: 0,
      });
    }
    
    return status;
  }

  async updateHeartbeat(mint?: string): Promise<BullrhunListener> {
    const updateData: Partial<BullrhunListener> = {
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (mint) {
      updateData.monitored_mint = mint;
    }

    return this.update(1, updateData);
  }

  async incrementTradeCount(): Promise<BullrhunListener> {
    const current = await this.getListenerStatus();
    return this.update(1, {
      current_trade_count: current.current_trade_count + 1,
      total_trades_monitored: current.total_trades_monitored + 1,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async updateTradeThreshold(threshold: number, count: number = 0): Promise<BullrhunListener> {
    return this.update(1, {
      current_trade_threshold: threshold,
      current_trade_count: count,
      updated_at: new Date().toISOString(),
    });
  }

  async resetTradeCount(): Promise<BullrhunListener> {
    return this.update(1, {
      current_trade_count: 0,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async updateMonitoredMint(mint: string): Promise<BullrhunListener> {
    return this.update(1, {
      monitored_mint: mint,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async isHealthy(): Promise<boolean> {
    const status = await this.getListenerStatus();
    if (!status) return false;

    const now = new Date();
    const lastHeartbeat = new Date(status.last_heartbeat);
    const minutesSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);

    return minutesSinceHeartbeat < 5; // Healthy if heartbeat within 5 minutes
  }

  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    lastHeartbeat: string;
    minutesSinceHeartbeat: number;
    monitoredMint: string | null;
    tradeThreshold: number;
    currentTradeCount: number;
    thresholdProgress: number;
  }> {
    const status = await this.getListenerStatus();
    if (!status) {
      return {
        isHealthy: false,
        lastHeartbeat: new Date().toISOString(),
        minutesSinceHeartbeat: Infinity,
        monitoredMint: null,
        tradeThreshold: 30,
        currentTradeCount: 0,
        thresholdProgress: 0,
      };
    }

    const now = new Date();
    const lastHeartbeat = new Date(status.last_heartbeat);
    const minutesSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
    const thresholdProgress = status.current_trade_threshold > 0 ? 
      (status.current_trade_count / status.current_trade_threshold) * 100 : 0;

    return {
      isHealthy: minutesSinceHeartbeat < 5,
      lastHeartbeat: status.last_heartbeat,
      minutesSinceHeartbeat,
      monitoredMint: status.monitored_mint,
      tradeThreshold: status.current_trade_threshold,
      currentTradeCount: status.current_trade_count,
      thresholdProgress,
    };
  }

  async updateFromWebSocket(data: {
    mint?: string;
    hasTrade?: boolean;
  }): Promise<BullrhunListener> {
    const current = await this.getListenerStatus();
    const updateData: Partial<BullrhunListener> = {
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (data.mint && data.mint !== current.monitored_mint) {
      updateData.monitored_mint = data.mint;
    }

    if (data.hasTrade) {
      updateData.current_trade_count = current.current_trade_count + 1;
      updateData.total_trades_monitored = current.total_trades_monitored + 1;
    }

    return this.update(1, updateData);
  }

  async getListenerStats(): Promise<{
    totalTradesMonitored: number;
    currentThreshold: number;
    currentCount: number;
    isThresholdMet: boolean;
    progressPercentage: number;
    estimatedNextReward: number;
  }> {
    const status = await this.getListenerStatus();
    
    const isThresholdMet = status.current_trade_count >= status.current_trade_threshold;
    const progressPercentage = status.current_trade_threshold > 0 ? 
      (status.current_trade_count / status.current_trade_threshold) * 100 : 0;
    const estimatedNextReward = config.REWARD_SOL_AMOUNT || 0;

    return {
      totalTradesMonitored: status.total_trades_monitored,
      currentThreshold: status.current_trade_threshold,
      currentCount: status.current_trade_count,
      isThresholdMet,
      progressPercentage,
      estimatedNextReward,
    };
  }

  async handleTradeEvent(tradeAmountSol: number): Promise<{
    isQualifyingTrade: boolean;
    newCount: number;
    thresholdMet: boolean;
    newThreshold?: number;
  }> {
    const status = await this.getListenerStatus();
    const isQualifyingTrade = tradeAmountSol >= config.MIN_GIFT_TRADE_AMOUNT;
    
    let newCount = status.current_trade_count;
    let thresholdMet = false;
    let newThreshold;

    if (isQualifyingTrade) {
      newCount++;
      thresholdMet = newCount >= status.current_trade_threshold;

      if (thresholdMet) {
        // Generate new random threshold
        newThreshold = Math.floor(30 + Math.random() * 271);
        await this.updateTradeThreshold(newThreshold, 0);
      } else {
        await this.update(1, {
          current_trade_count: newCount,
          last_heartbeat: new Date().toISOString(),
        });
      }
    } else {
      // Just update heartbeat
      await this.updateHeartbeat();
    }

    return {
      isQualifyingTrade,
      newCount,
      thresholdMet,
      newThreshold,
    };
  }

  // Enhanced methods for trade goal functionality

  async getListener(): Promise<BullrhunListener> {
    const status = await this.findById(1);
    
    if (!status) {
      const now = new Date().toISOString();
      await this.create({
        id: 1,
        monitored_mint: config.BULLRHUN_MINT,
        last_heartbeat: now,
        total_trades_monitored: 0,
        current_trade_threshold: 30,
        current_trade_count: 0,
        updated_at: now,
        trade_goal: 143,
        last_winner_address: null,
        last_winner_at: null,
        minimum_trade_amount: 0.50,
      });
      return this.findById(1) as Promise<BullrhunListener>;
    }
    
    return status;
  }

  async updateTradeGoal(newGoal: number): Promise<void> {
    const updateData: Partial<BullrhunListener> = {
      trade_goal: newGoal,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseClient
      .from(this.tableName)
      .update(updateData)
      .eq('id', 1);

    if (error) {
      this.handleDatabaseError(error, 'updateTradeGoal');
    }
  }

  async updateMinimumTradeAmount(newAmount: number): Promise<void> {
    const updateData: Partial<BullrhunListener> = {
      minimum_trade_amount: newAmount,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', 1);

    if (error) {
      this.handleDatabaseError(error, 'updateMinimumTradeAmount');
    }
  }

  async updateLastWinner(winnerAddress: string): Promise<void> {
    const updateData: Partial<BullrhunListener> = {
      last_winner_address: winnerAddress,
      last_winner_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', 1);

    if (error) {
      this.handleDatabaseError(error, 'updateLastWinner');
    }
  }
}