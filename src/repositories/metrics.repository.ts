import { BaseRepository } from './base.repository';
import { BullrhunMetrics } from '@/types/bullrhun.types';
import { supabaseAdmin } from '@/lib/supabase';

export class MetricsRepository extends BaseRepository<BullrhunMetrics> {
  constructor() {
    super('bullrhun_metrics');
  }

  async getMetrics(): Promise<BullrhunMetrics> {
    const metrics = await this.findById(1);
    return metrics || {
      id: 1,
      total_cycles: 0,
      total_fees_collected: 0,
      total_trades: 0,
      total_rewards_sent: 0,
      current_sol_price: 0,
      last_cycle_at: null,
      updated_at: new Date().toISOString(),
      total_tokens_bought: 0,
      total_gifts_sent: 0,
      total_sol_spent: 0,
    };
  }

  async updateMetrics(data: Partial<BullrhunMetrics>): Promise<BullrhunMetrics> {
    const updateData = {
      ...data,
      id: 1, // Always update the single metrics row
      updated_at: new Date().toISOString(),
    };

    return this.upsert(updateData, ['id']);
  }

  async incrementCycles(): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_cycles: current.total_cycles + 1,
    });
  }

  async incrementFeesCollected(amount: number): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_fees_collected: current.total_fees_collected + amount,
    });
  }

  async incrementTrades(): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_trades: current.total_trades + 1,
    });
  }

  async incrementRewardsSent(amount: number): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_rewards_sent: current.total_rewards_sent + amount,
    });
  }

  async updateSolPrice(price: number): Promise<BullrhunMetrics> {
    return this.updateMetrics({
      current_sol_price: price,
    });
  }

  async updateLastCycleTime(): Promise<BullrhunMetrics> {
    return this.updateMetrics({
      last_cycle_at: new Date().toISOString(),
    });
  }

  async resetMetrics(): Promise<BullrhunMetrics> {
    return this.updateMetrics({
      total_cycles: 0,
      total_fees_collected: 0,
      total_trades: 0,
      total_rewards_sent: 0,
      current_sol_price: 0,
      last_cycle_at: null,
      total_tokens_bought: 0,
      total_gifts_sent: 0,
      total_sol_spent: 0,
    });
  }

  async getMetricsSummary(): Promise<{
    cyclesPerDay: number;
    tradesPerCycle: number;
    averageRewardSize: number;
    totalValueProcessed: number;
  }> {
    const metrics = await this.getMetrics();
    const cyclesPerDay = metrics.total_cycles > 0 ? 
      metrics.total_cycles / Math.max(1, this.getDaysSinceCreation(metrics)) : 0;
    const tradesPerCycle = metrics.total_cycles > 0 ? 
      metrics.total_trades / metrics.total_cycles : 0;
    const averageRewardSize = metrics.total_trades > 0 ? 
      metrics.total_rewards_sent / metrics.total_trades : 0;
    const totalValueProcessed = metrics.total_fees_collected + metrics.total_rewards_sent;

    return {
      cyclesPerDay,
      tradesPerCycle,
      averageRewardSize,
      totalValueProcessed,
    };
  }

  private getDaysSinceCreation(metrics: BullrhunMetrics): number {
    if (!metrics.last_cycle_at) return 1;
    const now = new Date();
    const lastCycle = new Date(metrics.last_cycle_at);
    return Math.max(1, Math.ceil((now.getTime() - lastCycle.getTime()) / (1000 * 60 * 60 * 24)));
  }

  async getHistoricalMetrics(days: number = 30): Promise<any[]> {
    // This would require historical data storage
    // For now, return current metrics
    const current = await this.getMetrics();
    return [current];
  }

  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    lastCycleAge: number;
    cyclesInLast24h: number;
    errorRate: number;
  }> {
    const metrics = await this.getMetrics();
    const now = new Date();
    
    let lastCycleAge = Infinity;
    if (metrics.last_cycle_at) {
      const lastCycle = new Date(metrics.last_cycle_at);
      lastCycleAge = (now.getTime() - lastCycle.getTime()) / (1000 * 60); // minutes
    }

    // Get cycles in last 24 hours
    const cyclesInLast24h = await this.getCyclesInLast24h();
    
    // Calculate error rate (would need failed cycles data)
    const errorRate = await this.getErrorRate();

    const isHealthy = 
      lastCycleAge < 10 && // Last cycle within 10 minutes
      cyclesInLast24h >= 12 && // At least 12 cycles in 24h (every 2 minutes)
      errorRate < 0.1; // Error rate less than 10%

    return {
      isHealthy,
      lastCycleAge,
      cyclesInLast24h,
      errorRate,
    };
  }

  private async getCyclesInLast24h(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo)
      .eq('status', 'completed');

    if (error) {
      this.handleDatabaseError(error, 'getCyclesInLast24h');
    }

    return count || 0;
  }

  private async getErrorRate(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('status')
      .gte('created_at', twentyFourHoursAgo);

    if (error) {
      this.handleDatabaseError(error, 'getErrorRate');
    }

    const cycles = data || [];
    if (cycles.length === 0) return 0;

    const failed = cycles.filter(c => c.status === 'failed').length;
    return failed / cycles.length;
  }

  // Enhanced methods for 11-step flow

  async incrementTokensBought(amount: number): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_tokens_bought: current.total_tokens_bought + amount,
    });
  }

  async incrementGiftsSent(count: number): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_gifts_sent: current.total_gifts_sent + count,
    });
  }

  async incrementSolSpent(amount: number): Promise<BullrhunMetrics> {
    const current = await this.getMetrics();
    return this.updateMetrics({
      total_sol_spent: current.total_sol_spent + amount,
    });
  }

  async updateCurrentBalance(balance: number): Promise<BullrhunMetrics> {
    return this.updateMetrics({
      // Could add current_balance field to metrics table
    });
  }
}