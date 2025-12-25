import { BaseRepository } from './base.repository';
import { 
  BullrhunLiquidityEvent, 
  CreateLiquidityEventData,
  OperationStatus 
} from '@/types/bullrhun.types';
import { supabaseAdmin } from '@/lib/supabase';

export class LiquidityRepository extends BaseRepository<BullrhunLiquidityEvent> {
  constructor() {
    super('bullrhun_liquidity_events');
  }

  async createLiquidityEvent(data: CreateLiquidityEventData): Promise<BullrhunLiquidityEvent> {
    return this.create({
      ...data,
      status: OperationStatus.PENDING,
    });
  }

  async findByMint(mint: string): Promise<BullrhunLiquidityEvent[]> {
    return this.findMany({ mint });
  }

  async findByCycleId(cycleId: string): Promise<BullrhunLiquidityEvent[]> {
    return this.findMany({ cycle_id: cycleId });
  }

  async findByPoolKey(poolKey: string): Promise<BullrhunLiquidityEvent[]> {
    return this.findMany({ pool_key: poolKey });
  }

  async updateLiquidityStatus(
    id: string, 
    status: OperationStatus,
    signatures?: {
      deposit_signature?: string;
      burn_signature?: string;
    },
    errorMessage?: string
  ): Promise<BullrhunLiquidityEvent> {
    const updateData: Partial<BullrhunLiquidityEvent> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (signatures) {
      Object.assign(updateData, signatures);
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    return this.update(id, updateData);
  }

  async getLiquidityEventsByStatus(status: OperationStatus): Promise<BullrhunLiquidityEvent[]> {
    return this.findMany({ status });
  }

  async getPendingLiquidityEvents(): Promise<BullrhunLiquidityEvent[]> {
    return this.getLiquidityEventsByStatus(OperationStatus.PENDING);
  }

  async getCompletedLiquidityEvents(): Promise<BullrhunLiquidityEvent[]> {
    return this.getLiquidityEventsByStatus(OperationStatus.COMPLETED);
  }

  async getFailedLiquidityEvents(): Promise<BullrhunLiquidityEvent[]> {
    return this.getLiquidityEventsByStatus(OperationStatus.FAILED);
  }

  async getTotalLiquidityProvided(mint?: string): Promise<number> {
    let query = supabaseAdmin
      .from('bullrhun_liquidity_events')
      .select('deposit_amount_sol')
      .eq('status', OperationStatus.COMPLETED);

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTotalLiquidityProvided');
    }

    return data?.reduce((total, event) => total + (event.deposit_amount_sol || 0), 0) || 0;
  }

  async getTotalTokensBurned(mint?: string): Promise<number> {
    let query = supabaseAdmin
      .from('bullrhun_liquidity_events')
      .select('burn_amount_tokens')
      .eq('status', OperationStatus.COMPLETED);

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getTotalTokensBurned');
    }

    return data?.reduce((total, event) => total + (event.burn_amount_tokens || 0), 0) || 0;
  }

  async getLiquidityStats(mint?: string): Promise<{
    totalEvents: number;
    completedEvents: number;
    failedEvents: number;
    pendingEvents: number;
    totalLiquiditySol: number;
    totalTokensBurned: number;
    averageLiquidityPerEvent: number;
  }> {
    let query = supabaseAdmin
      .from('bullrhun_liquidity_events')
      .select('status, deposit_amount_sol, burn_amount_tokens');

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getLiquidityStats');
    }

    const events = data || [];
    const completed = events.filter(e => e.status === OperationStatus.COMPLETED);
    const failed = events.filter(e => e.status === OperationStatus.FAILED);
    const pending = events.filter(e => e.status === OperationStatus.PENDING);
    const totalLiquiditySol = completed.reduce((sum, e) => sum + (e.deposit_amount_sol || 0), 0);

    return {
      totalEvents: events.length,
      completedEvents: completed.length,
      failedEvents: failed.length,
      pendingEvents: pending.length,
      totalLiquiditySol,
      totalTokensBurned: completed.reduce((sum, e) => sum + (e.burn_amount_tokens || 0), 0),
      averageLiquidityPerEvent: completed.length > 0 ? totalLiquiditySol / completed.length : 0,
    };
  }

  async getRecentLiquidityEvents(limit: number = 10): Promise<BullrhunLiquidityEvent[]> {
    return this.findMany({}, {
      limit,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async getLiquidityEventsInPeriod(
    startDate: string, 
    endDate: string, 
    mint?: string
  ): Promise<BullrhunLiquidityEvent[]> {
    let query = supabaseAdmin
      .from('bullrhun_liquidity_events')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (mint) {
      query = query.eq('mint', mint);
    }

    const { data, error } = await query;

    if (error) {
      this.handleDatabaseError(error, 'getLiquidityEventsInPeriod');
    }

    return data || [];
  }
}