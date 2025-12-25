import { BaseRepository } from './base.repository';
import { 
  BullrhunCycle, 
  CreateCycleData, 
  CycleQueryOptions,
  CycleStatus 
} from '@/types/bullrhun.types';
import { supabaseAdmin } from '@/lib/supabase';

export class CycleRepository extends BaseRepository<BullrhunCycle> {
  constructor() {
    super('bullrhun_cycles');
  }

  async createCycle(data: CreateCycleData): Promise<BullrhunCycle> {
    return this.create({
      ...data,
      status: CycleStatus.PENDING,
    });
  }

  async updateCycleStatus(
    id: string, 
    status: CycleStatus, 
    signatures?: Partial<BullrhunCycle>,
    errorMessage?: string
  ): Promise<BullrhunCycle> {
    const updateData: Partial<BullrhunCycle> = {
      status,
      status_updated_at: new Date().toISOString(),
    };

    if (signatures) {
      Object.assign(updateData, signatures);
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (status === CycleStatus.COMPLETED) {
      updateData.executed_at = new Date().toISOString();
    }

    return this.update(id, updateData);
  }

  async findByMint(
    mint: string, 
    options: CycleQueryOptions = {}
  ): Promise<BullrhunCycle[]> {
    const conditions = { mint } as any;
    if (options.status) conditions.status = options.status;
    
    return this.findMany(conditions, {
      limit: options.limit,
      offset: options.offset,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc',
    });
  }

  async findRecentCycles(limit: number = 10): Promise<BullrhunCycle[]> {
    return this.findMany({}, {
      limit,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async findPendingCycles(): Promise<BullrhunCycle[]> {
    return this.findMany(
      { status: CycleStatus.PENDING },
      {
        orderBy: 'created_at',
        orderDirection: 'asc',
      }
    );
  }

  async getCompletedCyclesCount(): Promise<number> {
    return this.count({ status: CycleStatus.COMPLETED });
  }

  async getFailedCyclesCount(): Promise<number> {
    return this.count({ status: CycleStatus.FAILED });
  }

  async getCyclesInDateRange(
    startDate: string, 
    endDate: string
  ): Promise<BullrhunCycle[]> {
    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      this.handleDatabaseError(error, 'getCyclesInDateRange');
    }

    return data || [];
  }

  async getLastSuccessfulCycle(mint?: string): Promise<BullrhunCycle | null> {
    const conditions = { status: CycleStatus.COMPLETED } as any;
    if (mint) conditions.mint = mint;

    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('*')
      .match(conditions)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.handleDatabaseError(error, 'getLastSuccessfulCycle');
    }

    return data || null;
  }

  async getRunningCycles(): Promise<BullrhunCycle[]> {
    return this.findMany(
      { status: CycleStatus.PENDING },
      {
        orderBy: 'created_at',
        orderDirection: 'asc',
      }
    );
  }

  async getCycleWithSignatures(id: string): Promise<BullrhunCycle | null> {
    return this.findById(id);
  }

  // Get total fees collected across all cycles
  async getTotalFeesCollected(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('fee_amount_sol')
      .eq('status', CycleStatus.COMPLETED);

    if (error) {
      this.handleDatabaseError(error, 'getTotalFeesCollected');
    }

    return data?.reduce((total, cycle) => total + (cycle.fee_amount_sol || 0), 0) || 0;
  }

  // Get total amount spent on buys across all cycles
  async getTotalBuyAmount(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('buy_amount_sol')
      .eq('status', CycleStatus.COMPLETED);

    if (error) {
      this.handleDatabaseError(error, 'getTotalBuyAmount');
    }

    return data?.reduce((total, cycle) => total + (cycle.buy_amount_sol || 0), 0) || 0;
  }

  // Get cycle statistics for a time period
  async getCycleStats(
    startDate?: string, 
    endDate?: string
  ): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    totalFees: number;
    totalBuys: number;
    totalRewards: number;
  }> {
    let query = supabaseAdmin
      .from('bullrhun_cycles')
      .select('status, fee_amount_sol, buy_amount_sol, reward_amount_sol');

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getCycleStats');
    }

    const cycles = data || [];
    const completed = cycles.filter(c => c.status === CycleStatus.COMPLETED);
    const failed = cycles.filter(c => c.status === CycleStatus.FAILED);
    const pending = cycles.filter(c => c.status === CycleStatus.PENDING);

    return {
      total: cycles.length,
      completed: completed.length,
      failed: failed.length,
      pending: pending.length,
      totalFees: completed.reduce((sum, c) => sum + (c.fee_amount_sol || 0), 0),
      totalBuys: completed.reduce((sum, c) => sum + (c.buy_amount_sol || 0), 0),
      totalRewards: completed.reduce((sum, c) => sum + (c.reward_amount_sol || 0), 0),
    };
  }

  // Enhanced cycle methods for 11-step flow

  async updateStep(
    id: string, 
    step: number, 
    status: string, 
    details?: any
  ): Promise<void> {
    const updateData: Partial<BullrhunCycle> = {
      current_step: step,
      step_status: status,
      step_details: details || {},
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.handleDatabaseError(error, 'updateStep');
    }
  }

  async updateWinner(
    id: string, 
    winnerAddress: string, 
    rewardAmount: number
  ): Promise<void> {
    const updateData: Partial<BullrhunCycle> = {
      winner_address: winnerAddress,
      winner_reward_amount: rewardAmount,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.handleDatabaseError(error, 'updateWinner');
    }
  }

  async getRecentCyclesWithWinner(limit: number = 10): Promise<BullrhunCycle[]> {
    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('*')
      .not('winner_address', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.handleDatabaseError(error, 'getRecentCyclesWithWinner');
    }

    return data || [];
  }

  async getCurrentRunningCycle(): Promise<BullrhunCycle | null> {
    const { data, error } = await supabaseAdmin
      .from('bullrhun_cycles')
      .select('*')
      .eq('status', CycleStatus.PENDING)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.handleDatabaseError(error, 'getCurrentRunningCycle');
    }

    return data || null;
  }
}