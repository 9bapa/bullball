import 'dotenv/config'
import WebSocket from 'ws'
import { createClient } from '@supabase/supabase-js'

const API_KEY = process.env.PUMPPORTAL_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
let MINT = process.env.BULLBALL_MINT

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MINT) {
  process.exit(1)
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
  try {
    ws = new WebSocket(wsUrl)
    ws.on('open', () => {
      reconnectAttempts = 0
      const payload = { method: 'subscribeTokenTrade', keys: [MINT] }
      ws.send(JSON.stringify(payload))
      console.log('listener subscribed', { mint: MINT })
      supabase.from('listener_status').upsert({ id: 1, subscribed_mint: MINT, last_heartbeat: new Date().toISOString() })
    })
    ws.on('message', async data => {
      try {
        const msg = JSON.parse(data.toString())
        const signature = msg?.signature || msg?.tx || null
        const venue = msg?.pool || msg?.venue || null
        const amountSol = typeof msg?.solAmount === 'number' ? msg.solAmount : (typeof msg?.amount === 'number' ? msg.amount : null)
        const amountTokens = typeof msg?.tokenAmount === 'number' ? msg.tokenAmount : null
        const price = typeof msg?.price === 'number' ? msg.price : (amountSol && amountTokens ? (amountSol / amountTokens) : null)
        const addr = msg?.buyer || msg?.trader || msg?.account || msg?.wallet || null
        const MIN_GIFT_TRADE_AMOUNT = 0.50
        const isQualifyingTrade = amountSol !== null && amountSol >= MIN_GIFT_TRADE_AMOUNT
        let count = 0
        if (isQualifyingTrade) {
          const { data: state } = await supabase
            .from('profit_trade_state')
            .select('current_threshold,current_count')
            .eq('id', 1)
            .maybeSingle()
          count = (state?.current_count || 0) + 1
          await supabase
            .from('profit_trade_state')
            .upsert({ id: 1, current_threshold: state?.current_threshold || 30, current_count: count, updated_at: new Date().toISOString() })
          if (addr) {
            await supabase.from('profit_last_trader').insert({ address: addr, updated_at: new Date().toISOString() })
          }
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
        console.log('listener trade', { signature, venue, amountSol, amountTokens, totalCount: count })
        await supabase.from('listener_status').upsert({ id: 1, subscribed_mint: MINT, last_heartbeat: new Date().toISOString() })
      } catch (e) {
        console.error('listener message error', e)
      }
    })
    ws.on('close', () => {
      reconnect()
    })
    ws.on('error', () => {
      reconnect()
    })
  } catch (e) {
    reconnect()
  }
}

const reconnect = () => {
  reconnectAttempts += 1
  const delay = Math.min(30000, 1000 * reconnectAttempts)
  setTimeout(subscribe, delay)
}

subscribe()
