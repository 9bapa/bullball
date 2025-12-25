import { NextResponse } from 'next/server';
import { ListenerRepository, TradeRepository } from '@/repositories';
import { config } from '@/config';

const listenerRepo = new ListenerRepository();
const tradeRepo = new TradeRepository();

export async function GET() {
  try {
    // Get detailed listener status
    const healthStatus = await listenerRepo.getHealthStatus();
    const stats = await listenerRepo.getListenerStats();
    
    // Get recent trades
    const recentTrades = await tradeRepo.findRecentTrades(
      healthStatus.monitoredMint || config.BULLRHUN_MINT || '', 
      20
    );

    return NextResponse.json({
      // Health status
      health: {
        isHealthy: healthStatus.isHealthy,
        lastHeartbeat: healthStatus.lastHeartbeat,
        minutesSinceHeartbeat: healthStatus.minutesSinceHeartbeat,
        status: healthStatus.isHealthy ? 'online' : 'offline',
      },

      // Monitoring configuration
      monitoring: {
        mint: healthStatus.monitoredMint,
        tradeThreshold: healthStatus.tradeThreshold,
        currentTradeCount: healthStatus.currentTradeCount,
        thresholdProgress: healthStatus.thresholdProgress,
        isThresholdMet: stats.isThresholdMet,
      },

      // Statistics
      stats: {
        totalTradesMonitored: stats.totalTradesMonitored,
        currentThreshold: stats.currentThreshold,
        currentCount: stats.currentCount,
        progressPercentage: stats.progressPercentage,
        estimatedNextReward: stats.estimatedNextReward,
        nextThresholdReset: stats.isThresholdMet ? 'After reward distribution' : 'Not met yet',
      },

      // Recent activity
      recentTrades: recentTrades.map(trade => ({
        signature: trade.signature,
        venue: trade.venue,
        amountSol: trade.amount_sol,
        amountTokens: trade.amount_tokens,
        pricePerToken: trade.price_per_token,
        traderAddress: trade.trader_address,
        isSystemBuy: trade.is_system_buy,
        isQualifying: (trade.amount_sol || 0) >= config.MIN_GIFT_TRADE_AMOUNT,
        createdAt: trade.created_at,
      })),

      // Configuration
      config: {
        minGiftTradeAmount: config.MIN_GIFT_TRADE_AMOUNT,
        rewardMode: config.REWARD_MODE,
        rewardsEnabled: !!config.WALLET_REWARD,
        rewardAddress: '',
      },

      // Timestamp
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GET /api/bullrhun/listener/status error:', error);
    return NextResponse.json(
      { error: 'Failed to get listener status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mint, action } = body;

    switch (action) {
      case 'update_mint':
        if (!mint) {
          return NextResponse.json(
            { error: 'Mint is required for update_mint action' },
            { status: 400 }
          );
        }

        const updatedListener = await listenerRepo.updateMonitoredMint(mint || config.BULLRHUN_MINT || '');
        return NextResponse.json({
          message: 'Monitored mint updated',
          mint: updatedListener.monitored_mint,
          timestamp: updatedListener.updated_at,
        });

      case 'reset_threshold':
        const newThreshold = Math.floor(30 + Math.random() * 271);
        const resetListener = await listenerRepo.updateTradeThreshold(newThreshold, 0);
        
        return NextResponse.json({
          message: 'Trade threshold reset',
          newThreshold,
          currentCount: resetListener.current_trade_count,
          timestamp: resetListener.updated_at,
        });

      case 'heartbeat':
        const heartbeatListener = await listenerRepo.updateHeartbeat(mint);
        
        return NextResponse.json({
          message: 'Heartbeat updated',
          lastHeartbeat: heartbeatListener.last_heartbeat,
          monitoredMint: heartbeatListener.monitored_mint,
        });

      case 'handle_trade':
        const { amountSol, traderAddress } = body;
        if (!amountSol || !traderAddress) {
          return NextResponse.json(
            { error: 'amountSol and traderAddress required for handle_trade action' },
            { status: 400 }
          );
        }

        const tradeResult = await listenerRepo.handleTradeEvent(amountSol);
        
        return NextResponse.json({
          message: 'Trade handled',
          isQualifyingTrade: tradeResult.isQualifyingTrade,
          newCount: tradeResult.newCount,
          thresholdMet: tradeResult.thresholdMet,
          newThreshold: tradeResult.newThreshold,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: update_mint, reset_threshold, heartbeat, handle_trade' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('POST /api/bullrhun/listener/status error:', error);
    return NextResponse.json(
      { error: 'Failed to update listener status' },
      { status: 500 }
    );
  }
}