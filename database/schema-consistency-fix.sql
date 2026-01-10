-- BullRhun Schema Consistency Fix
-- Ensure all tables have bullrhun_ prefix and are compatible with enhanced features

-- Check existing structure and add missing compatibility columns
DO $$
BEGIN
    -- Ensure bullrhun_users has wallet_address_new column for migration compatibility
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bullrhun_users' 
        AND column_name = 'wallet_address_new'
    ) THEN
        ALTER TABLE bullrhun_users ADD COLUMN wallet_address_new VARCHAR(255) UNIQUE;
        
        -- Create index on the new column
        CREATE INDEX IF NOT EXISTS idx_bullrhun_users_wallet_new ON bullrhun_users(wallet_address_new);
    END IF;
    
    -- Ensure bullrhun_tokens has all enhanced columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'bonding_curve_key') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN bonding_curve_key VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'v_tokens_in_bonding_curve') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN v_tokens_in_bonding_curve DECIMAL(20,10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'v_sol_in_bonding_curve') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN v_sol_in_bonding_curve DECIMAL(20,10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'is_mayhem_mode') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN is_mayhem_mode BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name = 'pool') THEN
        ALTER TABLE bullrhun_tokens ADD COLUMN pool VARCHAR(100) DEFAULT 'pump';
    END IF;
    
    -- Ensure bullrhun_trades has all required columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_trades' AND column_name = 'trade_time') THEN
        ALTER TABLE bullrhun_trades ADD COLUMN trade_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bullrhun_trades' AND column_name = 'token_hash') THEN
        ALTER TABLE bullrhun_trades ADD COLUMN token_hash VARCHAR(64) GENERATED ALWAYS AS (md5(token_address)) STORED;
    END IF;
    
    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_token_hash_brin ON bullrhun_tokens USING BRIN (token_address, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bullrhun_trades_wallet_time ON bullrhun_trades(wallet_address, trade_time DESC);
    CREATE INDEX IF NOT EXISTS idx_bullrhun_trades_price_time ON bullrhun_trades(price, trade_time DESC);
    
    -- Ensure all tables have proper indexes
    CREATE INDEX IF NOT EXISTS idx_bullrhun_users_wallet_address ON bullrhun_users(wallet_address);
    CREATE INDEX IF NOT EXISTS idx_bullrhun_users_wallet_new ON bullrhun_users(wallet_address_new);
    CREATE INDEX IF NOT EXISTS idx_bullrhun_users_active ON bullrhun_users(is_active);
    
END $$;

-- Create performance metrics table for monitoring
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20,10),
    metric_unit VARCHAR(50),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time ON performance_metrics(metric_name, recorded_at DESC);

-- Create bullrhun_user_strategies table with proper bullrhun_ prefix
CREATE TABLE IF NOT EXISTS bullrhun_user_strategies (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    token_address VARCHAR(255),
    strategy_name VARCHAR(100) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_bullrhun_user_strategies_wallet ON bullrhun_user_strategies(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bullrhun_user_strategies_token ON bullrhun_user_strategies(token_address);
CREATE INDEX IF NOT EXISTS idx_bullrhun_user_strategies_active ON bullrhun_user_strategies(is_active);

-- Create bullrhun_community_signals table
CREATE TABLE IF NOT EXISTS bullrhun_community_signals (
    id SERIAL PRIMARY KEY,
    creator_wallet VARCHAR(255) NOT NULL,
    token_address VARCHAR(255),
    signal_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    subscribers JSONB DEFAULT '[]',
    active_subscribers INT DEFAULT 0,
    signal_type VARCHAR(50) NOT NULL,
    trigger_conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bullrhun_community_signals_creator ON bullrhun_community_signals(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_bullrhun_community_signals_token ON bullrhun_community_signals(token_address);
CREATE INDEX IF NOT EXISTS idx_bullrhun_community_signals_public ON bullrhun_community_signals(is_public);

-- Success verification
SELECT 'BullRhun schema consistency fix completed successfully!' as result,
       COUNT(*) as total_bullrhun_tables
FROM information_schema.tables 
WHERE table_name LIKE 'bullrhun_%' 
  AND table_schema = 'public';