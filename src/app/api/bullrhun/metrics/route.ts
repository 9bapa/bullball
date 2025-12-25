import { NextResponse } from 'next/server';
import { MetricsRepository, CycleRepository, TradeRepository, RewardRepository, LiquidityRepository, ListenerRepository, BroadcastRepository } from '@/repositories';
import { getCronManager } from '@/services/cron.service';
import { config } from '@/config';
import { getBalance } from '@/lib/solana';

const metricsRepo = new MetricsRepository();
const cycleRepo = new CycleRepository();
const tradeRepo = new TradeRepository();
const rewardRepo = new RewardRepository();
const liquidityRepo = new LiquidityRepository();
const listenerRepo = new ListenerRepository();
const broadcastRepo = new BroadcastRepository();
const cronManager = getCronManager();

export async function GET() {
  try {
    // Get basic metrics
    const baseMetrics = await metricsRepo.getMetrics();
    
    // Get detailed stats
    const [cycleStats, tradeStats, rewardStats, liquidityStats, healthStatus, listenerStatus] = await Promise.all([
      cycleRepo.getCycleStats(),
      tradeRepo.getTradeStats(),
      rewardRepo.getRewardsStats(),
      liquidityRepo.getLiquidityStats(),
      metricsRepo.getHealthStatus(),
      listenerRepo.getListener(),
    ]);

    // Get recent activity
    const [recentCycles, recentTrades, recentRewards] = await Promise.all([
      cycleRepo.findRecentCycles(5),
      tradeRepo.findRecentTrades(config.BULLRHUN_MINT || '', 10),
      rewardRepo.getRecentRewards(5),
    ]);

    // Get environment wallet addresses

    return NextResponse.json({
      // Basic metrics
      overview: {
        totalCycles: baseMetrics.total_cycles,
        totalFeesCollected: baseMetrics.total_fees_collected,
        totalTrades: baseMetrics.total_trades,
        totalRewardsSent: baseMetrics.total_rewards_sent,
        currentSolPrice: baseMetrics.current_sol_price,
        lastCycleAt: baseMetrics.last_cycle_at,
        nextCycleIn: 120, // 2 minutes for cron
        // Enhanced metrics for 11-step flow
        totalTokensBought: baseMetrics.total_tokens_bought || 0,
        totalGiftsSent: baseMetrics.total_gifts_sent || 0,
        totalSolSpent: baseMetrics.total_sol_spent || 0,
      },

      // Detailed statistics
      cycles: {
        ...cycleStats,
        successRate: cycleStats.total > 0 ? ((cycleStats.completed / cycleStats.total) * 100) : 0,
        averageFeesPerCycle: cycleStats.completed > 0 ? (cycleStats.totalFees / cycleStats.completed) : 0,
      },

      trades: {
        ...tradeStats,
        userTradePercentage: tradeStats.totalTrades > 0 ? 
          ((tradeStats.userTrades / tradeStats.totalTrades) * 100) : 0,
      },

      rewards: {
        ...rewardStats,
        averageRewardSize: rewardStats.totalRewards > 0 ? 
          (rewardStats.totalAmount / rewardStats.totalRewards) : 0,
      },

      liquidity: {
        ...liquidityStats,
        successRate: liquidityStats.totalEvents > 0 ? 
          ((liquidityStats.completedEvents / liquidityStats.totalEvents) * 100) : 0,
      },

      // System health
      health: {
        ...healthStatus,
        status: healthStatus.isHealthy ? 'healthy' : 'unhealthy',
        issues: healthStatus.isHealthy ? [] : [
          healthStatus.lastCycleAge > 10 ? 'Last cycle too old' : null,
          healthStatus.cyclesInLast24h < 12 ? 'Low cycle frequency' : null,
          healthStatus.errorRate > 0.1 ? 'High error rate' : null,
        ].filter(Boolean),
      },

      // Environment wallets
      dev_wallet: {
        address: config.WALLET_DEV,
        rewardAddress: config.WALLET_REWARD,
        rewardBalance: config.WALLET_REWARD ? await getBalance(config.WALLET_REWARD) : 0, // getBalance already returns SOL
      },

      // Trade goal information
      trade_goal: {
        current_goal: listenerStatus.trade_goal,
        current_count: listenerStatus.current_trade_count,
        minimum_trade_amount: listenerStatus.minimum_trade_amount,
        last_winner_address: listenerStatus.last_winner_address,
        last_winner_at: listenerStatus.last_winner_at,
        progress_percentage: listenerStatus.current_trade_count > 0 ? 
          (listenerStatus.current_trade_count / listenerStatus.trade_goal) * 100 : 0,
      },

      // Recent activity
      recent: {
        cycles: recentCycles.map(cycle => ({
          id: cycle.id,
          status: cycle.status,
          feeAmountSol: cycle.fee_amount_sol,
          buyAmountSol: cycle.buy_amount_sol,
          createdAt: cycle.created_at,
          executedAt: cycle.executed_at,
        })),
        trades: recentTrades.map(trade => ({
          signature: trade.signature,
          venue: trade.venue,
          amountSol: trade.amount_sol,
          isSystemBuy: trade.is_system_buy,
          createdAt: trade.created_at,
        })),
        rewards: recentRewards.map(reward => ({
          toAddress: reward.to_address,
          amountSol: reward.amount_sol,
          mode: reward.mode,
          createdAt: reward.created_at,
        })),
      },

      // Real-time broadcasts (with fallback)
      broadcasts: (() => {
        try {
          return broadcastRepo.getRecentBroadcasts(10);
        } catch (error) {
          console.warn('Broadcasts not available:', error);
          return [];
        }
      })(),

      // Timestamp
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GET /api/bullrhun/metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}