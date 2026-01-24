# Plan: Real-time Supabase Subscriptions for BullRhun Games

## 1. Add Supabase Real-time Subscription Hook
- Import `supabase` from `@/lib/supabase`
- Create `useRealtimeGames()` hook to subscribe to `bullrhun_games` table
- Subscribe to INSERT, UPDATE, and DELETE events
- Handle payload changes to update local state

## 2. Add Floating Refresh Button to Stats Tab
- Add floating refresh button near prize pot display (lines 1336-1341)
- Use `RefreshCw` icon with hover effects
- Add tooltip: "Refresh game data"
- Position as floating button with `absolute` positioning

## 3. Add Manual Refresh Functionality
- Create `refreshGame()` function to fetch single game by ID
- Create `refreshAllGames()` function to refresh all games
- Add loading state for refresh operations
- Show toast notification on refresh success/failure

## 4. Integrate Real-time Updates
- Replace static `fetchGames()` calls with real-time subscription in `useEffect`
- Auto-update when any game's `game_wallet_balance` changes
- Auto-update when `trade_count` changes
- Maintain backward compatibility with existing fetch functions

## 5. Error Handling & Cleanup
- Handle subscription errors gracefully
- Cleanup subscriptions on component unmount
- Add visual feedback for refresh operations
- Show connection status indicator

## Key Changes:
- `swap/page.tsx`: Add subscription hook, refresh button, state management
- No changes to database schema or API routes required