import { BaseRepository } from './base.repository';
import { supabase } from '@/lib/supabase';

export interface LeaderRecord {
  id: number;
  instance_id: string;
  heartbeat: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export class LeaderRepository extends BaseRepository<LeaderRecord> {
  constructor() {
    super('bullrhun_leaders');
  }

  async getCurrentLeader(): Promise<LeaderRecord | null> {
    const { data } = await supabase
      .from('bullrhun_leaders')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  async claimLeadership(instanceId: string): Promise<LeaderRecord> {
    // First, deactivate all other leaders
    await supabase
      .from('bullrhun_leaders')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true)
      .neq('instance_id', instanceId);

    // Then try to become leader
    const { data, error } = await supabase
      .from('bullrhun_leaders')
      .upsert({
        id: 1,
        instance_id: instanceId,
        heartbeat: new Date().toISOString(),
        is_active: true,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateHeartbeat(instanceId: string): Promise<void> {
    await supabase
      .from('bullrhun_leaders')
      .update({
        heartbeat: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('instance_id', instanceId)
      .eq('is_active', true);
  }

  async isLeader(instanceId: string): Promise<boolean> {
    const leader = await this.getCurrentLeader();
    return leader?.instance_id === instanceId;
  }
}