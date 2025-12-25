-- BullRhun Data Migration Script
-- Migrates from old schema to new simplified schema

-- Step 1: Migrate token status
INSERT INTO bullrhun_tokens (mint, is_graduated, graduated_at, updated_at)
SELECT 
  mint,
  is_graduated,
  graduated_at,
  updated_at
FROM token_status
ON CONFLICT (mint) DO UPDATE SET
  is_graduated = EXCLUDED.is_graduated,
  graduated_at = EXCLUDED.graduated_at,
  updated_at = EXCLUDED.updated_at;

-- Step 2: Migrate trade history
INSERT INTO bullrhun_trades (
  id, mint, signature, venue, amount_sol, amount_tokens, 
  price_per_token, trader_address, is_system_buy, created_at
)
SELECT 
  gen_random_uuid() as id,
  mint,
  signature,
  venue,
  amount_sol,
  amount_tokens,
  price_per_token,
  NULL as trader_address, -- Old trades don't have trader info
  false as is_system_buy, -- Assume old trades are user trades
  created_at
FROM trade_history
ON CONFLICT (signature) DO NOTHING;

-- Step 3: Migrate liquidity history
INSERT INTO bullrhun_liquidity_events (
  id, mint, pool_key, deposit_amount_sol, deposit_signature, 
  burn_amount_tokens, burn_signature, status, created_at
)
SELECT 
  gen_random_uuid() as id,
  mint,
  pool_key,
  quote_amount_sol as deposit_amount_sol,
  deposit_sig as deposit_signature,
  lp_tokens as burn_amount_tokens,
  burn_sig as burn_signature,
  'completed' as status, -- Assume all were completed
  created_at
FROM liquidity_history
ON CONFLICT DO NOTHING;

-- Step 4: Migrate gifts to rewards
INSERT INTO bullrhun_rewards (
  id, to_address, amount_sol, signature, mode, created_at
)
SELECT 
  gen_random_uuid() as id,
  to_address,
  amount_sol,
  signature,
  mode,
  created_at
FROM gifts
ON CONFLICT (signature) DO NOTHING;

-- Step 5: Initialize metrics with aggregated data
INSERT INTO bullrhun_metrics (
  id, total_cycles, total_fees_collected, total_trades, total_rewards_sent, 
  current_sol_price, last_cycle_at, updated_at
)
SELECT 
  1 as id,
  COALESCE(total_cycles, 0) as total_cycles,
  COALESCE(creator_fees_collected, 0) as total_fees_collected,
  COALESCE((SELECT COUNT(*) FROM bullrhun_trades), 0) as total_trades,
  COALESCE(gifts_sent_sol, 0) as total_rewards_sent,
  COALESCE(current_sol_price, 0) as current_sol_price,
  NULL as last_cycle_at, -- Will be updated by first cycle
  now() as updated_at
FROM profit_metrics
ON CONFLICT (id) DO UPDATE SET
  total_cycles = EXCLUDED.total_cycles,
  total_fees_collected = EXCLUDED.total_fees_collected,
  total_trades = EXCLUDED.total_trades,
  total_rewards_sent = EXCLUDED.total_rewards_sent,
  current_sol_price = EXCLUDED.current_sol_price,
  updated_at = EXCLUDED.updated_at;

-- Step 6: Initialize listener
INSERT INTO bullrhun_listeners (
  id, monitored_mint, last_heartbeat, total_trades_monitored, 
  current_trade_threshold, current_trade_count, updated_at
)
SELECT 
  1 as id,
  subscribed_mint as monitored_mint,
  last_heartbeat,
  COALESCE(current_count, 0) as total_trades_monitored,
  COALESCE(current_threshold, 30) as current_trade_threshold,
  COALESCE(current_count, 0) as current_trade_count,
  updated_at
FROM listener_status
ON CONFLICT (id) DO UPDATE SET
  monitored_mint = EXCLUDED.monitored_mint,
  last_heartbeat = EXCLUDED.last_heartbeat,
  total_trades_monitored = EXCLUDED.total_trades_monitored,
  current_trade_threshold = EXCLUDED.current_trade_threshold,
  current_trade_count = EXCLUDED.current_trade_count,
  updated_at = EXCLUDED.updated_at;

