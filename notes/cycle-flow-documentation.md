# BullRhun Cycle Flow Documentation

## Current Implementation Analysis

Based on codebase analysis, the current BullRhun cycle implementation follows an **8-step automated process** that executes every 2 minutes via cron scheduling.

### Current 8-Step Flow:
1. **Creator Fee Collection** - Collect fees from token creator
2. **Platform & Reward Fee Distribution** - Split fees (12% platform, 10% rewards, 78% operations)
3. **Token Purchase** - Buy tokens using operations funds
4. **Token Transfer** - Transfer tokens to platform wallet
5. **Liquidity Management** - Add and burn liquidity
6. **Reward Distribution** - Send rewards to qualifying traders
7. **Cycle Completion** - Mark cycle as completed
8. **Metrics Update** - Update global metrics

## Proposed Enhanced 11-Step Cycle Flow

### **Step 1: Claim Creator Rewards**
- **Action**: Call creator fee collection via PumpPortal API
- **Database**: Update `bullrhun_cycles.fee_signature` and `fee_amount_sol`
- **Validation**: Ensure fee collection succeeds before proceeding

### **Step 2: Get Wallet_DEV Balance**
- **Action**: Query SOL balance of development wallet (`config.WALLET_DEV`)
- **Database**: Log balance check in cycle record
- **Validation**: Balance must be > 0 to proceed to step 3

### **Step 3: Update Creator Fees + Wallet Balance**
- **Action**: 
  - Add collected fees to running total
  - Update current wallet balance in metrics
- **Database**: Update `bullrhun_metrics.total_fees_collected` and current balance
- **Condition**: Only executes if wallet_dev balance > 0

### **Step 4: Split Fees (10% rewards, 12% platform)**
- **Action**: 
  - Transfer 10% of available SOL to `config.WALLET_REWARD`
  - Transfer 12% of available SOL to `config.WALLET_PLATFORM`
- **Database**: Record transfers in `bullrhun_rewards` table
- **Condition**: Only executes if wallet_dev balance > 0

### **Step 5: Token Purchase Logic**
- **Action**: 
  - **Condition A**: If `wallet_dev_balance > minimum_trade_amount (0.015 SOL)` AND `token has NOT migrated`
    - Buy token with full available amount
  - **Condition B**: If `token has migrated`
    - Spend 50% of wallet_dev SOL balance to buy token
- **Database**: Record trade in `bullrhun_trades` with `is_system_buy: true`
- **Validation**: Check token graduation status via PumpPortal API

### **Step 6: Token Transfer to Platform**
- **Action**: If `wallet_dev token balance > 0` AND `token has NOT migrated`
  - Transfer all tokens to `config.WALLET_PLATFORM`
- **Database**: Record transfer in transfer history
- **Condition**: Only for non-migrated tokens

### **Step 7: Liquidity Management**
- **Action**: If `wallet_dev token balance > 0` AND `token has migrated`
  - Use remaining 50% of wallet_dev SOL + token balance to add liquidity
- **Database**: Record in `bullrhun_liquidity_events`
- **Condition**: Only for migrated tokens

### **Step 8: Burn Liquidity LP**
- **Action**: Burn LP tokens from liquidity addition
- **Database**: Update `bullrhun_liquidity_events` with burn signature
- **Validation**: Ensure LP tokens exist before burning

### **Step 9: Winner Reward Distribution**
- **Action**: If `trade_goal_count == trade_goal`
  - Pay entire `config.WALLET_REWARDS` balance to winner
- **Database**: 
  - Record reward distribution in `bullrhun_rewards`
  - Update winner in cycle record
- **Condition**: Only when trade goal is met

### **Step 10: Reset Trade Goal**
- **Action**: Generate new random trade goal between 90-1500 trades
- **Database**: Update `bullrhun_listeners.trade_goal` with new target
- **Validation**: Ensure new goal is within acceptable range

### **Step 11: Update Minimum Trade Amount**
- **Action**: Set new minimum trade amount between 0.05-1 SOL
- **Database**: Update `bullrhun_listeners.minimum_trade_amount`
- **Purpose**: Reset threshold for next reward cycle

