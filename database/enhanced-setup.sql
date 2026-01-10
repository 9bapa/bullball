-- BullRhun Enhanced Schema - Fixed Version
-- This adds the enhanced features without breaking existing tables

-- Add new columns to bullrhun_tokens if they don't exist
DO $$
BEGIN
    -- Add bonding curve and market cap columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'bonding_curve_key') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN bonding_curve_key VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'market_cap_sol') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN market_cap_sol DECIMAL(20,10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'initial_buy') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN initial_buy DECIMAL(20,10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'uri') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN uri TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'description') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'image_url') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'uri_processed') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN uri_processed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add trade_time column to bullrhun_trades if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_trades' AND column_name = 'trade_time') THEN
        ALTER TABLE bullrhun_trades ADD COLUMN trade_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_creator ON bullrhun_tokens(creator, created_at);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_market_cap ON bullrhun_tokens(market_cap_sol) WHERE market_cap_sol IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_initial_buy ON bullrhun_tokens(initial_buy) WHERE initial_buy IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bullrhun_trades_time ON bullrhun_trades(trade_time);

-- Create PumpPortal buffer table for real-time data
CREATE TABLE IF NOT EXISTS pumpportal_buffer (
  id BIGSERIAL PRIMARY KEY,
  raw_message JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_type VARCHAR(50),
  priority INT DEFAULT 1
) WITH (autovacuum_enabled=false, fillfactor=100);

-- Add new columns to bullrhun_token_creators
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_token_creators' AND column_name = 'success_rate') THEN
        ALTER TABLE bullrhun_token_creators ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_token_creators' AND column_name = 'reputation_score') THEN
        ALTER TABLE bullrhun_token_creators ADD COLUMN reputation_score DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_token_creators' AND column_name = 'total_initial_buy_sol') THEN
        ALTER TABLE bullrhun_token_creators ADD COLUMN total_initial_buy_sol DECIMAL(20,10) DEFAULT 0.000000000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_token_creators' AND column_name = 'first_seen') THEN
        ALTER TABLE bullrhun_token_creators ADD COLUMN first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_token_creators' AND column_name = 'last_active') THEN
        ALTER TABLE bullrhun_token_creators ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create optimized query functions
CREATE OR REPLACE FUNCTION get_tokens_by_creator(
  p_creator_wallet VARCHAR(255),
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  token_address VARCHAR(255),
  name VARCHAR(255),
  symbol VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.token_address,
    t.name,
    t.symbol,
    t.created_at
  FROM bullrhun_tokens t
  WHERE t.creator = p_creator_wallet
  ORDER BY t.created_at
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100),
  metric_value DECIMAL(20,10),
  metric_unit VARCHAR(50),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time ON performance_metrics(metric_name, recorded_at);

-- Success message
SELECT 'BullRhun enhanced schema deployed successfully!' as result,
       now() as deployment_time;