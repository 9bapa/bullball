## Implementation Plan

### 1. Auto-Fetch DexScreener Data on Token Selection

**Create API endpoint** (`/api/bullrhun/games/[id]/dex-update`):
- Fetch pair address and pricing from DexScreener
- Update game record with DexScreener data
- Return updated game data

**Update `handleTokenSelect` in swap/page.tsx**:
- When a token is selected:
  - Check if game exists for the token mint
  - If game exists but no `pair_address`:
    - Call DexScreener API to get best pair
    - Update game via new API endpoint
  - Fetch latest pricing info and update game
  - Set `activeTab` to `'trades'` (auto-switch tab)

### 2. Update Status Tab with Pricing Details

Replace current "Info" tab content with pricing display:
- **Price Card**: Current price (USD + SOL)
- **24h Change**: Percentage with color indicator (green/red)
- **Volume**: 24h trading volume
- **Liquidity**: Current pool liquidity
- **Market Cap**: Token market capitalization
- **FDV**: Fully diluted valuation
- **Pair Info**: DEX name, pair link

### 3. Redesign Trades Tab as Responsive Table

Replace card-based layout with a proper table:

**Table Structure**:
- Time (clickable for exact timestamp)
- Trader Address (truncated, hover to show full)
- Type (BUY/SELL badges with colors)
- Amount (SOL)
- Price USD
- TX Signature (link to Solscan)

**Responsive Design**:
- Desktop: Full table with all columns
- Tablet: Show key columns, hide less important
- Mobile: Card-style rows with stacked info

**Styling**:
- Gradient header
- Hover effects on rows
- Status badges with proper colors
- Compact but readable fonts

### 4. Leverage Real-time Trades Subscription

Ensure the existing Supabase subscription properly updates the trades table in real-time when new trades are recorded.

### Files to Modify:
1. `/src/app/api/bullrhun/games/[id]/dex-update/route.ts` (new)
2. `/src/app/swap/page.tsx` (major updates)

### Expected Result:
- Users select token → auto-fetches pricing → shows details in Status tab
- Token selection auto-switches to Trades tab
- Trades displayed in professional, responsive table
- Real-time updates reflected instantly