-- Leader election table for interval polling
CREATE TABLE bullrhun_leaders (
  id INTEGER PRIMARY KEY DEFAULT 1,
  instance_id TEXT NOT NULL,
  heartbeat TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for leader lookup
CREATE INDEX idx_bullrhun_leaders_active ON bullrhun_leaders(is_active, updated_at DESC);

-- Row Level Security
ALTER TABLE bullrhun_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaders can view all" ON bullrhun_leaders FOR SELECT USING (true);
CREATE POLICY "Leaders can update all" ON bullrhun_leaders FOR UPDATE USING (true);
CREATE POLICY "Leaders can insert all" ON bullrhun_leaders FOR INSERT WITH CHECK (true);