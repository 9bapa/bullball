import { BaseRepository } from './base.repository';
import { supabase } from '@/lib/supabase';

export interface Broadcast {
  id: number;
  related_cycle_id: string | null;
  message_content: string;
  message_type: 'step_update' | 'winner_announcement' | 'goal_reset' | 'liquidity_added' | 'reward_distributed';
  metadata?: any;
  broadcast_at: string;
}

export interface CreateBroadcastData {
  related_cycle_id?: string | null;
  message_content: string;
  message_type: Broadcast['message_type'];
  metadata?: any;
}

export class BroadcastRepository extends BaseRepository<Broadcast> {
  constructor() {
    super('bullrhun_broadcasts');
  }

  async createBroadcast(data: CreateBroadcastData): Promise<Broadcast> {
    const { data: broadcast, error } = await supabase
      .from(this.tableName)
      .insert({
        related_cycle_id: data.related_cycle_id || null,
        message_content: data.message_content,
        message_type: data.message_type,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return broadcast;
  }

  async getRecentBroadcasts(limit: number = 50): Promise<Broadcast[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('broadcast_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getBroadcastsByType(type: Broadcast['message_type'], limit: number = 20): Promise<Broadcast[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('message_type', type)
      .order('broadcast_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getBroadcastsByCycle(cycleId: string): Promise<Broadcast[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('related_cycle_id', cycleId)
      .order('broadcast_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async cleanupExpiredBroadcasts(): Promise<void> {
    // Skip cleanup for now since expires_at column might not exist in DB yet
    console.log('Skipping expired broadcast cleanup - expires_at column not available');
  }
}