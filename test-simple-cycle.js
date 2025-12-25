require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

const supabase = createClient(url, serviceKey);

async function testSimpleCycle() {
  try {
    console.log('Testing simple cycle with BULLRHUN_MINT...');
    
    const bullrhunMint = process.env.BULLRHUN_MINT;
    console.log('Using mint:', bullrhunMint);
    
    // Create cycle with minimal columns
    const { data: cycle, error: cycleError } = await supabase
      .from('bullrhun_cycles')
      .insert({
        mint: bullrhunMint,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    console.log('Cycle creation:', { cycle, cycleError });
    
    if (cycleError) {
      console.error('❌ Cycle creation failed:', cycleError.message);
      return;
    }
    
    // Create a broadcast to test toast system
    const { data: broadcast, error: broadcastError } = await supabase
      .from('bullrhun_broadcasts')
      .insert({
        message_content: '🚀 BullRhun cycle started!',
        message_type: 'step_update',
        metadata: { 
          cycle_id: cycle.id,
          step: 'cycle_started',
          mint: bullrhunMint
        }
      })
      .select()
      .single();
    
    console.log('Broadcast creation:', { broadcast, broadcastError });
    
    if (broadcastError) {
      console.error('❌ Broadcast creation failed:', broadcastError.message);
    } else {
      console.log('✅ Toast notification should appear on the website!');
    }
    
    // Update cycle status
    const { data: updated, error: updateError } = await supabase
      .from('bullrhun_cycles')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', cycle.id)
      .select()
      .single();
    
    console.log('Cycle update:', { updated, updateError });
    
    if (!updateError) {
      console.log('✅ Complete cycle test successful!');
      console.log('🎉 Toast notifications should be working!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSimpleCycle();