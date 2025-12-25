require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

console.log('URL:', url);
console.log('Key present:', !!serviceKey);

const supabase = createClient(url, serviceKey);

async function testBroadcast() {
  try {
    console.log('Testing broadcast creation...');
    const { data, error } = await supabase
      .from('bullrhun_broadcasts')
      .insert({
        message: 'Direct test from node',
        broadcast_type: 'winner_announcement',
        data: { test: true }
      })
      .select()
      .single();
    
    console.log('Result:', { data, error });
    if (error) {
      console.error('Error details:', error);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testBroadcast();