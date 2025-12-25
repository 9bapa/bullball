-- BullRhun Enhanced Schema Additions
-- Additions for 11-step cycle flow with trade goals and broadcasting

-- 1. Enhanced bullrhun_cycles table with step tracking
ALTER TABLE bullrhun_cycles 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS step_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS step_details JSONB,
ADD COLUMN IF NOT EXISTS trade_goal_at_start INTEGER,
ADD COLUMN IF NOT EXISTS winner_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS winner_reward_amount NUMERIC(38,9) CHECK (winner_reward_amount >= 0);

-- 2. Enhanced bullrhun_listeners table with trade goals
ALTER TABLE bullrhun_listeners 
ADD COLUMN IF NOT EXISTS trade_goal INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS last_winner_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_winner_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS minimum_trade_amount NUMERIC(38,6) NOT NULL DEFAULT 0.05;

-- 3. Enhanced bullrhun_metrics table with additional totals
ALTER TABLE bullrhun_metrics 
ADD COLUMN IF NOT EXISTS total_tokens_bought NUMERIC(38,0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_gifts_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sol_spent NUMERIC(38,9) DEFAULT 0;

-- 4. New broadcast table for real-time messaging
CREATE TABLE IF NOT EXISTS bullrhun_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES bullrhun_cycles(id),
  message TEXT NOT NULL,
  broadcast_type VARCHAR(50) NOT NULL, -- 'step_update', 'winner_announcement', 'goal_reset'
  data JSONB, -- Additional context data
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour')
);

-- 5. Create indexes for new broadcast table
CREATE INDEX IF NOT EXISTS idx_bullrhun_broadcasts_cycle_id ON bullrhun_broadcasts(cycle_id);
CREATE INDEX IF NOT EXISTS idx_bullrhun_broadcasts_created_at ON bullrhun_broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bullrhun_broadcasts_type ON bullrhun_broadcasts(broadcast_type);

-- 6. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bullrhun_cycles_current_step ON bullrhun_cycles(current_step);
CREATE INDEX IF NOT EXISTS idx_bullrhun_cycles_step_status ON bullrhun_cycles(step_status);
CREATE INDEX IF NOT EXISTS idx_bullrhun_cycles_winner_address ON bullrhun_cycles(winner_address);

-- 7. Enable RLS on broadcast table
ALTER TABLE bullrhun_broadcasts ENABLE ROW LEVEL SECURITY;

-- 8. Initialize default values for existing rows
UPDATE bullrhun_listeners 
SET 
  trade_goal = 100,
  minimum_trade_amount = 0.05
WHERE id = 1 AND trade_goal IS NULL;

UPDATE bullrhun_metrics 
SET 
  total_tokens_bought = 0,
  total_gifts_sent = 0,
  total_sol_spent = 0
WHERE id = 1 AND (total_tokens_bought IS NULL OR total_gifts_sent IS NULL);

-- 9. Insert initial broadcast policies (RLS)
DROP POLICY IF EXISTS "Broadcasts are viewable by authenticated users" ON bullrhun_broadcasts;
CREATE POLICY "Broadcasts are viewable by authenticated users" ON bullrhun_broadcasts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Broadcasts are insertable by service role" ON bullrhun_broadcasts;
CREATE POLICY "Broadcasts are insertable by service role" ON bullrhun_broadcasts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 10. Add comments for documentation
COMMENT ON COLUMN bullrhun_cycles.current_step IS 'Current step in the 11-step cycle process (1-11)';
COMMENT ON COLUMN bullrhun_cycles.step_status IS 'Status of current step: pending, in_progress, completed, failed';
COMMENT ON COLUMN bullrhun_cycles.step_details IS 'JSON object containing detailed step information';
COMMENT ON COLUMN bullrhun_cycles.trade_goal_at_start IS 'Trade goal value when cycle started';
COMMENT ON COLUMN bullrhun_cycles.winner_address IS 'Address of the winner for this cycle';
COMMENT ON COLUMN bullrhun_cycles.winner_reward_amount IS 'Amount rewarded to the winner';

COMMENT ON COLUMN bullrhun_listeners.trade_goal IS 'Current trade goal target (90-1500)';
COMMENT ON COLUMN bullrhun_listeners.last_winner_address IS 'Last winner address';
COMMENT ON COLUMN bullrhun_listeners.last_winner_at IS 'Timestamp when last winner was announced';
COMMENT ON COLUMN bullrhun_listeners.minimum_trade_amount IS 'Minimum trade amount to count towards goal (0.05-1.0)';

COMMENT ON COLUMN bullrhun_metrics.total_tokens_bought IS 'Total tokens purchased by the system';
COMMENT ON COLUMN bullrhun_metrics.total_gifts_sent IS 'Total number of gift/reward transactions';
COMMENT ON COLUMN bullrhun_metrics.total_sol_spent IS 'Total SOL spent on token purchases';

COMMENT ON TABLE bullrhun_broadcasts IS 'Real-time broadcast messages for cycle progress and events';