## Database Schema Additions Required

### New Columns for `bullrhun_listeners`:
```sql
ALTER TABLE bullrhun_listeners 
ADD COLUMN trade_goal INTEGER NOT NULL DEFAULT 100,
ADD COLUMN current_trade_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_winner_address VARCHAR(255),
ADD COLUMN last_winner_at TIMESTAMP,
ADD COLUMN minimum_trade_amount DECIMAL(10,6) NOT NULL DEFAULT 0.05;
```

### New Table for Broadcast Messages:
```sql
CREATE TABLE bullrhun_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  message TEXT NOT NULL,
  broadcast_type VARCHAR(50) NOT NULL, -- 'step_update', 'winner_announcement', 'goal_reset'
  data JSONB, -- Additional context data
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### Enhanced `bullrhun_cycles` columns:
```sql
ALTER TABLE bullrhun_cycles
ADD COLUMN current_step INTEGER DEFAULT 1,
ADD COLUMN step_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
ADD COLUMN step_details JSONB, -- Detailed step information
ADD COLUMN trade_goal_at_start INTEGER,
ADD COLUMN winner_address VARCHAR(255),
ADD COLUMN winner_reward_amount DECIMAL(10,6);
```

## Real-Time Broadcast Table Implementation

### Broadcast Types:
1. **`step_update`** - Real-time cycle progress updates
2. **`winner_announcement`** - When trade goal is met and winner paid
3. **`goal_reset`** - When new trade goal and minimum amount are set
4. **`liquidity_added`** - When liquidity operations complete
5. **`reward_distributed`** - When rewards are sent to traders

### Sample Broadcast Messages:
```json
{
  "type": "step_update",
  "cycle_id": "uuid",
  "message": "Step 5/11: Purchasing tokens - 0.5 SOL",
  "data": {
    "current_step": 5,
    "total_steps": 11,
    "amount": "0.5",
    "token_mint": "2XioaBY8RkPnocb2ym7dSuGsDZbxbrYsoTcUHf8Xpump"
  }
}

{
  "type": "winner_announcement",
  "cycle_id": "uuid",
  "message": "🎉 WINNER! 9xW...8x7q won 2.5 SOL!",
  "data": {
    "winner_address": "9xW...8x7q",
    "reward_amount": "2.5",
    "trade_goal": "150",
    "total_trades": "150"
  }
}
```

## Implementation Recommendations

### 1. **Gradual Migration**
- Implement new steps incrementally
- Maintain backward compatibility during transition
- Test each step thoroughly before production deployment

### 2. **Real-Time Subscription**
- Use WebSocket connections for live updates
- Implement client-side filtering for broadcast types
- Add reconnection logic for reliable real-time updates

### 3. **Error Handling**
- Add step-specific error recovery
- Implement retry logic for critical steps
- Maintain audit trail for all operations

### 4. **Performance Considerations**
- Batch database operations where possible
- Use database transactions for data consistency
- Implement caching for frequently accessed data

### 5. **Monitoring & Alerting**
- Add step-level monitoring
- Alert on step failures or timeouts
- Track cycle completion rates and performance metrics

## Validation Checklist

- [ ] All 11 steps defined with clear success/failure criteria
- [ ] Database schema supports new requirements
- [ ] Real-time broadcast system implemented
- [ ] Trade goal tracking and reset logic verified
- [ ] Winner selection and reward distribution tested
- [ ] Error handling and recovery mechanisms in place
- [ ] Performance impact assessed and optimized
- [ ] Security audit for fund transfers completed

## Next Steps

1. **Database Migration**: Implement schema changes
2. **Cycle Service Update**: Modify `CycleService` to support 11 steps
3. **Broadcast API**: Create endpoints for real-time updates
4. **Frontend Integration**: Update UI to display real-time progress
5. **Testing**: Comprehensive testing of all scenarios
6. **Deployment**: Gradual rollout with monitoring

---

**Note**: This enhanced flow maintains the existing 8-step core functionality while adding gamification elements (trade goals, winner rewards) and improved transparency through real-time broadcasting.