-- Step 7: Create placeholder cycles for historical data
-- This creates cycle records for historical trades and liquidity events
INSERT INTO bullrhun_cycles (
  id, mint, status, fee_signature, buy_signature, 
  liquidity_signature, burn_signature, reward_signature,
  fee_amount_sol, buy_amount_sol, liquidity_amount_sol, reward_amount_sol,
  executed_at, created_at
)
SELECT DISTINCT
  gen_random_uuid() as id,
  mint,
  'completed' as status,
  NULL as fee_signature,
  signature as buy_signature,
  NULL as liquidity_signature,
  NULL as burn_signature,
  NULL as reward_signature,
  NULL as fee_amount_sol,
  amount_sol as buy_amount_sol,
  NULL as liquidity_amount_sol,
  NULL as reward_amount_sol,
  created_at as executed_at,
  created_at
FROM (
  SELECT mint, signature, amount_sol, created_at
  FROM trade_history 
  WHERE denominated_in_sol = true
  UNION DISTINCT
  SELECT mint, NULL, quote_amount_sol, created_at
  FROM liquidity_history
) historical_data
ON CONFLICT DO NOTHING;

-- Update recent trades to link to cycles (best effort)
UPDATE bullrhun_trades 
SET cycle_id = (
  SELECT id 
  FROM bullrhun_cycles 
  WHERE bullrhun_cycles.mint = bullrhun_trades.mint 
    AND bullrhun_cycles.created_at <= bullrhun_trades.created_at
  ORDER BY bullrhun_cycles.created_at DESC 
  LIMIT 1
)
WHERE cycle_id IS NULL;

-- Update recent liquidity events to link to cycles (best effort)
UPDATE bullrhun_liquidity_events 
SET cycle_id = (
  SELECT id 
  FROM bullrhun_cycles 
  WHERE bullrhun_cycles.mint = bullrhun_liquidity_events.mint 
    AND bullrhun_cycles.created_at <= bullrhun_liquidity_events.created_at
  ORDER BY bullrhun_cycles.created_at DESC 
  LIMIT 1
)
WHERE cycle_id IS NULL;

-- Migration summary report
SELECT 
  'Migration Summary' as info,
  (SELECT COUNT(*) FROM bullrhun_tokens) as tokens_migrated,
  (SELECT COUNT(*) FROM bullrhun_trades) as trades_migrated,
  (SELECT COUNT(*) FROM bullrhun_liquidity_events) as liquidity_events_migrated,
  (SELECT COUNT(*) FROM bullrhun_rewards) as rewards_migrated,
  (SELECT COUNT(*) FROM bullrhun_cycles) as cycles_created,
  now() as migration_completed_at;

-- Data verification queries
SELECT 
  'Data Verification' as info,
  'Tokens' as table_name,
  COUNT(*) as record_count
FROM bullrhun_tokens
UNION ALL
SELECT 
  'Data Verification' as info,
  'Trades' as table_name,
  COUNT(*) as record_count
FROM bullrhun_trades
UNION ALL
SELECT 
  'Data Verification' as info,
  'Liquidity Events' as table_name,
  COUNT(*) as record_count
FROM bullrhun_liquidity_events
UNION ALL
SELECT 
  'Data Verification' as info,
  'Rewards' as table_name,
  COUNT(*) as record_count
FROM bullrhun_rewards
UNION ALL
SELECT 
  'Data Verification' as info,
  'Cycles' as table_name,
  COUNT(*) as record_count
FROM bullrhun_cycles
UNION ALL
SELECT 
  'Data Verification' as info,
  'Metrics' as table_name,
  COUNT(*) as record_count
FROM bullrhun_metrics
UNION ALL
SELECT 
  'Data Verification' as info,
  'Listener' as table_name,
  COUNT(*) as record_count
FROM bullrhun_listeners;