import { CycleService } from '@/services/cycle.service';
import { LeaderRepository, ListenerRepository } from '@/repositories';
import { config } from '@/config';
import { getTradeListener } from '@/services/trade-listener.service';
import { supabaseAdmin } from '@/lib/supabase';

export class IntervalService {
  private cycleService: CycleService;
  private leaderRepo: LeaderRepository;
  private listenerRepo: ListenerRepository;
  private intervalMs: number = 120000; // 2 minute intervals
  private intervalId: NodeJS.Timeout | null = null;
  private instanceId: string;
  private isRunning: boolean = false;

  constructor() {
    this.cycleService = new CycleService();
    this.leaderRepo = new LeaderRepository();
    this.listenerRepo = new ListenerRepository();
    
    // Generate unique instance ID
    this.instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🆔 IntervalService instance: ${this.instanceId}`);
    
    // Initialize trade listener
    getTradeListener();
  }

  // Add activity logging methods
  private logActivity(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const activity = {
      timestamp: new Date(),
      message,
      type
    };
    
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Store in global activities array for UI
    if (typeof global !== 'undefined' && !global.activities) {
      global.activities = [];
    }
    if (typeof global !== 'undefined') {
      global.activities.push(activity);
      // Keep only last 50 activities
      global.activities = global.activities.slice(-50);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🎧 Interval service already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting interval service');
    console.log(`⏰ Interval: ${this.intervalMs}ms (${this.intervalMs / 1000}s)`);
    console.log(`🎯 Target Mint: ${config.BULLRHUN_MINT}`);

    // Try to become leader immediately
    await this.tryBecomeLeader();
    
    // Start interval for polling
    this.intervalId = setInterval(async () => {
      await this.pollAndExecute();
    }, this.intervalMs);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Remove leadership using supabaseAdmin
    try {
      await supabaseAdmin
        .from('bullrhun_leaders')
        .update({
          instance_id: null,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('instance_id', this.instanceId);
    } catch (error) {
      console.error('Failed to remove leadership:', error instanceof Error ? error.message : String(error));
    }
    
    console.log('🛑 Interval service stopped');
  }

  private async tryBecomeLeader(): Promise<void> {
    try {
      await this.leaderRepo.claimLeadership(this.instanceId);
      this.logActivity('🏆 Became leader - now controlling intervals', 'success');
    } catch (error) {
      console.error('Failed to become leader:', error instanceof Error ? error.message : String(error));
    }
    this.logActivity('Waiting for leadership...', 'info');
  }

  private async pollAndExecute(): Promise<void> {
    try {
      // Check if we're still the leader
      const isLeader = await this.leaderRepo.isLeader(this.instanceId);
      
      if (!isLeader) {
        // Try to become leader again
        await this.tryBecomeLeader();
        return;
      }

      // Update our heartbeat as leader
      await this.leaderRepo.updateHeartbeat(this.instanceId);

      // Check system health
      const healthStatus = await this.checkSystemHealth();
      
      if (!healthStatus.isHealthy) {
        this.logActivity(`⚠️ System not healthy: ${healthStatus.reason}`, 'warning');
        return;
      }

      // Execute cycle if it's time (every 2 minutes = 120 seconds)
      const lastCycle = await this.getLastCycleTime();
      const now = Date.now();
      const timeSinceLastCycle = lastCycle ? now - lastCycle : Infinity;
      
      if (timeSinceLastCycle >= 120000) { // 2 minutes
        await this.executeCycle();
      }

    } catch (error) {
      console.error('Poll and execute error:', error instanceof Error ? error.message : String(error));
      this.logActivity(`❌ Polling error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }

  private async checkSystemHealth(): Promise<{ isHealthy: boolean; reason?: string }> {
    try {
      const listenerStatus = await this.listenerRepo.getHealthStatus();
      
      if (!listenerStatus.isHealthy) {
        return { 
          isHealthy: false, 
          reason: 'Listener not responding' 
        };
      }
      
      return { isHealthy: true };
    } catch (error) {
      return { 
        isHealthy: false, 
        reason: `Health check failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  private async executeCycle(): Promise<void> {
    try {
      this.logActivity('🔄 Starting cycle execution', 'info');
      
      const result:any = await this.cycleService.executeCycle();
      
      if (result.success) {
        this.logActivity('✅ Cycle completed successfully', 'success');
      } else {
        this.logActivity(`❌ Cycle failed: ${result.error}`, 'error');
      }
    } catch (error) {
      this.logActivity(`❌ Cycle execution error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }

  private async getLastCycleTime(): Promise<number | null> {
    try {
      const { data } = await supabaseAdmin
        .from('bullrhun_cycles')
        .select('executed_at')
        .not('isnull', 'executed_at')
        .order('executed_at', { ascending: false })
        .limit(1)
        .single();
      
      return data?.executed_at ? new Date(data.executed_at).getTime() : null;
    } catch {
      return null;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      instanceId: this.instanceId,
      interval: this.intervalMs,
      isLeader: async () => this.leaderRepo.isLeader(this.instanceId)
    };
  }
}

// Singleton pattern
let intervalService: IntervalService | null = null;

export function getIntervalService(): IntervalService {
  if (!intervalService) {
    intervalService = new IntervalService();
    // Auto-start when first created
    intervalService.start().catch(error => {
      console.error('Failed to auto-start interval service:', error instanceof Error ? error.message : String(error));
    });
  }
  return intervalService;
}