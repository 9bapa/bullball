-- Create bullrhun_games_trades table
CREATE TABLE bullrhun_games_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES bullrhun_games(id) ON DELETE CASCADE,
  trader_wallet_address TEXT NOT NULL,
  amount NUMERIC(20, 9) NOT NULL,
  price_usd NUMERIC(20, 9),
  price_native NUMERIC(20, 9),
  transaction_signature TEXT NOT NULL,
  trade_type TEXT CHECK (trade_type IN ('buy', 'sell')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_trades_game_id ON bullrhun_games_trades(game_id);
CREATE INDEX idx_trades_trader ON bullrhun_games_trades(trader_wallet_address);
CREATE INDEX idx_trades_created_at ON bullrhun_games_trades(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bullrhun_games_trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view trades"
  ON bullrhun_games_trades FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert trades"
  ON bullrhun_games_trades FOR INSERT
  WITH CHECK (true);