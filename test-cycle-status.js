require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

const supabase = createClient(url, serviceKey);

async function checkCycleStatus() {
  try {
    console.log('🔍 Checking latest cycle status...');
    
    // Get the latest cycle
    const { data: cycle, error: cycleError } = await supabase
      .from('bullrhun_cycles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    console.log('Latest cycle:', { cycle, cycleError });
    
    if (cycle) {
      console.log('✅ Cycle ID:', cycle.id);
      console.log('✅ Status:', cycle.status);
      console.log('✅ Mint:', cycle.mint);
      console.log('✅ Step:', cycle.step_number, '/', cycle.total_steps);
      console.log('✅ Created:', cycle.created_at);
    }
    
    // Create a test broadcast for toast verification
    const { data: broadcast, error: broadcastError } = await supabase
      .from('bullrhun_broadcasts')
      .insert({
        message_content: `🔄 Cycle ${cycle.id.substring(0, 8)}: ${cycle.status.toUpperCase()}`,
        message_type: 'step_update',
        metadata: { 
          cycle_id: cycle.id,
          status: cycle.status,
          step: cycle.step_number
        }
      })
      .select()
      .single();
    
    console.log('Toast broadcast result:', { broadcast, broadcastError });
    
    if (!broadcastError) {
      console.log('🎉 TOAST NOTIFICATION SHOULD APPEAR ON WEBSITE!');
    }
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkCycleStatus();