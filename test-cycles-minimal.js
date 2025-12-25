require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

const supabase = createClient(url, serviceKey);

async function testMinimalCycle() {
  try {
    console.log('Testing minimal cycle creation...');
    
    // Try with just basic columns that should exist
    const { data: cycle, error: cycleError } = await supabase
      .from('bullrhun_cycles')
      .insert({
        mint: '11111111111111111111111111111111',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    console.log('Minimal cycle test:', { cycle, cycleError });
    
    if (!cycleError) {
      console.log('✅ Basic columns work!');
      console.log('Available columns:', Object.keys(cycle));
      
      // Now update to see what update columns exist
      const { data: updated, error: updateError } = await supabase
        .from('bullrhun_cycles')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', cycle.id)
        .select()
        .single();
      
      console.log('Update test:', { updated, updateError });
      
      if (!updateError) {
        console.log('✅ Update columns work too!');
        console.log('Available update columns:', Object.keys(updated));
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMinimalCycle();