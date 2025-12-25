# BullRhun End-to-End Profit Cycle Flow (Redesigned Architecture)

## 🔄 Automated Cycle Execution
**Trigger**: Cron job runs every 2 minutes (`*/2 * * * *`)
**Service**: `src/services/cron.service.ts` manages automated execution
**No frontend timer dependencies** - cycles are completely backend-driven

## 1) Cycle Initialization
- Action: Create cycle record and validate system health
- Code: `src/services/cycle.service.ts:executeCycle()`
- Implementation: Creates `bullrhun_cycles` record with `status: 'pending'`
- Health Checks: Listener status, configuration validation, concurrent cycle prevention
- Logs: `⏰ Executing cycle at ${timestamp}`

## 2) Creator Fee Collection
- Action: Request encoded fee collection via PumpPortal
- Code: `src/services/cycle.service.ts:collectCreatorFees()` → `collectCreatorFee()`
- Implementation: Uses `src/lib/pumpportal.ts` with `action: 'collectCreatorFee'`
- Storage: Updates `bullrhun_cycles.fee_signature` and `fee_amount_sol`
- Logs: Fee collection success/failure with signature

## 3) Platform & Reward Fee Distribution
- Action: Split fees (12% platform, 10% rewards, 78% operations)
- Code: `src/services/cycle.service.ts:handlePlatformFees()`
- Implementation: 
  - Transfer 12% to `PLATFORM_WALLET` via `transferSol()`
  - Transfer 10% to `REWARD_WALLET` via `transferSol()`
  - Remaining 78% available for buying/liquidity
- Storage: Updates cycle record with fee allocations
- Configuration: `PLATFORM_WALLET`, `REWARD_WALLET` environment variables

## 4) Token Purchase
- Action: Buy token using available SOL (split based on graduation status)
- Code: `src/services/cycle.service.ts:executeBuy()` → `buyToken()`
- Implementation: `src/lib/pumpportal.ts` with venue detection (`pump-amm` → `pump` fallback)
- Allocation Logic:
  - **Non-graduated**: Full amount for buy
  - **Graduated**: 50% buy, 50% liquidity
- Storage: Creates `bullrhun_trades` record with `is_system_buy: true`
- Logs: Venue chosen, amount, signature

## 5) Token Transfer (Platform Fees)
- Action: Transfer purchased tokens to platform wallet (if enabled)
- Code: `src/services/cycle.service.ts:handleTokenTransfer()`
- Implementation: `getTokenBalance()` → `transferToken()` to `PLATFORM_WALLET`
- Condition: Only if `FEATURES.PLATFORM_FEES_ENABLED` and tokens > 0
- Logs: Token transfer amount and destination

## 6) Liquidity Management
- Action: Add liquidity and burn LP tokens (if enabled)
- Code: `src/services/cycle.service.ts:handleLiquidity()` → `depositAndBurnLp()`
- Implementation: `src/lib/pumpswap.ts` handles deposit and LP burn
- Storage: Creates `bullrhun_liquidity_events` record
- Configuration: `PUMPSWAP_POOL` required, controlled by `FEATURES.LIQUIDITY_ENABLED`
- Logs: Deposit and burn signatures with amounts

## 7) Reward Distribution
- Action: Send rewards to qualifying trader when threshold met
- Code: `src/services/cycle.service.ts:handleRewards()` → `transferRewardSol()`
- Implementation:
  - Check trade threshold via `bullrhun_listeners.current_trade_count`
  - Find last qualifying trader (≥ MIN_GIFT_TRADE_AMOUNT)
  - Transfer reward amount to last trader's address
  - Generate new random threshold (30-300 trades)
- Storage: Creates `bullrhun_rewards` record with mode (`last-trader` or `address`)
- Configuration: `REWARD_MODE`, `REWARD_ADDRESS`, `REWARD_SOL_AMOUNT`

## 8) Cycle Completion
- Action: Update cycle status and system metrics
- Code: `src/services/cycle.service.ts:updateMetrics()` → `MetricsRepository.updateMetrics()`
- Implementation:
  - Update `bullrhun_cycles.status` to `completed`
  - Increment global metrics in `bullrhun_metrics`
  - Record execution timestamp
- Storage: Updates single metrics row with aggregated data
- Logs: Cycle completion summary with all signatures

## 🔍 Real-Time Trade Monitoring

