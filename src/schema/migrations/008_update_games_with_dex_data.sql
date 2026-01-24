-- Update bullrhun_games table with DexScreener data
ALTER TABLE bullrhun_games ADD COLUMN pair_address TEXT;
ALTER TABLE bullrhun_games ADD COLUMN volume_usd NUMERIC(20, 2);
ALTER TABLE bullrhun_games ADD COLUMN price_change_24h NUMERIC(10, 2);
ALTER TABLE bullrhun_games ADD COLUMN liquidity_usd NUMERIC(20, 2);
ALTER TABLE bullrhun_games ADD COLUMN marketcap_usd NUMERIC(20, 2);
ALTER TABLE bullrhun_games ADD COLUMN fdv_usd NUMERIC(20, 2);
ALTER TABLE bullrhun_games ADD COLUMN websites JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bullrhun_games ADD COLUMN socials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bullrhun_games ADD COLUMN dex_id TEXT;
ALTER TABLE bullrhun_games ADD COLUMN price_usd NUMERIC(20, 9);
ALTER TABLE bullrhun_games ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for pair_address lookups
CREATE INDEX idx_games_pair_address ON bullrhun_games(pair_address);