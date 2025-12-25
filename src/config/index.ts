import { z } from 'zod';
import { BullrhunConfig, RewardMode } from '@/types/bullrhun.types';

// Environment validation schema
const envSchema = z.object({
  SOLANA_RPC_ENDPOINT: z.string().url().default('https://api.mainnet-beta.solana.com'),
  WALLET_DEV: z.string().min(1, 'Dev wallet private key required').optional(),
  PUMPPORTAL_API_KEY: z.string().optional(),
  BULLRHUN_MINT: z.string().min(32, 'Valid token mint required').optional(),
  BULLBALL_MINT: z.string().min(32, 'Valid token mint required').optional(),
  WALLET_PLATFORM: z.string().optional(),
  WALLET_REWARD: z.string().optional(),
  REWARD_WALLET: z.string().optional(),
  REWARD_ADDRESS: z.string().optional(),
  REWARD_MODE: z.nativeEnum(RewardMode).default(RewardMode.ADDRESS),
  REWARD_SOL_AMOUNT: z.coerce.number().default(0),
  PUMPSWAP_POOL: z.string().optional(),
  SOLANA_PUBLIC_KEY: z.string().optional(),
  RATE_LIMIT_CYCLE_SECONDS: z.coerce.number().default(120),
  RATE_LIMIT_BUY_SECONDS: z.coerce.number().default(30),
  RATE_LIMIT_DEPOSIT_SECONDS: z.coerce.number().default(30),
  MIN_BUY_AMOUNT_SOL: z.coerce.number().default(0.001),
  MIN_GIFT_TRADE_AMOUNT: z.coerce.number().default(0.50),
  SLIPPAGE_DEFAULT: z.coerce.number().default(3),
  MINIMUM_TRADE_AMOUNT: z.coerce.number().default(0.001),
  PRIORITY_FEE_DEFAULT: z.coerce.number().default(0.00005),
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key required'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Export validated configuration
export const config: BullrhunConfig = {
  SOLANA_RPC_ENDPOINT: env.SOLANA_RPC_ENDPOINT,
  WALLET_DEV: env.WALLET_DEV,
  BULLRHUN_MINT: env.BULLRHUN_MINT,
  WALLET_PLATFORM: env.WALLET_PLATFORM,
  WALLET_REWARD: env.WALLET_REWARD,
  REWARD_MODE: env.REWARD_MODE,
  REWARD_SOL_AMOUNT: env.REWARD_SOL_AMOUNT,
  PUMPSWAP_POOL: env.PUMPSWAP_POOL,
  RATE_LIMIT_CYCLE_SECONDS: env.RATE_LIMIT_CYCLE_SECONDS,
  RATE_LIMIT_BUY_SECONDS: env.RATE_LIMIT_BUY_SECONDS,
  RATE_LIMIT_DEPOSIT_SECONDS: env.RATE_LIMIT_DEPOSIT_SECONDS,
  MIN_BUY_AMOUNT_SOL: env.MIN_BUY_AMOUNT_SOL,
  MIN_GIFT_TRADE_AMOUNT: env.MIN_GIFT_TRADE_AMOUNT,
  SLIPPAGE_DEFAULT: env.SLIPPAGE_DEFAULT,
  PRIORITY_FEE_DEFAULT: env.PRIORITY_FEE_DEFAULT,
  PUMPPORTAL_API_KEY: env.PUMPPORTAL_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
};

// Constants derived from config
export const CONSTANTS = {
  CRON_SCHEDULE: '*/2 * * * *', // Every 2 minutes
  MAX_RETRY_ATTEMPTS: 3,
  CONFIRMATION_COMMITMENT: 'confirmed' as const,
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  RATE_LIMIT_WINDOWS: {
    CYCLE: config.RATE_LIMIT_CYCLE_SECONDS * 1000,
    BUY: config.RATE_LIMIT_BUY_SECONDS * 1000,
    DEPOSIT: config.RATE_LIMIT_DEPOSIT_SECONDS * 1000,
  },
  VENUES: {
    PUMP: 'pump',
    PUMP_AMM: 'pump-amm',
    RAYDIUM: 'raydium',
    RAYDIUM_CPMM: 'raydium-cpmm',
    LAUNCHLAB: 'launchlab',
    BONK: 'bonk',
    AUTO: 'auto',
  },
} as const;

// Validation helpers
export const isValidMint = (mint: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint);
};

export const isValidSolanaAddress = (address: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

export const isValidAmount = (amount: number, min: number = 0): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= min;
};

// Database connection helpers
export const getDatabaseConfig = () => ({
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
});

// Feature flags
export const FEATURES = {
  LIQUIDITY_ENABLED: !!env.PUMPSWAP_POOL,
  REWARDS_ENABLED: !!env.WALLET_REWARD && (config.REWARD_SOL_AMOUNT || 0) > 0,
  PLATFORM_FEES_ENABLED: !!env.WALLET_PLATFORM,
  CRON_ENABLED: true, // Always enabled in new design
} as const;

export default config;