import { BaseRepository } from './base.repository';
import { 
  BullrhunReward, 
  CreateRewardData 
} from '@/types/bullrhun.types';
import { supabase } from '@/lib/supabase';

const supabaseClient = supabase!;

export class RewardRepository extends BaseRepository<BullrhunReward> {
  constructor() {
    super('bullrhun_rewards');
  }

  async createReward(data: CreateRewardData): Promise<BullrhunReward> {
    return this.createWithServiceRole(data);
  }

  async findByCycleId(cycleId: string): Promise<BullrhunReward[]> {
    return this.findMany({ cycle_id: cycleId });
  }

  async findByRecipient(
    toAddress: string, 
    limit: number = 10
  ): Promise<BullrhunReward[]> {
    return this.findMany(
      { to_address: toAddress },
      {
        limit,
        orderBy: 'created_at',
        orderDirection: 'desc',
      }
    );
  }

  async getTotalRewardsSent(): Promise<number> {
    const { data, error } = await supabaseClient
      .from('bullrhun_rewards')
      .select('amount_sol');

    if (error) {
      this.handleDatabaseError(error, 'getTotalRewardsSent');
    }

    return data?.reduce((total, reward) => total + reward.amount_sol, 0) || 0;
  }

  async getRecentRewards(limit: number = 10): Promise<BullrhunReward[]> {
    return this.findMany({}, {
      limit,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async getRewardsInPeriod(
    startDate: string, 
    endDate: string
  ): Promise<BullrhunReward[]> {
    const { data, error } = await supabase
      .from('bullrhun_rewards')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      this.handleDatabaseError(error, 'getRewardsInPeriod');
    }

    return data || [];
  }

  async getRewardsStats(): Promise<{
    totalRewards: number;
    totalAmount: number;
    uniqueRecipients: number;
    lastTraderRewards: number;
    addressRewards: number;
  }> {
    const { data, error } = await supabase
      .from('bullrhun_rewards')
      .select('amount_sol, to_address, mode');

    if (error) {
      this.handleDatabaseError(error, 'getRewardsStats');
    }

    const rewards = data || [];
    const uniqueRecipients = new Set(rewards.map(r => r.to_address)).size;
    const lastTraderRewards = rewards.filter(r => r.mode === 'last-trader').length;
    const addressRewards = rewards.filter(r => r.mode === 'address').length;

    return {
      totalRewards: rewards.length,
      totalAmount: rewards.reduce((sum, r) => sum + r.amount_sol, 0),
      uniqueRecipients,
      lastTraderRewards,
      addressRewards,
    };
  }
}