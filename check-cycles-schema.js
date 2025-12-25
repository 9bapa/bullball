require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d2p6ZGlpamt5amNjamdldGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ0Nzg2MSwiZXhwIjoyMDgyMDIzODYxfQ.JwnfMe6XGyMfEi4O076BYf5xaP7S4BIepKVmmpc2jWM';

const supabase = createClient(url, serviceKey);

async function checkCyclesTable() {
  try {
    // Try to get one record to see what columns exist
    const { data, error } = await supabase
      .from('bullrhun_cycles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing cycles table:', error);
      return;
    }
    
    if (data.length > 0) {
      console.log('Available columns in bullrhun_cycles:', Object.keys(data[0]));
      console.log('Sample record:', data[0]);
    } else {
      console.log('No data in bullrhun_cycles table');
    }
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

checkCyclesTable();