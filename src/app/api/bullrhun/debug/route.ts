import { NextResponse } from 'next/server';
import { getCronManager } from '@/services/cron.service';
import { config, FEATURES } from '@/config';

export async function GET() {
  try {
    const cronManager = getCronManager();
    const cronStatus = cronManager.getStatus();
    
    // Check health status manually
    const healthChecks = {
      bullrhunMint: {
        configured: !!config.BULLRHUN_MINT,
        value: config.BULLRHUN_MINT || 'NOT_CONFIGURED'
      },
      walletDev: {
        configured: !!config.WALLET_DEV,
        value: config.WALLET_DEV ? 'CONFIGURED' : 'NOT_CONFIGURED'
      },
      walletPlatform: {
        configured: !!config.WALLET_PLATFORM,
        value: config.WALLET_PLATFORM || 'NOT_CONFIGURED'
      },
      walletReward: {
        configured: !!config.WALLET_REWARD,
        value: config.WALLET_REWARD || 'NOT_CONFIGURED'
      },
      pumpswapPool: {
        configured: !!config.PUMPSWAP_POOL,
        value: config.PUMPSWAP_POOL || 'NOT_CONFIGURED'
      },
      pumpPortalApiKey: {
        configured: !!config.PUMPPORTAL_API_KEY,
        value: config.PUMPPORTAL_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED'
      }
    };

    const features = {
      liquidityEnabled: FEATURES.LIQUIDITY_ENABLED,
      rewardsEnabled: FEATURES.REWARDS_ENABLED,
      platformFeesEnabled: FEATURES.PLATFORM_FEES_ENABLED,
      cronEnabled: FEATURES.CRON_ENABLED
    };

    return NextResponse.json({
      cronStatus,
      healthChecks,
      features,
      environmentVariables: {
        BULLRHUN_MINT: !!config.BULLRHUN_MINT,
        WALLET_DEV: !!config.WALLET_DEV,
        WALLET_PLATFORM: !!config.WALLET_PLATFORM,
        WALLET_REWARD: !!config.WALLET_REWARD,
        PUMPSWAP_POOL: !!config.PUMPSWAP_POOL,
        PUMPPORTAL_API_KEY: !!config.PUMPPORTAL_API_KEY,
        REWARD_SOL_AMOUNT: config.REWARD_SOL_AMOUNT,
        MIN_BUY_AMOUNT_SOL: config.MIN_BUY_AMOUNT_SOL,
        RATE_LIMIT_CYCLE_SECONDS: config.RATE_LIMIT_CYCLE_SECONDS
      }
    });

  } catch (error) {
    console.error('GET /api/bullrhun/debug error:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    );
  }
}