### WebSocket Listener
- Service: `src/services/trade-listener.service.ts` (TypeScript rewrite)
- Connection: WebSocket to `wss://pumpportal.fun/api/data?api-key=${API_KEY}`
- Subscription: `subscribeTokenTrade` with monitored mint
- Heartbeat: Updates `bullrhun_listeners.last_heartbeat` every 2 minutes

### Trade Processing
- Action: Process incoming trade messages from PumpPortal
- Code: `src/services/trade-listener.service.ts:handleMessage()`
- Storage: Creates `bullrhun_trades` records with `is_system_buy: false`
- Threshold Tracking: Increments `bullrhun_listeners.current_trade_count` for qualifying trades
- API Integration: Calls `/api/bullrhun/trades` endpoint to persist trades

### Health Monitoring
- Endpoint: `GET /api/bullrhun/listener/status`
- Data: Listener health, trade threshold progress, monitored mint
- Response Format: Structured JSON with system status and statistics

## 📊 Database Schema (Simplified)

### Core Tables
1. **`bullrhun_cycles`** - Complete cycle execution records
2. **`bullrhun_trades`** - All trades (system + user)
3. **`bullrhun_rewards`** - Reward distribution history
4. **`bullrhun_liquidity_events`** - Liquidity operations
5. **`bullrhun_metrics`** - Single-row global metrics
6. **`bullrhun_listeners`** - Listener status and trade thresholds
7. **`bullrhun_tokens`** - Token registry and graduation status

### Key Relationships
- `cycles` → `trades` (via `cycle_id`)
- `cycles` → `rewards` (via `cycle_id`) 
- `cycles` → `liquidity_events` (via `cycle_id`)
- All tables have consistent `created_at` timestamps
- Proper foreign key constraints maintain data integrity

## ⚙️ Configuration Management

### Centralized Configuration
- File: `src/config/index.ts` with Zod validation
- Environment: All variables validated on startup
- Feature Flags: `FEATURES` object controls optional functionality

### Key Configuration
```typescript
// Trading
SOLANA_PUBLIC_KEY, DEV_WALLET, PUMPPORTAL_API_KEY
BULLBALL_MINT, MIN_BUY_AMOUNT_SOL, MIN_GIFT_TRADE_AMOUNT

// Features
PLATFORM_WALLET, REWARD_WALLET, REWARD_ADDRESS
PUMPSWAP_POOL, REWARD_MODE, REWARD_SOL_AMOUNT

// Rate Limiting
RATE_LIMIT_CYCLE_SECONDS (120) // Now managed by cron
SLIPPAGE_DEFAULT (3), PRIORITY_FEE_DEFAULT (0.00005)
```

## 🎯 API Endpoints (Redesigned)

### Cycle Management
- `GET /api/bullrhun/cycle` - Cycle history and current status
- `POST /api/bullrhun/cycle` - Manual cycle execution (fallback)

### Trade Operations  
- `GET /api/bullrhun/trades` - Trade history with filtering
- `POST /api/bullrhun/trades` - Record new trades (listener use)

### Monitoring & Metrics
- `GET /api/bullrhun/metrics` - Comprehensive system metrics
- `GET /api/bullrhun/listener/status` - Listener health and status
- `POST /api/bullrhun/listener/status` - Update listener configuration

## 🔄 Key Improvements from Original

### Architecture Changes
- **Cron-based cycles** → No frontend timer dependencies
- **Service layer** → Clean separation of concerns
- **Repository pattern** → Type-safe data access
- **Centralized config** → Validated environment variables

### Database Simplification
- **7 tables vs 15+** → 60% reduction in complexity
- **Consistent naming** → All `bullrhun_` prefixed
- **Single metrics row** → Simplified aggregation
- **Proper relationships** → Foreign key constraints

### Code Quality
- **Full TypeScript** → Type safety throughout
- **Error handling** → Structured error classes
- **Logging** → Consistent structured logging
- **Testing ready** → Isolated business logic

### Performance
- **Fewer database calls** → Repository pattern with efficient queries
- **Cron automation** → Predictable execution pattern
- **Reduced redundancy** → Eliminated duplicate data storage
- **Better indexing** → Optimized query performance

## 🚀 Deployment Notes

### Migration Process
1. Apply new schema: `\i supabase/schema-simplified.sql`
2. Migrate data: `\i supabase/migration.sql`
3. Verify migration: Check `migration_summary` table
4. Cleanup: `\i supabase/cleanup.sql`

### Service Updates
- Deploy new TypeScript services
- Update deployment scripts for cron jobs
- Monitor migration and system health
- Frontend updates: Remove cycle timer components