#!/usr/bin/env node

// Load environment variables first
import { config } from 'dotenv';

// Load .env.local file explicitly
config({ path: join(process.cwd(), '.env.local') });

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting BullBall unified development environment...');
console.log('📊 All logs will appear in this terminal with prefixes:');
console.log('   [LISTENER] - PumpPortal WebSocket trade listener');
console.log('   [NEXT]     - Next.js development server');
console.log('   [API]      - API route logs');
console.log('');

// Import and start the listener module
async function startListener() {
  try {
    const listenerModule = await import('./pumpportal-listener-module.js');
    listenerModule.startListener();
    console.log('✅ PumpPortal listener module loaded and started');
  } catch (error) {
    console.error('❌ Failed to start listener module:', error);
    console.log('🔄 Falling back to spawning listener process...');
    
    // Fallback to spawning the listener
    const listenerPath = join(__dirname, 'pumpportal-listener-module.js');
    const listener = spawn('node', [listenerPath], {
      stdio: 'pipe',
      env: { ...process.env }
    });

    listener.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[LISTENER] ${output}`);
      }
    });

    listener.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`[LISTENER ERROR] ${output}`);
      }
    });

    listener.on('close', (code) => {
      console.log(`[LISTENER] Process exited with code ${code}`);
    });
  }
}

// Start Next.js dev server
function startNextDev() {
  const nextDev = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'pipe',
    env: { ...process.env }
  });

  nextDev.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[NEXT] ${output}`);
    }
  });

  nextDev.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error(`[NEXT ERROR] ${output}`);
    }
  });

  nextDev.on('close', (code) => {
    console.log(`[NEXT] Process exited with code ${code}`);
  });

  return nextDev;
}

// Start both services
startListener();
const nextProcess = startNextDev();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (nextProcess) nextProcess.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (nextProcess) nextProcess.kill('SIGTERM');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

console.log('✅ Unified logging system initialized');
console.log('🔧 Both listener and Next.js are now integrated');
console.log('🌐 Application will be available at http://localhost:3000');
console.log('');