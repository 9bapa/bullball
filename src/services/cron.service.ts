import { CycleService } from '@/services/cycle.service';
import { CycleRepository } from '@/repositories';
import { ListenerRepository } from '@/repositories';
import { config, FEATURES, CONSTANTS } from '@/config';
import { getTradeListener } from '@/services/trade-listener.service';
import { CycleStatus } from '@/types/bullrhun.types';

export class CronJobManager {
  private cycleService: CycleService;
  private cycleRepo: CycleRepository;
  private listenerRepo: ListenerRepository;
  private isRunning: boolean = false;
  private lastExecution: Date | null = null;
  private executionCount: number = 0;
  private activityLog: Array<{ timestamp: Date; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = [];
  private activityCallbacks: Array<(activities: any[]) => void> = [];

  constructor() {
    this.cycleService = new CycleService();
    this.cycleRepo = new CycleRepository();
    this.listenerRepo = new ListenerRepository();
    
    // Initialize trade listener to ensure it's running
    try {
      getTradeListener();
    } catch (error) {
      console.error('Failed to initialize trade listener:', error);
    }
  }

  // Add activity logging methods
  private logActivity(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const activity = {
      timestamp: new Date(),
      message,
      type
    };
    this.activityLog.push(activity);
    
    // Keep only last 50 activities
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(-50);
    }
    
    // Notify listeners
    this.activityCallbacks.forEach(callback => callback([activity]));
    
    // Also log to console
    const emoji = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }

  public getActivityLog(): Array<{ timestamp: Date; message: string; type: 'info' | 'success' | 'warning' | 'error' }> {
    return this.activityLog;
  }

  public onActivity(callback: (activities: any[]) => void): void {
    this.activityCallbacks.push(callback);
  }

  public offActivity(callback: (activities: any[]) => void): void {
    const index = this.activityCallbacks.indexOf(callback);
    if (index > -1) {
      this.activityCallbacks.splice(index, 1);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logActivity('Cron job already running', 'warning');
      return;
    }

    this.isRunning = true;
    this.logActivity('🚀 Starting BullRhun cron job manager', 'info');
    this.logActivity(`📅 Schedule: ${CONSTANTS.CRON_SCHEDULE} (every 2 minutes)`, 'info');
    this.logActivity(`🎯 Target Mint: ${config.BULLRHUN_MINT || 'NOT_CONFIGURED'}`, 'info');

    // Start main cron loop
    this.runCronLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.logActivity('🛑 Cron job stopped', 'warning');
  }

