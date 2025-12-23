import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ subscribed_mint: null, last_heartbeat: null, current_count: 0, total_trades: 0, recent: [] })

    const { data: ls } = await supabaseAdmin
      .from('listener_status')
      .select('subscribed_mint,last_heartbeat')
      .eq('id', 1)
      .maybeSingle()

    const { data: state } = await supabaseAdmin
      .from('profit_trade_state')
      .select('current_count')
      .eq('id', 1)
      .maybeSingle()

    const mint = ls?.subscribed_mint || process.env.BULLBALL_MINT || null
    let totalTrades = 0
    let recent: any[] = []
    if (mint) {
      const { count } = await supabaseAdmin
        .from('trade_history')
        .select('id', { count: 'exact', head: true })
        .eq('mint', mint)
      totalTrades = count || 0
      const { data: rows } = await supabaseAdmin
        .from('trade_history')
        .select('signature,venue,amount_sol,amount_tokens,created_at')
        .eq('mint', mint)
        .order('created_at', { ascending: false })
        .limit(10)
      recent = (rows || []).map(r => ({ signature: r.signature, venue: r.venue, amountSol: r.amount_sol, amountTokens: r.amount_tokens, createdAt: r.created_at }))
    }

    const payload = { subscribed_mint: mint, last_heartbeat: ls?.last_heartbeat || null, current_count: state?.current_count || 0, total_trades: totalTrades, recent }
    console.log('GET /api/bullball/listener-status', { mint, totalTrades, currentCount: payload.current_count })
    return NextResponse.json(payload)
  } catch (e) {
    console.error('GET /api/bullball/listener-status error', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ ok: false }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const mint = body?.mint || null
    if (!mint) return NextResponse.json({ ok: false, error: 'Missing mint' }, { status: 400 })
    await supabaseAdmin.from('listener_status').upsert({ id: 1, subscribed_mint: mint, last_heartbeat: new Date().toISOString() })
    return NextResponse.json({ ok: true, subscribed_mint: mint })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
