# Plan: Boost Feature for BullRhun Games

## 1. Database Schema - Create `bullrhun_game_boosts` Table
Create new migration file `src/schema/migrations/006_create_bullrhun_boosts.sql`:
```sql
CREATE TABLE bullrhun_game_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES bullrhun_games(id) ON DELETE CASCADE,
  user_wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_boosts_game_id ON bullrhun_game_boosts(game_id);
CREATE INDEX idx_boosts_user_wallet ON bullrhun_game_boosts(user_wallet_address);
CREATE INDEX idx_boosts_created_at ON bullrhun_game_boosts(created_at DESC);
```

## 2. Backend API - Create Boosts Endpoint
Create `/api/bullrhun/boosts/route.ts`:
- **POST**: Create boost record and return signed SOL transfer transaction
  - Validate user input (amount, game_id)
  - Create boost record in database with status 'pending'
  - Create signed transaction from user wallet to game wallet
  - Return serialized transaction for user to sign and send
- **GET**: Fetch boosts for a specific game (query param: game_id)

## 3. Frontend - Update Swap Page
**Replace "Trade Now" with "Boost" button** (line 1047-1050):
```jsx
<Button onClick={() => handleBoost(selectedGame)} size="lg" className="gap-2">
  <Flame className="h-5 w-5" />
  Boost
</Button>
```

**Add Boost Modal** (new Dialog component):
- Input field for SOL amount to boost
- Display user's current SOL balance
- Show minimum boost amount (0.01 SOL)
- Display total amount including fees
- Confirm button to initiate boost
- Loading state during transaction

**Add Boost State & Functions**:
- `showBoostModal` state for modal visibility
- `boostAmount` state for input
- `isBoosting` state for loading
- `handleBoost()` - Open modal
- `handleConfirmBoost()` - Call API and process transaction
- `handleBoostSuccess()` - Update game balance on success

## 4. Add Recent Boosts Display
In the game details tabs, add a "Boosts" tab showing:
- List of recent boosts for the game
- User wallet address (truncated)
- Amount boosted
- Date/time
- Transaction signature link (Solscan)

## 5. Integration with Real-time Updates
- After successful boost, update `game_wallet_balance` in database
- Real-time subscription will automatically update UI
- Show success toast with transaction link

## Key Features:
- ✅ User-friendly modal interface
- ✅ Balance validation before boost
- ✅ Transaction signing via connected wallet
- ✅ Automatic prize pot update via real-time subscription
- ✅ Boost history tracking
- ✅ Error handling and user feedback