-- Add Row Level Security policies for bullrhun_games, bullrhun_wishlist, and bullrhun_cart tables

-- ============================================================================
-- BULLRHUN_GAMES TABLE POLICIES
-- ============================================================================

-- Enable RLS on bullrhun_games table
ALTER TABLE bullrhun_games ENABLE ROW LEVEL SECURITY;

-- Service role has full access to all games
CREATE POLICY "Service role full access to games" 
ON bullrhun_games FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Public read access to all games (anyone can view active games)
CREATE POLICY "Public read access to games" 
ON bullrhun_games FOR SELECT 
USING (true);

-- Only service role can insert new games
CREATE POLICY "Service role can create games" 
ON bullrhun_games FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Only service role can update games
CREATE POLICY "Service role can update games" 
ON bullrhun_games FOR UPDATE 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Only service role can delete games
CREATE POLICY "Service role can delete games" 
ON bullrhun_games FOR DELETE 
USING (auth.role() = 'service_role');

-- ============================================================================
-- BULLRHUN_WISHLIST TABLE POLICIES
-- ============================================================================

-- Enable RLS on bullrhun_wishlist table
ALTER TABLE bullrhun_wishlist ENABLE ROW LEVEL SECURITY;

-- Service role has full access to all wishlist items
CREATE POLICY "Service role full access to wishlist" 
ON bullrhun_wishlist FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist" 
ON bullrhun_wishlist FOR SELECT 
USING (user_wallet_address = public.get_wallet_from_auth() OR auth.role() = 'service_role');

-- Users can add items to their own wishlist
CREATE POLICY "Users can add to own wishlist" 
ON bullrhun_wishlist FOR INSERT 
WITH CHECK (user_wallet_address = public.get_wallet_from_auth());

-- Users can remove items from their own wishlist
CREATE POLICY "Users can remove from own wishlist" 
ON bullrhun_wishlist FOR DELETE 
USING (user_wallet_address = public.get_wallet_from_auth());

-- ============================================================================
-- BULLRHUN_CART TABLE POLICIES
-- ============================================================================

-- Enable RLS on bullrhun_cart table
ALTER TABLE bullrhun_cart ENABLE ROW LEVEL SECURITY;

-- Service role has full access to all cart items
CREATE POLICY "Service role full access to cart" 
ON bullrhun_cart FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can view their own cart items
CREATE POLICY "Users can view own cart" 
ON bullrhun_cart FOR SELECT 
USING (user_wallet_address = public.get_wallet_from_auth() OR auth.role() = 'service_role');

-- Users can add items to their own cart
CREATE POLICY "Users can add to own cart" 
ON bullrhun_cart FOR INSERT 
WITH CHECK (user_wallet_address = public.get_wallet_from_auth());

-- Users can update their own cart items (quantity, variant, etc.)
CREATE POLICY "Users can update own cart" 
ON bullrhun_cart FOR UPDATE 
USING (user_wallet_address = public.get_wallet_from_auth())
WITH CHECK (user_wallet_address = public.get_wallet_from_auth());

-- Users can remove items from their own cart
CREATE POLICY "Users can remove from own cart" 
ON bullrhun_cart FOR DELETE 
USING (user_wallet_address = public.get_wallet_from_auth());

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- bullrhun_games:
--   - Public read access: Anyone can view games (needed for game display)
--   - Service role only: All write operations (create, update, delete games)
--   - Game wallet private key is protected at application level (never exposed)

-- bullrhun_wishlist:
--   - Users can only view, add, and remove their own wishlist items
--   - Service role has full access for admin operations

-- bullrhun_cart:
--   - Users can only view, add, update, and remove their own cart items
--   - Service role has full access for admin operations
--   - Users cannot see other users' carts or wishlist items
