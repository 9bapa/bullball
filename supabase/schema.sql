CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_mode') THEN
    CREATE TYPE reward_mode AS ENUM ('address','last-trader');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'liquidity_status') THEN
    CREATE TYPE liquidity_status AS ENUM ('planned','executed','skipped','failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profit_admin_settings (
  id INTEGER PRIMARY KEY,
  payout_address TEXT,
  forward_creator_fees BOOLEAN DEFAULT FALSE,
  enable_buybacks BOOLEAN DEFAULT TRUE,
  enable_gifts BOOLEAN DEFAULT FALSE,
  reward_mode reward_mode DEFAULT 'address',
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO profit_admin_settings (id, payout_address, forward_creator_fees, enable_buybacks, enable_gifts, reward_mode)
VALUES (1, '', FALSE, TRUE, FALSE, 'address')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS buybacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL,
  pool TEXT,
  signature TEXT UNIQUE NOT NULL,
  amount_sol NUMERIC(38,9) CHECK (amount_sol >= 0),
  amount_tokens NUMERIC(38,0) CHECK (amount_tokens >= 0),
  denominated_in_sol BOOLEAN NOT NULL,
  slippage INTEGER,
  priority_fee NUMERIC(38,9),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buybacks_mint ON buybacks (mint);
CREATE INDEX IF NOT EXISTS idx_buybacks_created_at ON buybacks (created_at DESC);

CREATE TABLE IF NOT EXISTS profit_liquidity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT,
  pool_key TEXT,
  sol_amount NUMERIC(38,9) CHECK (sol_amount >= 0),
  base_amount NUMERIC(38,0) CHECK (base_amount >= 0),
  status liquidity_status DEFAULT 'planned',
  fee_tx TEXT,
  buy_tx TEXT,
  deposit_tx TEXT,
  burn_tx TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (deposit_tx),
  UNIQUE (burn_tx)
);

CREATE INDEX IF NOT EXISTS idx_liquidity_mint ON profit_liquidity_events (mint);
CREATE INDEX IF NOT EXISTS idx_liquidity_created_at ON profit_liquidity_events (created_at DESC);

CREATE TABLE IF NOT EXISTS burns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_mint TEXT,
  pool_key TEXT,
  amount_lp NUMERIC(38,0) CHECK (amount_lp >= 0),
  signature TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_burns_created_at ON burns (created_at DESC);

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT NOT NULL,
  amount_sol NUMERIC(38,9) CHECK (amount_sol > 0),
  signature TEXT UNIQUE,
  mode reward_mode NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gifts_to ON gifts (to_address);
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts (created_at DESC);

CREATE TABLE IF NOT EXISTS developer_wallet_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  balance_sol NUMERIC(38,9) CHECK (balance_sol >= 0),
  total_received_sol NUMERIC(38,9) CHECK (total_received_sol >= 0),
  total_sent_sol NUMERIC(38,9) CHECK (total_sent_sol >= 0),
  captured_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dev_wallet_stats_address ON developer_wallet_stats (address);
CREATE INDEX IF NOT EXISTS idx_dev_wallet_stats_captured ON developer_wallet_stats (captured_at DESC);

CREATE TABLE IF NOT EXISTS profit_metrics (
  id INTEGER PRIMARY KEY,
  creator_fees_collected NUMERIC(38,9) DEFAULT 0,
  tokens_bought NUMERIC(38,0) DEFAULT 0,
  gifts_sent_sol NUMERIC(38,9) DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT now(),
  total_cycles INTEGER DEFAULT 0,
  current_sol_price NUMERIC(38,9) DEFAULT 0,
  next_cycle_in INTEGER DEFAULT 120
);

