#!/usr/bin/env node

// Test script to analyze PumpPortal WebSocket data structure
// Run with: node scripts/test-pumpportal-data.js

const WebSocket = require('ws');

const API_KEY = 'f5ak8xvj9ngq4dj2a8um8utpacupav9p8d23gv33e9x4avap5x956wth6njmevtb8xhpctkadh8kjukqe1mprtugdt0qmm1k9wtmwh21b4r5mkvd65wncpj2ahk4wj9f71c74hu3ewykub9430vj9e1upme2b71uk2djdag8xvn4yk5enk6ckb5cxu64mtr6xa3exk55dkkuf8'

const ws = new WebSocket(`wss://pumpportal.fun/api/data?api-key=${API_KEY}`);

console.log('🚀 Connecting to PumpPortal WebSocket...');

ws.on('open', function open() {
    console.log('✅ Connected to PumpPortal WebSocket');
    
    // Subscribe to new tokens
    console.log('📝 Subscribing to new tokens...');
    ws.send(JSON.stringify({
        method: 'subscribeNewToken'
    }));
    
    // Subscribe to trades
    console.log('📝 Subscribing to token trades...');
    ws.send(JSON.stringify({
        method: 'subscribeTokenTrade',
        keys: ['2XioaBY8RkPnocb2ym7dSuGsDZbxbrYsoTcUHf8Xpump']
    }));
    
    // Subscribe to account trades
    console.log('📝 Subscribing to account trades...');
    ws.send(JSON.stringify({
        method: 'subscribeAccountTrade',
        keys: ['AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV']
    }));
    
    // Subscribe to migrations
    console.log('📝 Subscribing to migrations...');
    ws.send(JSON.stringify({
        method: 'subscribeMigration'
    }));
    
    console.log('⏳ Waiting for data... (will run for 60 seconds)');
    
    // Auto-disconnect after 60 seconds
    setTimeout(() => {
        console.log('🔌 Disconnecting after 60 seconds...');
        ws.close();
    }, 60000);
});

ws.on('message', function message(data) {
    try {
        const parsed = JSON.parse(data.toString());
        
        console.log('📨 Raw Message:', JSON.stringify(parsed, null, 2));
        
        // Analyze message structure
        console.log('\n=== MESSAGE ANALYSIS ===');
        console.log('Type:', parsed.type || 'unknown');
        console.log('Has data:', !!parsed.data);
        console.log('Data keys:', parsed.data ? Object.keys(parsed.data) : 'none');
        
        // Deep analysis based on type
        switch(parsed.type) {
            case 'newToken':
                console.log('\n🪙 NEW TOKEN ANALYSIS:');
                console.log('- Token Address:', parsed.data?.mint || 'missing');
                console.log('- Token Name:', parsed.data?.name || 'missing');
                console.log('- Token Symbol:', parsed.data?.symbol || 'missing');
                console.log('- Creator:', parsed.data?.creator || 'missing');
                console.log('- Timestamp:', parsed.data?.timestamp || 'missing');
                
                // Database fields needed for new tokens
                console.log('\n📊 DATABASE SCHEMA NEEDED:');
                console.log('CREATE TABLE pump_portal_tokens (');
                console.log('  id VARCHAR(255) PRIMARY KEY,');
                console.log('  token_address VARCHAR(255) UNIQUE NOT NULL,');
                console.log('  name VARCHAR(255),');
                console.log('  symbol VARCHAR(50),');
                console.log('  creator VARCHAR(255),');
                console.log('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
                console.log('  processed BOOLEAN DEFAULT FALSE');
                console.log('  UNIQUE(token_address)');
                console.log(');');
                break;
                
            case 'trade':
                console.log('\n💰 TRADE ANALYSIS:');
                console.log('- Token:', parsed.data?.tokenAddress || 'missing');
                console.log('- From:', parsed.data?.from || 'missing');
                console.log('- To:', parsed.data?.to || 'missing');
                console.log('- Amount:', parsed.data?.amount || 'missing');
                console.log('- Price:', parsed.data?.price || 'missing');
                console.log('- Tx Signature:', parsed.data?.txSignature || 'missing');
                console.log('- Timestamp:', parsed.data?.timestamp || 'missing');
                
                // Database fields needed for trades
                console.log('\n📊 DATABASE SCHEMA NEEDED:');
                console.log('CREATE TABLE pump_portal_trades (');
                console.log('  id SERIAL PRIMARY KEY,');
                console.log('  token_address VARCHAR(255) NOT NULL,');
                console.log('  from_address VARCHAR(255) NOT NULL,');
                console.log('  to_address VARCHAR(255) NOT NULL,');
                console.log('  amount DECIMAL(20,10) NOT NULL,');
                console.log('  price DECIMAL(20,10) NOT NULL,');
                console.log('  tx_signature VARCHAR(255) UNIQUE NOT NULL,');
                console.log('  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
                console.log('  INDEX(token_address, timestamp),');
                console.log('  INDEX(from_address, timestamp),');
                console.log('  INDEX(to_address, timestamp)');
                console.log(');');
                break;
                
            case 'migration':
                console.log('\n🔄 MIGRATION ANALYSIS:');
                console.log('- Token:', parsed.data?.tokenAddress || 'missing');
                console.log('- From Platform:', parsed.data?.fromPlatform || 'missing');
                console.log('- To Platform:', parsed.data?.toPlatform || 'missing');
                console.log('- Reason:', parsed.data?.reason || 'missing');
                console.log('- Timestamp:', parsed.data?.timestamp || 'missing');
                
                // Database fields needed for migrations
                console.log('\n📊 DATABASE SCHEMA NEEDED:');
                console.log('CREATE TABLE pump_portal_migrations (');
                console.log('  id SERIAL PRIMARY KEY,');
                console.log('  token_address VARCHAR(255) NOT NULL,');
                console.log('  from_platform VARCHAR(100) NOT NULL,');
                console.log('  to_platform VARCHAR(100) NOT NULL,');
                console.log('  reason TEXT,');
                console.log('  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
                console.log('  INDEX(token_address, timestamp)');
                console.log(');');
                break;
                
            default:
                console.log('\n❓ UNKNOWN MESSAGE TYPE:', parsed.type);
                if (parsed.data) {
                    console.log('Data structure:', Object.keys(parsed.data));
                    console.log('Sample data:', JSON.stringify(parsed.data, null, 2));
                }
        }
        
        console.log('\n' + '='.repeat(50));
        
    } catch (error) {
        console.error('❌ Error parsing message:', error.message);
    }
});

ws.on('close', function close() {
    console.log('🔌 WebSocket connection closed');
});

ws.on('error', function error(err) {
    console.error('🔥 WebSocket error:', err.message);
});

console.log('\n🎯 PURPOSE OF THIS SCRIPT:');
console.log('1. Analyze real-time PumpPortal data structure');
console.log('2. Identify database schema requirements');
console.log('3. Show example data for database design');
console.log('4. Help create data models and API endpoints');
console.log('\n⚠️  Run this script and watch the output for 60 seconds');
console.log('⚠️  Copy the database schemas into your database setup');