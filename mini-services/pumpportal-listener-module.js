import 'dotenv/config'
import WebSocket from 'ws'
import { createClient } from '@supabase/supabase-js'

// Load environment variables with explicit path if needed
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env.local if it exists
config({ path: join(process.cwd(), '.env.local') });

const API_KEY = process.env.PUMPPORTAL_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
let MINT = process.env.BULLBALL_MINT

console.log('[LISTENER] Environment check:', {
  SUPABASE_URL: !!SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
  MINT: !!MINT,
  API_KEY: !!API_KEY,
  PWD: process.cwd()
})

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MINT) {
  console.error('[LISTENER] Missing required environment variables:', {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
    MINT: !!MINT,
    API_KEY: !!API_KEY
  })
  console.log('[LISTENER] Continuing with available variables...')
  // Don't exit, just continue with warnings
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function resolveMint() {
  try {
    const { data } = await supabase
      .from('listener_status')
      .select('subscribed_mint')
      .eq('id', 1)
      .maybeSingle()
    if (data?.subscribed_mint) MINT = data.subscribed_mint
  } catch {}
}

const wsUrl = API_KEY ? `wss://pumpportal.fun/api/data?api-key=${API_KEY}` : 'wss://pumpportal.fun/api/data'
let ws
let reconnectAttempts = 0

const subscribe = async () => {
  await resolveMint()
  console.log('[LISTENER] Attempting to connect to PumpPortal WebSocket...')
  console.log('[LISTENER] WebSocket URL:', wsUrl)
  console.log('[LISTENER] Target mint:', MINT)
  
  try {
    ws = new WebSocket(wsUrl)
    
    ws.on('open', () => {
      reconnectAttempts = 0
      console.log('[LISTENER] WebSocket connection established')
      const payload = { method: 'subscribeTokenTrade', keys: [MINT] }
      console.log('[LISTENER] Sending subscription payload:', payload)
      ws.send(JSON.stringify(payload))
      console.log('[LISTENER] Successfully subscribed to token trades', { mint: MINT })
      
      if (supabase) {
        supabase.from('listener_status').upsert({ 
          id: 1, 
          subscribed_mint: MINT, 
          last_heartbeat: new Date().toISOString() 
        }).then(() => {
          console.log('[LISTENER] Listener status updated in database')
        }).catch(err => {
          console.error('[LISTENER] Failed to update listener status:', err)
        })
      }
    })
    
    ws.on('message', async data => {
      try {
        const msg = JSON.parse(data.toString())
        console.log('[LISTENER] Raw trade message received:', JSON.stringify(msg, null, 2))
        
        // Skip system messages (errors, subscription confirmations, etc.)
        if (msg.message || msg.errors || !msg.signature) {
          console.log('[LISTENER] Skipping system message')
          return
        }
        
        if (!supabase) {
          console.warn('[LISTENER] Supabase not available, processing message without database')
          return
        }
        
        // Only increment trade count for actual trades
        const { data: state } = await supabase
          .from('profit_trade_state')
          .select('current_threshold,current_count')
          .eq('id', 1)
          .maybeSingle()
        const count = (state?.current_count || 0) + 1
        
        await supabase
          .from('profit_trade_state')
          .upsert({ 
            id: 1, 
            current_threshold: state?.current_threshold || 30, 
            current_count: count, 
            updated_at: new Date().toISOString() 
          })

        const signature = msg?.signature || msg?.tx || null
        const venue = msg?.pool || msg?.venue || null
        const amountSol = typeof msg?.solAmount === 'number' ? msg.solAmount : (typeof msg?.amount === 'number' ? msg.amount : null)
        const amountTokens = typeof msg?.tokenAmount === 'number' ? msg.tokenAmount : null
        const price = typeof msg?.price === 'number' ? msg.price : (amountSol && amountTokens ? (amountSol / amountTokens) : null)
const addr = msg?.buyer || msg?.trader || msg?.account || msg?.wallet || null
        
        // Only store trades for gift rewards if they meet the minimum amount (≥0.50 SOL)
        const MIN_GIFT_TRADE_AMOUNT = 0.50
        const isQualifyingTrade = amountSol !== null && amountSol >= MIN_GIFT_TRADE_AMOUNT
        
        if (isQualifyingTrade && addr) {
          await supabase.from('profit_last_trader').upsert({ 
            address: addr, 
            trade_amount_sol: amountSol,
            signature: signature,
            updated_at: new Date().toISOString() 
          })
          console.log('[LISTENER] Qualifying trade stored for gift rewards:', { 
            address: addr, 
            amountSol, 
            signature,
            minRequired: MIN_GIFT_TRADE_AMOUNT
          })
        } else if (addr) {
          console.log('[LISTENER] Non-qualifying trade (below 0.50 SOL):', { 
            address: addr, 
            amountSol,
            minRequired: MIN_GIFT_TRADE_AMOUNT
          })
        }
        
        await supabase.from('trade_history').insert({
          mint: MINT,
          signature,
          venue,
          amount_sol: amountSol,
          amount_tokens: amountTokens,
          denominated_in_sol: !!amountSol && !amountTokens,
          price_per_token: price,
          created_at: new Date().toISOString(),
        })
        
        console.log('[LISTENER] Trade processed:', { 
          signature, 
          venue, 
          amountSol, 
          amountTokens, 
          price,
          totalCount: count 
        })
        
        await supabase.from('listener_status').upsert({ 
          id: 1, 
          subscribed_mint: MINT, 
          last_heartbeat: new Date().toISOString() 
        })
      } catch (e) {
        console.error('[LISTENER] Message processing error:', e)
      }
    })
    
    ws.on('close', () => {
      console.log('[LISTENER] WebSocket connection closed, reconnecting...')
      reconnect()
    })
    
    ws.on('error', (error) => {
      console.error('[LISTENER] WebSocket error:', error)
      reconnect()
    })
  } catch (e) {
    console.error('[LISTENER] Connection error:', e)
    reconnect()
  }
}

const reconnect = () => {
  reconnectAttempts += 1
  const delay = Math.min(30000, 1000 * reconnectAttempts)
  console.log(`[LISTENER] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)
  setTimeout(subscribe, delay)
}

// Export for use in other modules
export const startListener = () => {
  console.log('[LISTENER] Starting PumpPortal trade listener...')
  subscribe()
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startListener()
}