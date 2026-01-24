-- Create bullrhun_game_boosts table
CREATE TABLE bullrhun_game_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES bullrhun_games(id) ON DELETE CASCADE,
  user_wallet_address TEXT NOT NULL,
  amount NUMERIC(20, 9) NOT NULL CHECK (amount > 0),
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_boosts_game_id ON bullrhun_game_boosts(game_id);
CREATE INDEX idx_boosts_user_wallet ON bullrhun_game_boosts(user_wallet_address);
CREATE INDEX idx_boosts_created_at ON bullrhun_game_boosts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bullrhun_game_boosts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view boosts"
  ON bullrhun_game_boosts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert boosts"
  ON bullrhun_game_boosts FOR INSERT
  WITH CHECK (true);

-- No delete/update policies - boosts are immutable records