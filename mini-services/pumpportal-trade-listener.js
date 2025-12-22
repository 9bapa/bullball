import WebSocket from 'ws'
import { createClient } from '@supabase/supabase-js'

const API_KEY = process.env.PUMPPORTAL_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MINT = process.env.PROFITBALL_MINT

if (!API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MINT) {
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const ws = new WebSocket(`wss://pumpportal.fun/api/data?api-key=${API_KEY}`)

ws.on('open', () => {
  const payload = { method: 'subscribeTokenTrade', keys: [MINT] }
  ws.send(JSON.stringify(payload))
})

ws.on('message', async data => {
  try {
    const msg = JSON.parse(data.toString())
    const { data: state } = await supabase
      .from('profit_trade_state')
      .select('current_threshold,current_count')
      .eq('id', 1)
      .maybeSingle()
    const count = (state?.current_count || 0) + 1
    await supabase
      .from('profit_trade_state')
      .upsert({ id: 1, current_threshold: state?.current_threshold || 30, current_count: count, updated_at: new Date().toISOString() })

    const addr = msg?.buyer || msg?.trader || msg?.account || msg?.wallet || null
    if (addr) {
      await supabase.from('profit_last_trader').insert({ address: addr, updated_at: new Date().toISOString() })
    }
  } catch {}
})