  private async runCronLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.executeCycle();
        await this.waitForNextExecution();
      } catch (error) {
        console.error('❌ Cron job error:', error);
        // Wait before retrying
        await this.sleep(CONSTANTS.DEFAULT_TIMEOUT);
      }
    }
  }

  private async executeCycle(): Promise<void> {
    const startTime = new Date();
    
    try {
      this.logActivity(`⏰ Executing cycle at ${startTime.toISOString()}`, 'info');
      
      // Check if we should execute cycle (health check)
      const healthStatus = await this.checkSystemHealth();
      if (!healthStatus.isHealthy) {
        this.logActivity(`⚠️ System not healthy, skipping cycle: ${healthStatus.issues.join(', ')}`, 'warning');
        return;
      }

      // Check for running cycles and cleanup stuck ones
      const runningCycles = await this.cycleService.getRunningCycles();
      
      // Auto-cleanup stuck cycles (older than 10 minutes)
      const stuckCycles = runningCycles.filter(cycle => {
        const created = new Date(cycle.created_at);
        const now = new Date();
        const minutesAgo = (now.getTime() - created.getTime()) / (1000 * 60);
        return minutesAgo > 10;
      });
      
      if (stuckCycles.length > 0) {
        this.logActivity(`🔧 Found ${stuckCycles.length} stuck cycles, cleaning up...`, 'warning');
        
        for (const stuckCycle of stuckCycles) {
          await this.cycleRepo.updateCycleStatus(
            stuckCycle.id,
            CycleStatus.FAILED,
            {},
            `Auto-cleanup: Cycle stuck for more than 10 minutes`
          );
          this.logActivity(`🧹 Marked cycle ${stuckCycle.id.substring(0, 8)} as failed (stuck)`, 'warning');
        }
        
        // Re-check after cleanup
        const remainingCycles = runningCycles.filter(cycle => 
          !stuckCycles.some(stuck => stuck.id === cycle.id)
        );
        
        if (remainingCycles.length > 0) {
          this.logActivity(`⚠️ ${remainingCycles.length} cycles still running, skipping execution`, 'warning');
          return;
        }
      } else if (runningCycles.length > 0) {
        this.logActivity(`⚠️ ${runningCycles.length} cycles already running, skipping execution`, 'warning');
        return;
      }

      this.logActivity('🔄 Starting cycle execution', 'info');
      // Execute the main cycle
      const result = await this.cycleService.executeCycle();
      
      if (result.error) {
        this.logActivity(`❌ Cycle failed: ${result.error}`, 'error');
        await this.handleFailedCycle(result);
      } else {
        this.logActivity('✅ Cycle completed successfully', 'success');
        await this.handleSuccessfulCycle(result);
      }

      this.lastExecution = new Date();
      this.executionCount++;

    } catch (error) {
      console.error('❌ Unexpected error during cycle execution:', error);
      throw error;
    }
  }

  private async checkSystemHealth(): Promise<{
    isHealthy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check listener health
    const listenerHealth = await this.listenerRepo.isHealthy();
    if (!listenerHealth) {
      issues.push('Listener is not responding');
    }

    // Check feature configurations
    if (FEATURES.LIQUIDITY_ENABLED && !config.PUMPSWAP_POOL) {
      issues.push('Liquidity enabled but no pool configured');
    }

    if (FEATURES.REWARDS_ENABLED && !config.WALLET_REWARD) {
      issues.push('Rewards enabled but no reward address configured');
    }

    // Check essential configurations
    if (!config.BULLRHUN_MINT) {
      issues.push('No mint configured');
    }

    if (!config.WALLET_DEV) {
      issues.push('No wallet private key configured');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
    };
  }

  private async handleSuccessfulCycle(result: any): Promise<void> {
    try {
      // Update listener heartbeat
      await this.listenerRepo.updateHeartbeat();
      
      // Log success metrics
      console.log('📊 Cycle Success Metrics:', {
        cycleId: result.cycle.id,
        feeSignature: !!result.feeSignature,
        buySignature: !!result.buySignature,
        liquiditySignature: !!result.liquiditySignature,
        rewardSignature: !!result.rewardSignature,
      });
    } catch (error) {
      console.error('Failed to handle successful cycle:', error);
    }
  }

  private async handleFailedCycle(result: any): Promise<void> {
    try {
      console.error('📊 Cycle Failure Analysis:', {
        cycleId: result.cycle.id,
        error: result.error,
        status: result.cycle.status,
        executedAt: result.cycle.executed_at,
      });

      // Don't update listener heartbeat on failure
      // Next cycle will attempt to fix issues
    } catch (error) {
      console.error('Failed to handle failed cycle:', error);
    }
  }

  private async waitForNextExecution(): Promise<void> {
    // Wait exactly 2 minutes (120 seconds) until next execution
    const waitTime = 120000; // 2 minutes in milliseconds
    
    console.log(`⏳ Next cycle in 2 minutes (${new Date(Date.now() + waitTime).toISOString()})`);
    
    await this.sleep(waitTime);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for monitoring
  getStatus(): {
    isRunning: boolean;
    lastExecution: Date | null;
    executionCount: number;
    uptime: number;
    activities: Array<{ timestamp: Date; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
  } {
    return {
      isRunning: this.isRunning,
      lastExecution: this.lastExecution,
      executionCount: this.executionCount,
      uptime: this.isRunning ? Date.now() - (this.lastExecution?.getTime() || Date.now()) : 0,
      activities: this.activityLog,
    };
  }

  // Emergency methods
  async forceExecution(): Promise<void> {
    console.log('🚨 Force executing cycle');
    await this.executeCycle();
  }

  async emergencyStop(): Promise<void> {
    console.log('🚨 Emergency stop activated');
    await this.stop();
  }
}

// Singleton instance for the application
let cronManager: CronJobManager | null = null;

export function getCronManager(): CronJobManager {
  if (!cronManager) {
    cronManager = new CronJobManager();
    // Auto-start cron when first created
    cronManager.start().catch(error => {
      console.error('Failed to auto-start cron manager:', error);
    });
  }
  return cronManager;
}

// CronJobManager is already exported through getCronManager function above