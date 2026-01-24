# Plan: DexScreener API Integration & Trades Tracking

## 1. Database Schema Changes

### Create `bullrhun_games_trades` table
Create new migration `src/schema/migrations/007_create_bullrhun_trades.sql`:
```sql
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

CREATE INDEX idx_trades_game_id ON bullrhun_games_trades(game_id);
CREATE INDEX idx_trades_trader ON bullrhun_games_trades(trader_wallet_address);
CREATE INDEX idx_trades_created_at ON bullrhun_games_trades(created_at DESC);
```

### Update `bullrhun_games` table
Create migration `src/schema/migrations/008_update_games_with_dex_data.sql`:
```sql
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
```

## 2. DexScreener API Integration

### Create `src/lib/dexscreener.ts`:
```typescript
// GET /token-pairs/v1/{chainId}/{tokenAddress}
export async function getDexPairs(tokenAddress: string) {
  const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`)
  return response.json()
}

// GET /latest/dex/pairs/{chainId}/{pairId}
export async function getDexPairPrice(pairId: string) {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairId}`)
  return response.json()
}
```

## 3. Backend API Updates

### Update `/api/bullrhun/games/route.ts` (POST):
- After getting token metadata, call DexScreener API to get pair data
- Store pair_address, volume, price_change, liquidity, marketcap, fdv, websites, socials, dex_id, price_usd in game record

### Create `/api/bullrhun/trades/route.ts`:
- **POST**: Record trade after swap execution
  - Validate input (game_id, trader, amount, price, tx_signature, trade_type)
  - Create trade record in database
  - Update game trade_count
  - Optionally update game wallet balance if applicable

### Update `/api/bullrhun/games/[id]/route.ts`:
- Add endpoint to fetch latest price from DexScreener using stored pair_address
- Return current price, volume, liquidity, marketcap, fdv

## 4. Frontend Updates

### Update `swap/page.tsx`:
- **Add state for DexScreener data**:
  - `currentPrice`, `volume`, `priceChange`, `liquidity`, `marketcap`, `fdv`

- **Update `handleSwapTokens()`**:
  - Fetch current price from DexScreener before swap
  - Calculate estimated output using real price
  - After successful swap, call `/api/bullrhun/trades` to record trade
  - Include trade_type ('buy' or 'sell')

- **Update `handleCreateGame()`**:
  - No changes needed (backend handles DexScreener data)

- **Add `fetchDexData()` function**:
  - Call DexScreener API using stored pair_address
  - Update game data with latest price/volume/liquidity
  - Update UI with real-time stats

- **Update game display**:
  - Show current price, 24h change, volume, liquidity, marketcap, FDV
  - Add links to websites and socials from DexScreener data

- **Add trade history tab**:
  - Display recent trades for selected game
  - Show trader (truncated address), amount, price, tx link, type (buy/sell)

## 5. Real-time Updates

- Add Supabase subscription to `bullrhun_games_trades` table
- Update trade history when new trades are recorded
- Update game stats when trades occur

## Key Features:
- ✅ Trade tracking with full details
- ✅ Real-time price from DexScreener
- ✅ Market metrics (volume, liquidity, marketcap, FDV)
- ✅ Website and social links from DexScreener
- ✅ Accurate swap calculations using live price
- ✅ Trade history display