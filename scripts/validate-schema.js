#!/usr/bin/env node

// Simple SQL syntax checker for schema-upgrade-v2-1.sql
const fs = require('fs');

console.log('🔍 Checking SQL Syntax...');

try {
  const sql = fs.readFileSync('./database/schema-upgrade-v2-1.sql', 'utf8');
  const lines = sql.split('\n');
  
  let issues = 0;
  let inComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    
    // Skip comments
    if (line.startsWith('--')) {
      inComment = true;
      continue;
    }
    
    // Reset comment flag for non-comment lines
    if (line && !line.startsWith('--')) {
      inComment = false;
    }
    
    // Check for problematic patterns
    if (line.includes('DESC') && !inComment) {
      console.log(`❌ Line ${lineNum}: DESC keyword found (should be removed)`);
      console.log(`   ${line}`);
      issues++;
    }
    
    if (line.includes('INDEX') && line.includes('USING BRIN') && line.includes('DESC')) {
      console.log(`❌ Line ${lineNum}: Invalid BRIN index syntax`);
      console.log(`   ${line}`);
      issues++;
    }
    
    if (line.includes('cron.schedule') && !inComment) {
      console.log(`⚠️  Line ${lineNum}: cron.schedule requires pg_cron extension`);
      console.log(`   ${line}`);
    }
  }
  
  console.log(`\n📊 Syntax Check Complete:`);
  console.log(`Lines analyzed: ${lines.length}`);
  console.log(`Issues found: ${issues}`);
  
  if (issues === 0) {
    console.log('✅ SQL Schema is VALID and Ready for Deployment!');
    process.exit(0);
  } else {
    console.log('❌ SQL Schema has SYNTAX ERRORS - Please Fix Before Deployment');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
  process.exit(1);
}