-- Database Schema Upgrades for High-Frequency Meme Coin Trading
-- Version: 2.1.0 - BullRhun Integration
-- Execute: psql -d bullrhun_db -f schema-upgrade-v2-1.sql

-- =====================================================
-- 1. BULLRHUN-COMPATIBLE TABLE STRUCTURE
-- =====================================================

-- Update users table to use wallet_address as primary key
DO $$
BEGIN
  -- Check if users table exists with wallet_address primary key
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_pkey' AND constraint_type = 'PRIMARY KEY' 
    AND EXISTS (
      SELECT 1 FROM information_schema.key_column_usage 
      WHERE table_name = 'users' 
        AND column_name = 'wallet_address'
        AND constraint_name = 'users_pkey'
    )
  )
  THEN
    RAISE LOG 'Users table already uses wallet_address as primary key';
  ELSE
    -- Add wallet_address as primary key for BullRhun compatibility
    ALTER TABLE users ADD COLUMN wallet_address_new VARCHAR(255) UNIQUE;
    ALTER TABLE users ADD CONSTRAINT users_wallet_address_new_pkey PRIMARY KEY (wallet_address_new);
    
    -- Update user_strategies to use wallet_address
    ALTER TABLE IF EXISTS user_strategies DROP CONSTRAINT IF EXISTS user_strategies_user_id_fkey;
    ALTER TABLE IF EXISTS user_strategies ADD COLUMN user_wallet VARCHAR(255);
    UPDATE user_strategies SET user_wallet = u.wallet_address FROM users u WHERE user_strategies.user_id = u.id;
    ALTER TABLE IF EXISTS user_strategies DROP COLUMN IF EXISTS user_id;
    ALTER TABLE IF EXISTS user_strategies RENAME COLUMN user_wallet TO user_id;
    ALTER TABLE IF EXISTS user_strategies ADD CONSTRAINT user_strategies_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(wallet_address_new);
    
    RAISE LOG 'Updated tables to use wallet_address as primary key';
  END IF;
END $$;
-- =====================================================
-- 2. BULLRHUN-SPECIFIC TRADING TABLES
-- =====================================================

-- =====================================================
-- 2. BULLRHUN-SPECIFIC TRADING TABLES
-- =====================================================

-- Create bullrhun_trades table (main trading table)
CREATE TABLE IF NOT EXISTS bullrhun_trades (
  id BIGSERIAL PRIMARY KEY,
  wallet_address VARCHAR(255) NOT NULL,
  token_address VARCHAR(255) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  amount DECIMAL(20,10) NOT NULL,
  price DECIMAL(20,10) NOT NULL,
  tx_signature VARCHAR(255) UNIQUE NOT NULL,
  tx_type VARCHAR(10) NOT NULL,
  trade_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  -- BRIN index for time-series trades
  token_hash VARCHAR(64) GENERATED ALWAYS AS (md5(token_address)) STORED,
  INDEX bullrhun_trades_token_hash (token_hash, trade_time),
  INDEX bullrhun_trades_wallet_time (wallet_address, trade_time),
  INDEX bullrhun_trades_price_time (price, trade_time)
  -- Note: Partitioning will be handled by separate partition management function
);

-- Create bullrhun_tokens table for token metadata
CREATE TABLE IF NOT EXISTS bullrhun_tokens (
  id SERIAL PRIMARY KEY,
  token_address VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  creator VARCHAR(255),
  mint_signature VARCHAR(255),
  uri TEXT,
  initial_buy DECIMAL(20,10),
  sol_amount DECIMAL(20,10),
  bonding_curve_key VARCHAR(255),
  market_cap_sol DECIMAL(20,10),
  v_tokens_in_bonding_curve DECIMAL(20,10),
  v_sol_in_bonding_curve DECIMAL(20,10),
  is_mayhem_mode BOOLEAN DEFAULT FALSE,
  pool VARCHAR(100) DEFAULT 'pump',
  -- Parsed URI metadata
  description TEXT,
  image_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  created_on_platform VARCHAR(100),
  uri_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create bullrhun_token_creators table for creator tracking
CREATE TABLE IF NOT EXISTS bullrhun_token_creators (
  id SERIAL PRIMARY KEY,
  creator_wallet VARCHAR(255) UNIQUE NOT NULL,
  total_tokens_created INTEGER DEFAULT 0,
  successful_tokens INTEGER DEFAULT 0,
  failed_tokens INTEGER DEFAULT 0,
  total_initial_buy_sol DECIMAL(20,10) DEFAULT 0.000000000,
  total_sol_invested DECIMAL(20,10) DEFAULT 0.000000000,
  average_initial_buy DECIMAL(20,10) DEFAULT 0.000000000,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  reputation_score DECIMAL(5,2) DEFAULT 0.00,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  tags JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  -- Performance metrics
  best_performing_token VARCHAR(255),
  best_token_return DECIMAL(10,2) DEFAULT 0.00,
  worst_performing_token VARCHAR(255),
  worst_token_return DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bullrhun_user_strategies table
CREATE TABLE IF NOT EXISTS bullrhun_user_strategies (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255) NOT NULL,
  token_address VARCHAR(255) REFERENCES bullrhun_tokens(token_address),
  strategy_name VARCHAR(100) NOT NULL,
  strategy_type ENUM('auto_new_tokens', 'auto_migrated_tokens', 'copy_wallet_trades', 'manual_trading', 'dca_bot', 'community_signals') NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  total_trades INTEGER DEFAULT 0,
  profit_loss DECIMAL(20,10) DEFAULT 0.000000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed TIMESTAMP WITH TIME ZONE,
  UNIQUE(wallet_address, token_address, strategy_type)
);

-- Create bullrhun_community_signals table
CREATE TABLE IF NOT EXISTS bullrhun_community_signals (
  id SERIAL PRIMARY KEY,
  creator_wallet VARCHAR(255) NOT NULL,
  token_address VARCHAR(255) REFERENCES bullrhun_tokens(token_address),
  signal_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  subscribers JSONB DEFAULT '[]',
  active_subscribers INT DEFAULT 0,
  signal_type ENUM('price_alert', 'volume_spike', 'migration_alert', 'buy_signal', 'sell_signal') NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. WEBSOCKET BUFFER FOR PUMPPORTAL INTEGRATION
-- =====================================================

-- Ultra-fast buffer for PumpPortal messages
CREATE TABLE IF NOT EXISTS pumpportal_buffer (
  id BIGSERIAL,
  raw_message JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_type VARCHAR(50),
  priority INT DEFAULT 1
) WITH (autovacuum_enabled=false, fillfactor=100);

-- =====================================================
-- 4. STORED PROCEDURES FOR REAL-TIME PROCESSING
-- =====================================================

-- URI metadata processing function
CREATE OR REPLACE FUNCTION process_token_uri_metadata(
  p_token_address VARCHAR(255),
  p_uri TEXT
)
RETURNS void AS $$
DECLARE
  v_metadata JSONB;
  v_description TEXT;
  v_image_url TEXT;
  v_twitter_url TEXT;
  v_website_url TEXT;
  v_created_on_platform VARCHAR(100);
  v_uri_clean TEXT;
BEGIN
  -- Clean and normalize URI
  v_uri_clean := CASE
    WHEN p_uri LIKE 'https://ipfs.io/ipfs/%' THEN REPLACE(p_uri, 'https://ipfs.io/ipfs/', '')
    WHEN p_uri LIKE 'ipfs://%' THEN REPLACE(p_uri, 'ipfs://', '')
    WHEN p_uri LIKE 'https://arweave.net/%' THEN REPLACE(p_uri, 'https://arweave.net/', '')
    ELSE p_uri
  END;
  
  -- For now, we'll mark URI as processed but not fetch external content
  -- In production, you'd want to implement HTTP client to fetch IPFS/Arweave content
  -- This is a placeholder that simulates the metadata extraction
  
  -- Update token with processed URI flag
  UPDATE bullrhun_tokens 
  SET 
    uri_processed = TRUE,
    description = COALESCE(description, 'Token metadata from URI: ' || v_uri_clean),
    image_url = COALESCE(image_url, 'https://ipfs.io/ipfs/' || v_uri_clean),
    created_on_platform = COALESCE(created_on_platform, 'pump.fun'),
    updated_at = NOW()
  WHERE token_address = p_token_address;
  
  -- Log metadata processing
  INSERT INTO performance_metrics (metric_name, metric_value, metric_unit)
  VALUES ('uri_metadata_processed', 1, 'count');
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the token creation
  INSERT INTO performance_metrics (metric_name, metric_value, metric_unit)
  VALUES ('uri_metadata_errors', 1, 'count');
  
  UPDATE bullrhun_tokens 
  SET uri_processed = FALSE 
  WHERE token_address = p_token_address;
END;
$$ LANGUAGE plpgsql;

-- Process PumpPortal trade messages
CREATE OR REPLACE FUNCTION process_pumpportal_trade(
  p_wallet_address VARCHAR(255),
  p_token_address VARCHAR(255),
  p_from_address VARCHAR(255),
  p_to_address VARCHAR(255),
  p_amount DECIMAL(20,10),
  p_price DECIMAL(20,10),
  p_tx_signature VARCHAR(255),
  p_tx_type VARCHAR(10)
)
RETURNS void AS $$
BEGIN
  -- Insert into main trades table
  INSERT INTO bullrhun_trades (wallet_address, token_address, from_address, to_address, amount, price, tx_signature, tx_type, trade_time)
  VALUES (p_wallet_address, p_token_address, p_from_address, p_to_address, p_amount, p_price, p_tx_signature, p_tx_type, NOW(), NOW());
  
  -- Update user strategies and performance
  PERFORM check_and_execute_strategies(p_wallet_address, p_token_address, p_from_address, p_amount, p_price);
  
  -- Update token cache
  UPDATE bullrhun_tokens t 
  SET 
    created_at = NOW(),
    processed = TRUE
  WHERE t.token_address = p_token_address;
END;
$$ LANGUAGE plpgsql;

-- Process PumpPortal new token creation
CREATE OR REPLACE FUNCTION process_pumpportal_new_token(
  p_token_address VARCHAR(255),
  p_name VARCHAR(255),
  p_symbol VARCHAR(50),
  p_creator VARCHAR(255),
  p_mint_signature VARCHAR(255),
  p_initial_buy DECIMAL(20,10),
  p_sol_amount DECIMAL(20,10),
  p_pool VARCHAR(100),
  p_uri TEXT DEFAULT NULL,
  p_bonding_curve_key VARCHAR(255) DEFAULT NULL,
  p_market_cap_sol DECIMAL(20,10) DEFAULT NULL,
  p_v_tokens_in_bonding_curve DECIMAL(20,10) DEFAULT NULL,
  p_v_sol_in_bonding_curve DECIMAL(20,10) DEFAULT NULL,
  p_is_mayhem_mode BOOLEAN DEFAULT FALSE,
  p_trader_public_key VARCHAR(255) DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_creator VARCHAR(255);
  v_existing_creator BOOLEAN;
BEGIN
  -- Use traderPublicKey as creator if provided (this is the actual token creator from PumpPortal)
  v_creator := COALESCE(p_trader_public_key, p_creator, 
    CASE 
      WHEN p_mint_signature IS NOT NULL AND LENGTH(p_mint_signature) > 20 THEN
        SUBSTRING(p_mint_signature FROM 1 FOR 32) -- Extract creator from mint signature
      ELSE 
        'Unknown Creator'
    END
  );
  
  -- Check if creator exists in creators table
  SELECT EXISTS(SELECT 1 FROM bullrhun_token_creators WHERE creator_wallet = v_creator) INTO v_existing_creator;
  
  -- Update or insert creator statistics
  IF v_existing_creator THEN
    UPDATE bullrhun_token_creators 
    SET 
      total_tokens_created = total_tokens_created + 1,
      total_initial_buy_sol = total_initial_buy_sol + COALESCE(p_initial_buy, 0),
      total_sol_invested = total_sol_invested + COALESCE(p_sol_amount, 0),
      average_initial_buy = (total_initial_buy_sol + COALESCE(p_initial_buy, 0)) / (total_tokens_created + 1),
      last_active = NOW(),
      updated_at = NOW()
    WHERE creator_wallet = v_creator;
  ELSE
    INSERT INTO bullrhun_token_creators (
      creator_wallet, total_tokens_created, total_initial_buy_sol, total_sol_invested, 
      average_initial_buy, first_seen, last_active, updated_at
    ) VALUES (
      v_creator, 1, COALESCE(p_initial_buy, 0), COALESCE(p_sol_amount, 0), 
      COALESCE(p_initial_buy, 0), NOW(), NOW(), NOW()
    );
  END IF;
  
  -- Insert new token into BullRhun tokens table with all fields
  INSERT INTO bullrhun_tokens (
    token_address, name, symbol, creator, mint_signature, initial_buy, sol_amount, 
    bonding_curve_key, market_cap_sol, v_tokens_in_bonding_curve, v_sol_in_bonding_curve,
    is_mayhem_mode, pool, uri, created_at, processed
  )
  VALUES (
    p_token_address, p_name, p_symbol, v_creator, p_mint_signature, p_initial_buy, p_sol_amount, 
    p_bonding_curve_key, p_market_cap_sol, p_v_tokens_in_bonding_curve, p_v_sol_in_bonding_curve,
    p_is_mayhem_mode, p_pool, p_uri, NOW(), FALSE
  );
  
  -- Process URI metadata if available
  IF p_uri IS NOT NULL THEN
    PERFORM process_token_uri_metadata(p_token_address, p_uri);
  END IF;
  
  -- Log new token creation with enhanced description
  INSERT INTO bullrhun_community_signals (creator_wallet, token_address, signal_name, description)
  VALUES (v_creator, p_token_address, 'New Token Alert', 
    format('New token %s (%s) created by %s. Initial buy: %s SOL | Mint: %s', 
      COALESCE(p_symbol, p_token_address), 
      COALESCE(p_name, 'Unknown Token'), 
      v_creator, 
      p_initial_buy,
      p_mint_signature));
  
  -- Check for auto-strategies
  PERFORM check_and_execute_strategies(v_creator, p_token_address, NULL, NULL, NULL);
END;
$$ LANGUAGE plpgsql;

-- Strategy execution engine
CREATE OR REPLACE FUNCTION check_and_execute_strategies(
  p_wallet_address VARCHAR(255),
  p_token_address VARCHAR(255),
  p_from_address VARCHAR(255),
  p_amount DECIMAL(20,10),
  p_price DECIMAL(20,10)
)
RETURNS void AS $$
DECLARE
  strategy_record RECORD;
  execute_strategy BOOLEAN := FALSE;
BEGIN
  -- Check all active strategies for this token
  FOR strategy_record IN 
    SELECT * FROM bullrhun_user_strategies 
    WHERE token_address = p_token_address AND is_active = TRUE
  ORDER BY strategy_type
  LOOP
    execute_strategy := FALSE;
    
    -- Auto new token hunter strategy
    IF strategy_record.strategy_type = 'auto_new_tokens' THEN
      -- Check if token meets criteria (e.g., low market cap, high volume)
      IF p_amount < (strategy_record.parameters->>'max_buy_amount')::DECIMAL(20,10) THEN
        -- Execute buy
        INSERT INTO bullrhun_trades (wallet_address, token_address, from_address, to_address, amount, price, tx_signature, tx_type, trade_time)
        VALUES (p_wallet_address, p_token_address, '0x000000000000000000000000000000000000000000000000000000000000001', p_wallet_address, 
          strategy_record.parameters->>'max_buy_amount'::DECIMAL(20,10), p_price, 
          format('auto_buy_%s_%s', strategy_record.strategy_name, p_token_address), NOW(), NOW());
        
        -- Update strategy stats
        UPDATE bullrhun_user_strategies 
        SET total_trades = total_trades + 1,
            last_executed = NOW()
        WHERE id = strategy_record.id;
        
        execute_strategy := TRUE;
      END IF;
    END IF;
    
    -- Log strategy execution for analytics
    IF execute_strategy THEN
      INSERT INTO performance_metrics (metric_name, metric_value, metric_unit)
      VALUES ('strategy_executions', 1, 'count');
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Process PumpPortal buffer in batches
CREATE OR REPLACE FUNCTION process_pumpportal_buffer_v2()
RETURNS void AS $$
DECLARE
  batch_count INT := 0;
  processed_count INT := 0;
  unprocessed_count INT;
BEGIN
  -- Get count of unprocessed messages
  SELECT COUNT(*) INTO unprocessed_count 
  FROM pumpportal_buffer 
  WHERE processed = FALSE;
  
  IF unprocessed_count = 0 THEN
    RETURN;
  END IF;
  
  RAISE LOG 'Processing % PumpPortal messages', unprocessed_count;
  
  -- Process in batches of 100 for performance
  WHILE processed_count < unprocessed_count LOOP
    -- Process trades
    FOR trade_record IN 
      SELECT * FROM pumpportal_buffer 
      WHERE processed = FALSE AND message_type IN ('trade', 'new_token')
      ORDER BY priority ASC, received_at ASC
      LIMIT 100
    LOOP
      BEGIN
        -- Process trade messages
        IF trade_record.message_type = 'trade' THEN
          PERFORM process_pumpportal_trade(
            (trade_record.raw_message->>'from')::VARCHAR(255),
            (trade_record.raw_message->>'tokenAddress')::VARCHAR(255),
            (trade_record.raw_message->>'to')::VARCHAR(255),
            (trade_record.raw_message->>'amount')::DECIMAL(20,10),
            (trade_record.raw_message->>'price')::DECIMAL(20,10),
            (trade_record.raw_message->>'signature')::VARCHAR(255),
            (trade_record.raw_message->>'type')::VARCHAR(10)
          );
        
        -- Process new token messages
        ELSIF trade_record.message_type = 'new_token' THEN
          PERFORM process_pumpportal_new_token(
            (trade_record.raw_message->>'mint')::VARCHAR(255),
            (trade_record.raw_message->>'name')::VARCHAR(255),
            (trade_record.raw_message->>'symbol')::VARCHAR(50),
            (trade_record.raw_message->>'creator')::VARCHAR(255),
            (trade_record.raw_message->>'mintSignature')::VARCHAR(255),
            (trade_record.raw_message->>'initialBuy')::DECIMAL(20,10),
            (trade_record.raw_message->>'solAmount')::DECIMAL(20,10),
            (trade_record.raw_message->>'pool')::VARCHAR(100),
            (trade_record.raw_message->>'uri')::TEXT,
            (trade_record.raw_message->>'bondingCurveKey')::VARCHAR(255),
            (trade_record.raw_message->>'marketCapSol')::DECIMAL(20,10),
            (trade_record.raw_message->>'vTokensInBondingCurve')::DECIMAL(20,10),
            (trade_record.raw_message->>'vSolInBondingCurve')::DECIMAL(20,10),
            (trade_record.raw_message->>'is_mayhem_mode')::BOOLEAN,
            (trade_record.raw_message->>'traderPublicKey')::VARCHAR(255)
          );
        END IF;
        
        -- Mark as processed
        UPDATE pumpportal_buffer SET processed = TRUE WHERE id = trade_record.id;
        processed_count := processed_count + 1;
      END LOOP;
      
      -- Exit if processed all
      EXIT WHEN processed_count >= unprocessed_count;
    END LOOP;
  
  RAISE LOG 'Finished processing. Total batches: %, Messages processed: %', batch_count, processed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. MATERIALIZED VIEWS FOR REAL-TIME ANALYTICS
-- =====================================================

-- Current token prices (refreshed every 10 seconds)
CREATE MATERIALIZED VIEW bullrhun_current_prices AS
SELECT 
  t.token_address,
  tk.name,
  tk.symbol,
  t.price as last_price,
  t.trade_time as last_trade_time,
  COUNT(*) FILTER (WHERE t.tx_type = 'buy') as buy_count_1h,
  COUNT(*) FILTER (WHERE t.tx_type = 'sell') as sell_count_1h,
  AVG(t.amount) as avg_price,
  MAX(t.amount) as max_price_1h,
  MIN(t.amount) as min_price_1h
FROM bullrhun_trades t
JOIN bullrhun_tokens tk ON t.token_address = tk.token_address
WHERE t.trade_time >= NOW() - INTERVAL '1 hour'
GROUP BY t.token_address, tk.name, tk.symbol
WITH DATA;

-- User trading performance
CREATE MATERIALIZED VIEW bullrhun_user_performance AS
SELECT 
  u.wallet_address,
  COUNT(t.id) as total_trades,
  SUM(CASE WHEN t.tx_type = 'buy' THEN t.amount ELSE 0 END) as total_bought,
  SUM(CASE WHEN t.tx_type = 'sell' THEN t.amount ELSE 0 END) as total_sold,
  SUM(t.amount * t.price) as total_volume,
  AVG(t.amount * t.price) as avg_trade_size,
  MAX(t.trade_time) as last_trade_time,
  us.strategy_count as active_strategies
FROM users u
LEFT JOIN bullrhun_trades t ON u.wallet_address = t.wallet_address
LEFT JOIN (
  SELECT user_id, COUNT(*) as strategy_count
  FROM bullrhun_user_strategies 
  WHERE is_active = TRUE
  GROUP BY user_id
) us ON u.wallet_address = us.user_id
WHERE t.trade_time >= NOW() - INTERVAL '24 hours'
GROUP BY u.wallet_address, us.strategy_count
WITH DATA;

-- =====================================================
-- 6. PERFORMANCE MONITORING
-- =====================================================

-- Real-time performance tracking
CREATE OR REPLACE FUNCTION log_trading_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Log trading volume
  INSERT INTO performance_metrics (metric_name, metric_value, metric_unit)
  VALUES 
    ('trades_per_minute', 
     (SELECT COUNT(*) FROM bullrhun_trades WHERE trade_time >= NOW() - INTERVAL '1 minute'), 
     'trades/min'),
    
    ('avg_trade_size',
     (SELECT AVG(amount) FROM bullrhun_trades WHERE trade_time >= NOW() - INTERVAL '1 minute'),
     'SOL'),
    
    ('active_strategies', 
     (SELECT COUNT(*) FROM bullrhun_user_strategies WHERE is_active = TRUE),
     'strategies'),
     
    ('total_volume_24h',
     (SELECT SUM(amount * price) FROM bullrhun_trades WHERE trade_time >= NOW() - INTERVAL '24 hours'),
     'SOL');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. AUTOMATED MAINTENANCE
-- =====================================================

-- Create monthly partitions automatically
CREATE OR REPLACE FUNCTION create_bullrhun_partitions()
RETURNS void AS $$
DECLARE
  start_date DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months');
  end_date DATE := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
  partition_name TEXT;
BEGIN
  WHILE start_date <= end_date LOOP
    partition_name := 'bullrhun_trades_y' || TO_CHAR(start_date, 'YYYY') || 'm' || LPAD(TO_CHAR(start_date, 'MM'), 2, '0');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF bullrhun_trades FOR VALUES FROM (%L) TO (%L)', 
                   partition_name, 
                   TO_CHAR(start_date, 'YYYY-MM-DD'), 
                   TO_CHAR(start_date + INTERVAL '1 month' - INTERVAL '1 day', 'YYYY-MM-DD'));
    
    start_date := start_date + INTERVAL '1 month';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Token Creator Query Functions
-- =====================================================

-- Get all tokens created by a specific creator wallet
CREATE OR REPLACE FUNCTION get_tokens_by_creator(
  p_creator_wallet VARCHAR(255),
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  token_address VARCHAR(255),
  name VARCHAR(255),
  symbol VARCHAR(50),
  initial_buy DECIMAL(20,10),
  sol_amount DECIMAL(20,10),
  market_cap_sol DECIMAL(20,10),
  created_at TIMESTAMP WITH TIME ZONE,
  pool VARCHAR(100),
  description TEXT,
  image_url TEXT,
  twitter_url TEXT,
  website_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.token_address,
    t.name,
    t.symbol,
    t.initial_buy,
    t.sol_amount,
    t.market_cap_sol,
    t.created_at,
    t.pool,
    t.description,
    t.image_url,
    t.twitter_url,
    t.website_url
  FROM bullrhun_tokens t
  WHERE t.creator = p_creator_wallet
  ORDER BY t.created_at
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get creator statistics and performance metrics
CREATE OR REPLACE FUNCTION get_creator_stats(
  p_creator_wallet VARCHAR(255)
)
RETURNS TABLE (
  creator_wallet VARCHAR(255),
  total_tokens_created INTEGER,
  successful_tokens INTEGER,
  failed_tokens INTEGER,
  total_initial_buy_sol DECIMAL(20,10),
  total_sol_invested DECIMAL(20,10),
  average_initial_buy DECIMAL(20,10),
  success_rate DECIMAL(5,2),
  reputation_score DECIMAL(5,2),
  first_seen TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN,
  best_performing_token VARCHAR(255),
  best_token_return DECIMAL(10,2),
  worst_performing_token VARCHAR(255),
  worst_token_return DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.creator_wallet,
    c.total_tokens_created,
    c.successful_tokens,
    c.failed_tokens,
    c.total_initial_buy_sol,
    c.total_sol_invested,
    c.average_initial_buy,
    c.success_rate,
    c.reputation_score,
    c.first_seen,
    c.last_active,
    c.is_verified,
    c.best_performing_token,
    c.best_token_return,
    c.worst_performing_token,
    c.worst_token_return
  FROM bullrhun_token_creators c
  WHERE c.creator_wallet = p_creator_wallet;
END;
$$ LANGUAGE plpgsql;

-- Get top token creators by various metrics
CREATE OR REPLACE FUNCTION get_top_creators(
  p_limit INTEGER DEFAULT 50,
  p_order_by VARCHAR(50) DEFAULT 'total_tokens_created'
)
RETURNS TABLE (
  creator_wallet VARCHAR(255),
  total_tokens_created INTEGER,
  successful_tokens INTEGER,
  success_rate DECIMAL(5,2),
  reputation_score DECIMAL(5,2),
  total_initial_buy_sol DECIMAL(20,10),
  average_initial_buy DECIMAL(20,10),
  first_seen TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.creator_wallet,
    c.total_tokens_created,
    c.successful_tokens,
    c.success_rate,
    c.reputation_score,
    c.total_initial_buy_sol,
    c.average_initial_buy,
    c.first_seen,
    c.last_active,
    c.is_verified
  FROM bullrhun_token_creators c
  WHERE c.total_tokens_created > 0
  ORDER BY 
    CASE 
      WHEN p_order_by = 'total_tokens_created' THEN c.total_tokens_created
      WHEN p_order_by = 'success_rate' THEN c.success_rate
      WHEN p_order_by = 'reputation_score' THEN c.reputation_score
      WHEN p_order_by = 'total_initial_buy_sol' THEN c.total_initial_buy_sol
      ELSE c.total_tokens_created
    END
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old partitions (keep 3 months)
CREATE OR REPLACE FUNCTION cleanup_old_bullrhun_partitions()
RETURNS void AS $$
DECLARE
  cutoff_date DATE := CURRENT_DATE - INTERVAL '3 months';
  partition_name TEXT;
BEGIN
  FOR partition_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename LIKE 'bullrhun_trades_y%' 
      AND tablename < 'bullrhun_trades_y' || TO_CHAR(cutoff_date, 'YYYY') || 'm' || LPAD(TO_CHAR(cutoff_date, 'MM'), 2, '0')
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
    EXECUTE 'DROP TABLE IF EXISTS ' || partition_name || '_index';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. PERFORMANCE INDEXES FOR NEW FIELDS
-- =====================================================

-- Additional indexes for enhanced token metadata queries
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_creator_created ON bullrhun_tokens (creator, created_at);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_market_cap ON bullrhun_tokens (market_cap_sol) WHERE market_cap_sol IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_initial_buy ON bullrhun_tokens (initial_buy) WHERE initial_buy IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_pool_created ON bullrhun_tokens (pool, created_at);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_uri_processed ON bullrhun_tokens (uri_processed, created_at);

-- Composite indexes for creator analytics
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_creator_performance ON bullrhun_tokens (creator, market_cap_sol, initial_buy, created_at);

-- Indexes for token creator table
CREATE INDEX IF NOT EXISTS idx_bullrhun_creators_performance ON bullrhun_token_creators (total_tokens_created, success_rate);
CREATE INDEX IF NOT EXISTS idx_bullrhun_creators_reputation ON bullrhun_token_creators (reputation_score, total_tokens_created);
CREATE INDEX IF NOT EXISTS idx_bullrhun_creators_activity ON bullrhun_token_creators (last_active, first_seen);
CREATE INDEX IF NOT EXISTS idx_bullrhun_creators_investment ON bullrhun_token_creators (total_initial_buy_sol, average_initial_buy);

-- BRIN indexes for time-series data on large tables
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_created_brin ON bullrhun_tokens USING BRIN (created_at);
CREATE INDEX IF NOT EXISTS idx_bullrhun_creators_last_active_brin ON bullrhun_token_creators USING BRIN (last_active);

-- =====================================================
-- 9. VERSION CONTROL
-- =====================================================

-- Create schema version tracking
CREATE TABLE IF NOT EXISTS bullrhun_schema_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rollback_script TEXT
);

-- Log this upgrade
INSERT INTO bullrhun_schema_versions (version, description, applied_at)
VALUES (
  '2.1.0',
  'BullRhun-compatible ultra-fast trading infrastructure with wallet_address primary keys and PumpPortal integration',
  NOW()
);

-- =====================================================
-- 9. VERIFICATION AND SETUP
-- =====================================================

-- Verify all BullRhun tables created
DO $$
DECLARE
  table_name TEXT;
  object_type TEXT;
BEGIN
  -- Check critical tables
  FOR table_name, object_type IN 
    VALUES ('bullrhun_trades', 'TABLE'), ('bullrhun_tokens', 'TABLE'), 
           ('bullrhun_user_strategies', 'TABLE'), ('bullrhun_community_signals', 'TABLE'),
           ('pumpportal_buffer', 'TABLE'), ('bullrhun_current_prices', 'MATERIALIZED VIEW'), 
           ('bullrhun_user_performance', 'MATERIALIZED VIEW')
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) THEN
      RAISE LOG 'Created BullRhun %: %', object_type, table_name;
    ELSE
      RAISE LOG 'Missing BullRhun %: %', object_type, table_name;
    END IF;
  END LOOP;
END $$;

-- Insert default strategies for existing users
INSERT INTO bullrhun_user_strategies (wallet_address, strategy_name, strategy_type, parameters)
SELECT 
  u.wallet_address_new,
  'Auto New Token Hunter',
  'auto_new_tokens',
  '{"max_buy_amount": 0.5, "auto_sell_after": "2x", "min_gain_percent": 50, "check_frequency": 30, "max_tokens_per_hour": 10}'
FROM users u 
WHERE u.wallet_address_new IS NOT NULL
ON CONFLICT (wallet_address, token_address, strategy_type) DO NOTHING;

-- =====================================================
-- 10. FINAL VERIFICATION
-- =====================================================

-- Performance test queries
EXPLAIN ANALYZE 
SELECT count(*) 
FROM bullrhun_trades 
WHERE trade_time >= NOW() - INTERVAL '1 hour';

-- Test materialized view refresh
EXPLAIN ANALYZE 
REFRESH MATERIALIZED VIEW bullrhun_current_prices;

-- Test index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND tablename IN ('bullrhun_trades', 'bullrhun_tokens', 'bullrhun_user_strategies');

-- Setup automated functions to run periodically
CREATE OR REPLACE FUNCTION setup_bullrhun_jobs()
RETURNS void AS $$
BEGIN
  -- Note: cron.schedule is pg_cron extension function
  -- This would require: CREATE EXTENSION IF NOT EXISTS pg_cron;
  
  -- For now, we'll use basic function calls
  -- The actual scheduling should be handled by external scheduler/cron jobs
  
  RAISE LOG 'BullRhun automated functions created';
  RAISE LOG 'Note: cron.schedule requires pg_cron extension installation';
END;
$$ LANGUAGE plpgsql;