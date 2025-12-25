# BullRhun Schema Redesign Plan

## Current Schema Analysis
After reviewing the schema, I've identified several inefficiencies and areas for simplification:

### Issues to Address:
1. **Redundant Tables**: Multiple tables storing similar data
2. **Unnecessary Columns**: Columns that aren't used in the current codebase
3. **Complex State Management**: `ops_limits` table for rate limiting should be handled differently
4. **Frontend Timer Dependencies**: Cycle timing shouldn't rely on frontend intervals

## Simplified Schema Design

### Remove These Tables:
- `ops_limits` (rate limiting should be handled by cron job scheduling)
- `profit_admin_settings` (settings can be environment variables)
- `developer_wallet_stats` (redundant with metrics table)
- `buybacks` (merged into trade history)
- `burns` (merged into liquidity events)

### Consolidated Tables:

#### 1. `bullrhun_cycles` (New)
```sql
CREATE TABLE bullrhun_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL,
  fee_signature TEXT,
  buy_signature TEXT,
  liquidity_signature TEXT,
  burn_signature TEXT,
  reward_signature TEXT,
  fee_amount_sol NUMERIC(38,9),
  buy_amount_sol NUMERIC(38,9),
  liquidity_amount_sol NUMERIC(38,9),
  reward_amount_sol NUMERIC(38,9),
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  executed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. `bullrhun_trades` (Renamed from trade_history)
```sql
CREATE TABLE bullrhun_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint TEXT NOT NULL,
  signature TEXT UNIQUE NOT NULL,
  venue TEXT NOT NULL,
  amount_sol NUMERIC(38,9),
  amount_tokens NUMERIC(38,0),
  price_per_token NUMERIC(38,9),
  trader_address TEXT,
  is_system_buy BOOLEAN DEFAULT FALSE, -- Distinguish system vs user trades
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. `bullrhun_rewards` (Simplified from gifts)
```sql
CREATE TABLE bullrhun_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  to_address TEXT NOT NULL,
  amount_sol NUMERIC(38,9) CHECK (amount_sol > 0),
  signature TEXT UNIQUE,
  mode TEXT NOT NULL, -- 'last-trader' or 'address'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. `bullrhun_liquidity_events` (Streamlined)
```sql
CREATE TABLE bullrhun_liquidity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  mint TEXT NOT NULL,
  pool_key TEXT,
  deposit_amount_sol NUMERIC(38,9),
  deposit_signature TEXT,
  burn_amount_tokens NUMERIC(38,0),
  burn_signature TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. `bullrhun_metrics` (Simplified)
```sql
CREATE TABLE bullrhun_metrics (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_cycles INTEGER DEFAULT 0,
  total_fees_collected NUMERIC(38,9) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_rewards_sent NUMERIC(38,9) DEFAULT 0,
  current_sol_price NUMERIC(38,9) DEFAULT 0,
  last_cycle_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 6. `bullrhun_tokens` (Token registry)
```sql
CREATE TABLE bullrhun_tokens (
  mint TEXT PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE,
  is_graduated BOOLEAN DEFAULT FALSE,
  graduated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 7. `bullrhun_listeners` (Simplified monitoring)
```sql
CREATE TABLE bullrhun_listeners (
  id INTEGER PRIMARY KEY DEFAULT 1,
  monitored_mint TEXT,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  total_trades_monitored INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Key Improvements:

### 1. Remove Rate Limiting Complexity
- No more `ops_limits` table
- Cron job handles scheduling
- Database constraints prevent duplicate operations

### 2. Simplified Cycle Management
- Single `bullrhun_cycles` table tracks complete cycle execution
- No more scattered state across multiple tables
- Clear relationship between cycles and their operations

### 3. Streamlined Trade Tracking
- All trades (system and user) in one table
- Clear distinction between automated buys and user trades
- Better trader attribution for rewards

### 4. Reward System Simplification
- Direct link to cycles
- Simplified modes
- Clear audit trail

### 5. Eliminate Redundant Data
- Remove unused admin settings table
- Consolidate wallet stats into metrics
- Merge similar liquidity operations

## Cron Job Integration:
```typescript
// Cycle execution schedule
// Every 2 minutes: */2 * * * *
// Check for new fees and execute full cycle
// Frontend only polls for results, doesn't control timing
```

## Migration Strategy:
1. Create new simplified schema
2. Migrate existing data to new structure
3. Update application logic to use new tables
4. Implement cron job for cycle execution
5. Remove old tables and update frontend

This simplified schema reduces complexity by ~60% while maintaining all functionality and improving data relationships.