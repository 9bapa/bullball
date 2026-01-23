## BullRhun Game System Implementation

### 1. Database Schema Updates
   - **bullrhun_games` table for game instances:
     - `id`, `token_mint`, `trade_goal` (50-1000), `trade_count`
     - `trade_type` ('buys_only' | 'buys_sells'), `min_trade_amount` (0.1-10)
     - `is_bull_mode` (>3 SOL), `game_wallet_address`, `game_wallet_private_key` (encrypted)
     - `game_wallet_balance`, `status` ('active' | 'completed' | 'reset')
     - `winner_wallet_address`, `winning_signature`, `created_at`, `completed_at`

   - **bullrhun_winners` table for past winners:
     - `id`, `game_id`, `token_mint`, `winner_wallet_address`
     - `winning_amount`, `winning_signature`, `payout_tx_id`
     - `game_stats` (trade_count, total_volume), `won_at`

   - **bullrhun_users` table update:
     - Add `trade_wallet_address`, `trade_wallet_private_key` (encrypted)

### 2. API Routes
   - `/api/bullrhun/games` - List all games, filter by token, order by game wallet balance
   - `/api/bullrhun/games/create` - Create new game for token (generates game wallet)
   - `/api/bullrhun/games/[id]` - Get game details and stats
   - `/api/bullrhun/trades` - Record trade, increment game stats, split 1% fee (0.05% game wallet, 0.05% WALLET_PLATFORM)
   - `/api/bullrhun/games/[id]/reset` - Reset game with new random settings
   - `/api/bullrhun/winners` - Get history of past winners

### 3. Swap Page Updates
   - Add "Create Game" button for token registration
   - Integrate with PumpPortal API (user signs with their wallet)
   - Show game stats panel (trade count, goal progress, game wallet balance)
   - Display registered tokens table sorted by game wallet balance
   - Add game explainer section
   - Add "Past Winners" section with payout tx IDs
   - Show recent swaps with trader info

### 4. Game Logic
   - Total trade fee: 1% (split: 0.05% game wallet, 0.05% WALLET_PLATFORM)
   - User signs transaction with their wallet via PumpPortal API
   - User must deposit funds to trade wallet before playing
   - On swap: increment trade count, distribute fees
   - Check if trade goal reached → declare winner, transfer game wallet balance
   - Record platform stats (total games, total trades, total volume)
   - Support community donations to game wallet

### 5. UI Components
   - Game card showing progress bar towards goal
   - Token registration modal (address, name, ticker)
   - Winner announcement modal with transaction details
   - Past winners table with payout tx links
   - Trade wallet deposit/management interface
   - Real-time updates via polling