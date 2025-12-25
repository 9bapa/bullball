-- BullRhun Simplified Schema
-- Remove redundant tables and streamline data model

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_mode') THEN
    CREATE TYPE reward_mode AS ENUM ('address','last-trader');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cycle_status') THEN
    CREATE TYPE cycle_status AS ENUM ('pending','completed','failed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operation_status') THEN
    CREATE TYPE operation_status AS ENUM ('pending','completed','failed');
  END IF;
END $$;

-- Note: Old tables will be dropped after migration in cleanup script

-- Create simplified new tables

-- 1. Token registry
CREATE TABLE bullrhun_tokens (
  mint TEXT PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE,
  is_graduated BOOLEAN DEFAULT FALSE,
  graduated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cycle management - central table for all operations
CREATE TABLE bullrhun_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL REFERENCES bullrhun_tokens(mint),
  fee_signature TEXT,
  buy_signature TEXT,
  liquidity_signature TEXT,
  burn_signature TEXT,
  reward_signature TEXT,
  fee_amount_sol NUMERIC(38,9) CHECK (fee_amount_sol >= 0),
  buy_amount_sol NUMERIC(38,9) CHECK (buy_amount_sol >= 0),
  liquidity_amount_sol NUMERIC(38,9) CHECK (liquidity_amount_sol >= 0),
  reward_amount_sol NUMERIC(38,9) CHECK (reward_amount_sol >= 0),
  status cycle_status DEFAULT 'pending',
  error_message TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Simplified trade tracking
CREATE TABLE bullrhun_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL REFERENCES bullrhun_tokens(mint),
  signature TEXT UNIQUE NOT NULL,
  venue TEXT NOT NULL,
  amount_sol NUMERIC(38,9) CHECK (amount_sol >= 0),
  amount_tokens NUMERIC(38,0) CHECK (amount_tokens >= 0),
  price_per_token NUMERIC(38,9) CHECK (price_per_token >= 0),
  trader_address TEXT,
  is_system_buy BOOLEAN DEFAULT FALSE,
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Streamlined rewards
CREATE TABLE bullrhun_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  to_address TEXT NOT NULL,
  amount_sol NUMERIC(38,9) CHECK (amount_sol > 0),
  signature TEXT UNIQUE,
  mode reward_mode NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Simplified liquidity events
CREATE TABLE bullrhun_liquidity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  mint TEXT NOT NULL REFERENCES bullrhun_tokens(mint),
  pool_key TEXT,
  deposit_amount_sol NUMERIC(38,9) CHECK (deposit_amount_sol >= 0),
  deposit_signature TEXT,
  burn_amount_tokens NUMERIC(38,0) CHECK (burn_amount_tokens >= 0),
  burn_signature TEXT,
  status operation_status DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Simplified metrics
CREATE TABLE bullrhun_metrics (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_cycles INTEGER DEFAULT 0,
  total_fees_collected NUMERIC(38,9) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_rewards_sent NUMERIC(38,9) DEFAULT 0,
  current_sol_price NUMERIC(38,9) DEFAULT 0,
  last_cycle_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Listener monitoring
CREATE TABLE bullrhun_listeners (
  id INTEGER PRIMARY KEY DEFAULT 1,
  monitored_mint TEXT REFERENCES bullrhun_tokens(mint),
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  total_trades_monitored INTEGER DEFAULT 0,
  current_trade_threshold INTEGER DEFAULT 30,
  current_trade_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_bullrhun_cycles_mint ON bullrhun_cycles(mint);
CREATE INDEX idx_bullrhun_cycles_created_at ON bullrhun_cycles(created_at DESC);
CREATE INDEX idx_bullrhun_cycles_status ON bullrhun_cycles(status);

CREATE INDEX idx_bullrhun_trades_mint ON bullrhun_trades(mint);
CREATE INDEX idx_bullrhun_trades_created_at ON bullrhun_trades(created_at DESC);
CREATE INDEX idx_bullrhun_trades_trader ON bullrhun_trades(trader_address);
CREATE INDEX idx_bullrhun_trades_cycle_id ON bullrhun_trades(cycle_id);

CREATE INDEX idx_bullrhun_rewards_cycle_id ON bullrhun_rewards(cycle_id);
CREATE INDEX idx_bullrhun_rewards_created_at ON bullrhun_rewards(created_at DESC);

CREATE INDEX idx_bullrhun_liquidity_cycle_id ON bullrhun_liquidity_events(cycle_id);
CREATE INDEX idx_bullrhun_liquidity_mint ON bullrhun_liquidity_events(mint);
CREATE INDEX idx_bullrhun_liquidity_created_at ON bullrhun_liquidity_events(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE bullrhun_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullrhun_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullrhun_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullrhun_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullrhun_liquidity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullrhun_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullrhun_listeners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Public read access for most tables
  CREATE POLICY "Public read access" ON bullrhun_tokens FOR SELECT USING (true);
  CREATE POLICY "Public read access" ON bullrhun_cycles FOR SELECT USING (true);
  CREATE POLICY "Public read access" ON bullrhun_trades FOR SELECT USING (true);
  CREATE POLICY "Public read access" ON bullrhun_rewards FOR SELECT USING (true);
  CREATE POLICY "Public read access" ON bullrhun_liquidity_events FOR SELECT USING (true);
  CREATE POLICY "Public read access" ON bullrhun_metrics FOR SELECT USING (true);
  CREATE POLICY "Public read access" ON bullrhun_listeners FOR SELECT USING (true);
  
  -- Service role full access
  CREATE POLICY "Service role full access" ON bullrhun_tokens FOR ALL USING (auth.role() = 'service_role');
  CREATE POLICY "Service role full access" ON bullrhun_cycles FOR ALL USING (auth.role() = 'service_role');
  CREATE POLICY "Service role full access" ON bullrhun_trades FOR ALL USING (auth.role() = 'service_role');
  CREATE POLICY "Service role full access" ON bullrhun_rewards FOR ALL USING (auth.role() = 'service_role');
  CREATE POLICY "Service role full access" ON bullrhun_liquidity_events FOR ALL USING (auth.role() = 'service_role');
  CREATE POLICY "Service role full access" ON bullrhun_metrics FOR ALL USING (auth.role() = 'service_role');
  CREATE POLICY "Service role full access" ON bullrhun_listeners FOR ALL USING (auth.role() = 'service_role');
END $$;

-- Initialize metrics
INSERT INTO bullrhun_metrics (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Initialize listener
INSERT INTO bullrhun_listeners (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Fresh install - no migration needed