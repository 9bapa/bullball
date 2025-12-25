// BullRhun Database Types - Simplified Schema

export enum CycleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum OperationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum RewardMode {
  ADDRESS = 'address',
  LAST_TRADER = 'last-trader'
}

// Core Tables
export interface BullrhunToken {
  mint: string;
  is_active: boolean;
  is_graduated: boolean;
  graduated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BullrhunCycle {
  id: string;
  mint: string;
  fee_signature: string | null;
  buy_signature: string | null;
  liquidity_signature: string | null;
  burn_signature: string | null;
  reward_signature: string | null;
  fee_amount_sol: number | null;
  buy_amount_sol: number | null;
  liquidity_amount_sol: number | null;
  reward_amount_sol: number | null;
  status: CycleStatus;
  error_message: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at?: string;
  status_updated_at?: string;
  step_number: number;
  total_steps: number;
  last_step_at: string | null;
  // Enhanced 11-step flow properties
  current_step?: number;
  step_status?: string;
  step_details?: any;
  trade_goal_at_start?: number;
  winner_address?: string;
  winner_reward_amount?: number;
}

export interface BullrhunTrade {
  id: string;
  mint: string;
  signature: string;
  venue: string;
  amount_sol: number | null;
  amount_tokens: number | null;
  price_per_token: number | null;
  trader_address: string | null;
  is_system_buy: boolean;
  cycle_id: string | null;
  created_at: string;
}

export interface BullrhunReward {
  id: string;
  cycle_id: string | null;
  to_address: string;
  amount_sol: number;
  signature: string | null;
  mode: RewardMode;
  created_at: string;
}

export interface BullrhunLiquidityEvent {
  id: string;
  cycle_id: string | null;
  mint: string;
  pool_key: string | null;
  deposit_amount_sol: number | null;
  deposit_signature: string | null;
  burn_amount_tokens: number | null;
  burn_signature: string | null;
  status: OperationStatus;
  error_message: string | null;
  created_at: string;
  updated_at?: string;
}

export interface BullrhunMetrics {
  id: number;
  total_cycles: number;
  total_fees_collected: number;
  total_trades: number;
  total_rewards_sent: number;
  current_sol_price: number;
  last_cycle_at: string | null;
  updated_at: string;
  // Enhanced metrics for 11-step flow
  total_tokens_bought: number;
  total_gifts_sent: number;
  total_sol_spent: number;
}

export interface BullrhunListener {
  id: number;
  monitored_mint: string | null;
  last_heartbeat: string;
  total_trades_monitored: number;
  current_trade_threshold: number;
  current_trade_count: number;
  updated_at: string;
  // Enhanced trade goal functionality
  trade_goal: number;
  last_winner_address: string | null;
  last_winner_at: string | null;
  minimum_trade_amount: number;
}

// API Request/Response Types
export interface CycleExecutionRequest {
  mint: string;
}

export interface CycleExecutionResponse {
  cycle_id: string;
  fee_signature?: string;
  buy_signature?: string;
  liquidity_signature?: string;
  burn_signature?: string;
  reward_signature?: string;
  status: CycleStatus;
  error?: string;
}

export interface TradeHistoryResponse {
  trades: BullrhunTrade[];
  total: number;
  page: number;
  limit: number;
}

export interface MetricsResponse {
  total_cycles: number;
  total_fees_collected: number;
  total_trades: number;
  total_rewards_sent: number;
  current_sol_price: number;
  last_cycle_at: string | null;
  next_cycle_in: number;
}

export interface ListenerStatusResponse {
  monitored_mint: string | null;
  last_heartbeat: string;
  total_trades_monitored: number;
  current_trade_threshold: number;
  current_trade_count: number;
  is_healthy: boolean;
}

// Database Insert Types
export interface CreateCycleData {
  mint: string;
  fee_amount_sol?: number;
  buy_amount_sol?: number;
  liquidity_amount_sol?: number;
  reward_amount_sol?: number;
}

export interface CreateTradeData {
  mint: string;
  signature: string;
  venue: string;
  amount_sol?: number;
  amount_tokens?: number;
  price_per_token?: number;
  trader_address?: string;
  is_system_buy?: boolean;
  cycle_id?: string;
}

export interface CreateRewardData {
  cycle_id?: string;
  to_address: string;
  amount_sol: number;
  signature?: string;
  mode: RewardMode;
}

export interface CreateLiquidityEventData {
  cycle_id?: string;
  mint: string;
  pool_key?: string;
  deposit_amount_sol?: number;
  deposit_signature?: string;
  burn_amount_tokens?: number;
  burn_signature?: string | null;
}

// Service Layer Types
export interface CycleExecutionResult {
  cycle: BullrhunCycle;
  feeSignature?: string;
  buySignature?: string;
  liquiditySignature?: string;
  burnSignature?: string;
  rewardSignature?: string;
  error?: string;
}

export interface TradeServiceResult {
  success: boolean;
  signature?: string;
  venue?: string;
  error?: string;
}

export interface LiquidityServiceResult {
  success: boolean;
  depositSignature?: string;
  burnSignature?: string | null;
  error?: string;
}

export interface FeeCollectionResult {
  success: boolean;
  signature?: string;
  amount?: number;
  error?: string;
}

// Configuration Types
export interface BullrhunConfig {
  SOLANA_RPC_ENDPOINT: string;
  WALLET_DEV?: string;
  PUMPPORTAL_API_KEY?: string;
  BULLRHUN_MINT?: string;
  WALLET_PLATFORM?: string;
  WALLET_REWARD?: string;
  REWARD_MODE: RewardMode;
  REWARD_SOL_AMOUNT?: number;
  PUMPSWAP_POOL?: string;
  RATE_LIMIT_CYCLE_SECONDS: number;
  RATE_LIMIT_BUY_SECONDS: number;
  RATE_LIMIT_DEPOSIT_SECONDS: number;
  MIN_BUY_AMOUNT_SOL: number;
  MIN_GIFT_TRADE_AMOUNT: number;
  SLIPPAGE_DEFAULT: number;
  PRIORITY_FEE_DEFAULT: number;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Error Types
export class BullrhunError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'BullrhunError';
  }
}

export class DatabaseError extends BullrhunError {
  constructor(message: string, code?: string) {
    super(message, code, 500);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends BullrhunError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class ExternalServiceError extends BullrhunError {
  constructor(message: string, service: string) {
    super(message, `${service}_ERROR`, 502);
    this.name = 'ExternalServiceError';
  }
}

// Database Query Options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface CycleQueryOptions extends QueryOptions {
  mint?: string;
  status?: CycleStatus;
  startDate?: string;
  endDate?: string;
}

export interface TradeQueryOptions extends QueryOptions {
  mint?: string;
  venue?: string;
  traderAddress?: string;
  isSystemBuy?: boolean;
  cycleId?: string;
}