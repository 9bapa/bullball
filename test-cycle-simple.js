require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

const supabase = createClient(url, serviceKey);

async function testSimpleCycle() {
  try {
    console.log('Testing simple cycle creation...');
    
    // Test 1: Create cycle record
    const { data: cycle, error: cycleError } = await supabase
      .from('bullrhun_cycles')
      .insert({
        mint: '11111111111111111111111111111111',
        status: 'pending',
        current_step: 0,
        step_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    console.log('Cycle creation:', { cycle, cycleError });
    
    if (cycleError) {
      console.error('Cycle creation failed:', cycleError);
      return;
    }
    
    // Test 2: Create a broadcast
    const { data: broadcast, error: broadcastError } = await supabase
      .from('bullrhun_broadcasts')
      .insert({
        message_content: '🚀 Test cycle execution started!',
        message_type: 'step_update',
        metadata: { test: true }
      })
      .select()
      .single();
    
    console.log('Broadcast creation:', { broadcast, broadcastError });
    
    if (broadcastError) {
      console.error('Broadcast creation failed:', broadcastError);
    }
    
    console.log('✅ Simple test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSimpleCycle();