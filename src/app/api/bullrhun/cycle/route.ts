import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CycleService } from '@/services/cycle.service';
import { getCronManager } from '@/services/cron.service';
import { MetricsRepository } from '@/repositories';
import { config, CONSTANTS } from '@/config';
import { ValidationError } from '@/types/bullrhun.types';

const cycleService = new CycleService();
const metricsRepo = new MetricsRepository();
const cronManager = getCronManager();

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    if (!config.BULLRHUN_MINT) {
      throw new ValidationError('BULLRHUN_MINT not configured');
    }

    // Check if cron is handling this automatically
    console.log('📥 Manual cycle execution requested');
    
    // Execute cycle (this is now a fallback/manual trigger)
    const body = await request.json();
    const result = await cycleService.executeCycle(body.mint);
    
    if (result.error) {
      return NextResponse.json(
        { 
          error: result.error,
          cycleId: result.cycle.id,
          status: result.cycle.status,
        },
        { status: 500 }
      );
    }

    // Calculate next cycle time (now handled by cron)
    const nextCycleIn = config.RATE_LIMIT_CYCLE_SECONDS;

    return NextResponse.json({
      cycleId: result.cycle.id,
      feeSignature: result.feeSignature,
      buySignature: result.buySignature,
      liquiditySignature: result.liquiditySignature,
      rewardSignature: result.rewardSignature,
      status: result.cycle.status,
      executedAt: result.cycle.executed_at,
      nextCycleIn,
      message: 'Cycle completed successfully',
    });

  } catch (error) {
    console.error('POST /api/bullrhun/cycle error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get cycle history
    const cycles = await cycleService.getCycleHistory(config.BULLRHUN_MINT, 20);
    
    // Get metrics
    const metrics = await metricsRepo.getMetrics();
    
    // Get cron status
    const cronStatus = cronManager.getStatus();

    // Calculate next cycle time
    const nextCycleIn = config.RATE_LIMIT_CYCLE_SECONDS;
    
    return NextResponse.json({
      cycles: cycles.map(cycle => ({
        id: cycle.id,
        mint: cycle.mint,
        status: cycle.status,
        feeAmountSol: cycle.fee_amount_sol,
        buyAmountSol: cycle.buy_amount_sol,
        liquidityAmountSol: cycle.liquidity_amount_sol,
        rewardAmountSol: cycle.reward_amount_sol,
        feeSignature: cycle.fee_signature,
        buySignature: cycle.buy_signature,
        liquiditySignature: cycle.liquidity_signature,
        rewardSignature: cycle.reward_signature,
        errorMessage: cycle.error_message,
        executedAt: cycle.executed_at,
        createdAt: cycle.created_at,
      })),
      metrics: {
        totalCycles: metrics.total_cycles,
        totalFeesCollected: metrics.total_fees_collected,
        totalTrades: metrics.total_trades,
        totalRewardsSent: metrics.total_rewards_sent,
        currentSolPrice: metrics.current_sol_price,
        lastCycleAt: metrics.last_cycle_at,
        nextCycleIn,
      },
      cronStatus: {
        isRunning: cronStatus.isRunning,
        lastExecution: cronStatus.lastExecution,
        executionCount: cronStatus.executionCount,
        uptime: cronStatus.uptime,
        schedule: CONSTANTS.CRON_SCHEDULE,
      },
      config: {
        mint: config.BULLRHUN_MINT,
        features: {
          liquidityEnabled: !!config.PUMPSWAP_POOL,
          rewardsEnabled: !!config.WALLET_REWARD,
          platformFeesEnabled: !!config.WALLET_PLATFORM,
        },
        limits: {
          cycleInterval: config.RATE_LIMIT_CYCLE_SECONDS,
          minBuyAmount: config.MIN_BUY_AMOUNT_SOL,
          minGiftTradeAmount: config.MIN_GIFT_TRADE_AMOUNT,
        },
      },
    });

  } catch (error) {
    console.error('GET /api/bullrhun/cycle error:', error);
    return NextResponse.json(
      { error: 'Failed to get cycle data' },
      { status: 500 }
    );
  }
}