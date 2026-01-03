-- Add price column to bullrhun_tokens table
-- This script adds the price column to track token prices from trades

ALTER TABLE public.bullrhun_tokens 
ADD COLUMN IF NOT EXISTS price DECIMAL(20, 10);

-- Add market_cap column for market cap tracking
ALTER TABLE public.bullrhun_tokens 
ADD COLUMN IF NOT EXISTS market_cap DECIMAL(30, 2);

-- Add volume_24h column for 24h volume tracking  
ALTER TABLE public.bullrhun_tokens 
ADD COLUMN IF NOT EXISTS volume_24h DECIMAL(30, 10);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_mint ON public.bullrhun_tokens(mint);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_price ON public.bullrhun_tokens(price);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_market_cap ON public.bullrhun_tokens(market_cap);
CREATE INDEX IF NOT EXISTS idx_bullrhun_tokens_updated_at ON public.bullrhun_tokens(updated_at);

-- Grant necessary permissions for service role
-- Note: Enable service role to bypass RLS and manage tokens
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.bullrhun_tokens TO service_role;

-- If RLS is enabled, create policy to allow service role full access
ALTER POLICY "Service role full access" ON public.bullrhun_tokens 
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');