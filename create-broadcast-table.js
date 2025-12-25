require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

const supabase = createClient(url, serviceKey);

async function createBroadcastTable() {
  try {
    console.log('Creating bullrhun_broadcasts table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS bullrhun_broadcasts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cycle_id UUID REFERENCES bullrhun_cycles(id),
          message TEXT NOT NULL,
          broadcast_type VARCHAR(50) NOT NULL,
          data JSONB,
          created_at TIMESTAMPTZ DEFAULT now(),
          expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour')
        );
        
        CREATE INDEX IF NOT EXISTS idx_bullrhun_broadcasts_cycle_id ON bullrhun_broadcasts(cycle_id);
        CREATE INDEX IF NOT EXISTS idx_bullrhun_broadcasts_created_at ON bullrhun_broadcasts(created_at DESC);
      `
    });
    
    console.log('Table creation result:', { data, error });
    if (error) {
      console.error('Creation error:', error);
    } else {
      console.log('Table created successfully!');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

createBroadcastTable();