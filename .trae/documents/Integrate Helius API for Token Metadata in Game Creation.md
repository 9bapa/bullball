# Plan: Integrate Helius API for Token Metadata

## 1. Database Schema Updates
- Add columns to `bullrhun_games` table:
  - `token_image_url` (text) - Store token image URL
  - `token_description` (text) - Store token description
  - `token_supply` (numeric) - Store total supply
  - `token_decimals` (integer) - Store token decimals

## 2. Create Helius API Service
- Create `/src/lib/helius.ts` service file
- Implement `getTokenMetadata(mintAddress: string)` function
- Use `HELIUS_API_KEY` from environment
- Call Helius RPC: `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
- Extract and return: symbol, name, description, image (CDN URI), supply, decimals

## 3. Update API Route
- Modify `/src/app/api/bullrhun/games/route.ts` POST handler:
  - Call Helius API to fetch metadata using provided `tokenMint`
  - Extract: symbol, name, description, image_url, supply, decimals
  - Store in database along with existing game data
  - Handle API failures gracefully with fallback to user-provided values

## 4. Update Frontend
- Modify `/src/app/swap/page.tsx`:
  - Update Create Game form to only require `tokenMint` (auto-fetch other fields)
  - Show loading state while fetching from Helius
  - Display token image in game cards
  - Use fetched metadata in token selector display

## 5. Update Game Display
- Modify game card components to show:
  - Token image (large, centered)
  - Token description (if available)
  - Supply and decimals info (if useful)

## Benefits
- ✅ Users only need to enter token mint address
- ✅ Automatic metadata fetching from reliable Helius API
- ✅ Richer game displays with token images
- ✅ Better UX with pre-filled token details