INSERT INTO profit_metrics (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS profit_last_trader (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_last_trader_updated ON profit_last_trader (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_last_trader_address ON profit_last_trader (address);

CREATE TABLE IF NOT EXISTS profit_trade_state (
  id INTEGER PRIMARY KEY,
  current_threshold INTEGER CHECK (current_threshold >= 1),
  current_count INTEGER DEFAULT 0 CHECK (current_count >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO profit_trade_state (id, current_threshold, current_count)
VALUES (1, floor(30 + (random() * 271))::int, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS ops_limits (
  key TEXT PRIMARY KEY,
  window_seconds INTEGER NOT NULL DEFAULT 30 CHECK (window_seconds >= 1),
  last_executed TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS token_status (
  mint TEXT PRIMARY KEY,
  is_graduated BOOLEAN DEFAULT FALSE,
  graduated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_status_updated ON token_status (updated_at DESC);

CREATE TABLE IF NOT EXISTS trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL,
  signature TEXT UNIQUE,
  venue TEXT,
  amount_sol NUMERIC(38,9),
  amount_tokens NUMERIC(38,0),
  denominated_in_sol BOOLEAN DEFAULT TRUE,
  slippage INTEGER,
  price_per_token NUMERIC(38,9),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trade_history_mint ON trade_history (mint);
CREATE INDEX IF NOT EXISTS idx_trade_history_created ON trade_history (created_at DESC);

CREATE TABLE IF NOT EXISTS liquidity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT,
  pool_key TEXT NOT NULL,
  quote_amount_sol NUMERIC(38,9) NOT NULL,
  base_amount_tokens NUMERIC(38,0),
  lp_tokens NUMERIC(38,0),
  slippage INTEGER,
  deposit_sig TEXT,
  burn_sig TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_liquidity_history_pool ON liquidity_history (pool_key);
CREATE INDEX IF NOT EXISTS idx_liquidity_history_created ON liquidity_history (created_at DESC);

ALTER TABLE public.profit_admin_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_admin_settings' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.profit_admin_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_admin_settings' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.profit_admin_settings FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_admin_settings' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.profit_admin_settings FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_admin_settings' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.profit_admin_settings FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.buybacks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='buybacks' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.buybacks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='buybacks' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.buybacks FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='buybacks' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.buybacks FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='buybacks' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.buybacks FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.profit_liquidity_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_liquidity_events' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.profit_liquidity_events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_liquidity_events' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.profit_liquidity_events FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_liquidity_events' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.profit_liquidity_events FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_liquidity_events' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.profit_liquidity_events FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.burns ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='burns' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.burns FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='burns' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.burns FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='burns' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.burns FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='burns' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.burns FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gifts' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.gifts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gifts' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.gifts FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gifts' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.gifts FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gifts' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.gifts FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.developer_wallet_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='developer_wallet_stats' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.developer_wallet_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='developer_wallet_stats' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.developer_wallet_stats FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='developer_wallet_stats' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.developer_wallet_stats FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='developer_wallet_stats' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.developer_wallet_stats FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.profit_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_metrics' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.profit_metrics FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_metrics' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.profit_metrics FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_metrics' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.profit_metrics FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_metrics' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.profit_metrics FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.profit_last_trader ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_last_trader' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.profit_last_trader FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_last_trader' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.profit_last_trader FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_last_trader' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.profit_last_trader FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_last_trader' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.profit_last_trader FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.profit_trade_state ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_trade_state' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.profit_trade_state FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_trade_state' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.profit_trade_state FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_trade_state' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.profit_trade_state FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profit_trade_state' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.profit_trade_state FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.ops_limits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ops_limits' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.ops_limits FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ops_limits' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.ops_limits FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ops_limits' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.ops_limits FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ops_limits' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.ops_limits FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.token_status ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='token_status' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.token_status FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='token_status' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.token_status FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='token_status' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.token_status FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='token_status' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.token_status FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='trade_history' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.trade_history FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='trade_history' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.trade_history FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='trade_history' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.trade_history FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='trade_history' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.trade_history FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;

ALTER TABLE public.liquidity_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='liquidity_history' AND policyname='select_public') THEN
    CREATE POLICY select_public ON public.liquidity_history FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='liquidity_history' AND policyname='insert_service') THEN
    CREATE POLICY insert_service ON public.liquidity_history FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='liquidity_history' AND policyname='update_service') THEN
    CREATE POLICY update_service ON public.liquidity_history FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='liquidity_history' AND policyname='delete_service') THEN
    CREATE POLICY delete_service ON public.liquidity_history FOR DELETE USING (auth.role() = 'service_role');
  END IF;
END $$;
