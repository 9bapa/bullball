#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting BullBall unified development environment...');

// Start the pumpportal listener
const listenerPath = path.join(__dirname, 'pumpportal-trade-listener.js');
const listener = spawn('node', [listenerPath], {
  stdio: 'pipe',
  env: { ...process.env }
});

// Start Next.js dev server
const nextDev = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: 'pipe',
  env: { ...process.env }
});

// Handle listener output
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

// Handle Next.js output
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

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  listener.kill('SIGINT');
  nextDev.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  listener.kill('SIGTERM');
  nextDev.kill('SIGTERM');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

console.log('✅ Unified logging system initialized');
console.log('📊 All logs will appear in this terminal');
console.log('🔧 Listener and Next.js are now integrated');