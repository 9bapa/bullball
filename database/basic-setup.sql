-- BullRhun Basic Schema - Create missing tables first
-- This creates the basic users table that our upgrade script expects

-- Create basic users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic user_strategies table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_strategies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  strategy_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test user if not exists
INSERT INTO users (wallet_address) 
VALUES ('8qqCpRYUhm4KB5DgA66WCFLtu46GKgYNeX7sg5rEzjzM')
ON CONFLICT (wallet_address) DO NOTHING;

-- Create basic bullrhun tables (without ENUM issues)
CREATE TABLE IF NOT EXISTS bullrhun_trades (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255),
  token_address VARCHAR(255),
  amount DECIMAL(20,10),
  price DECIMAL(20,10),
  trade_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bullrhun_tokens (
  id SERIAL PRIMARY KEY,
  token_address VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  symbol VARCHAR(50),
  creator VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bullrhun_user_strategies (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255),
  strategy_name VARCHAR(100),
  strategy_type VARCHAR(50), -- Using VARCHAR instead of ENUM
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bullrhun_token_creators (
  id SERIAL PRIMARY KEY,
  creator_wallet VARCHAR(255) UNIQUE NOT NULL,
  total_tokens_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bullrhun_trades_wallet ON bullrhun_trades(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_address ON bullrhun_tokens(token_address);
CREATE INDEX IF NOT EXISTS idx_bullrhun_creators_wallet ON bullrhun_token_creators(creator_wallet);

-- Success message
SELECT 'BullRhun basic schema created successfully!' as result;