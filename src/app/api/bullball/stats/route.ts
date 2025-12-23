import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const defaultMetrics = {
      creatorFeesCollected: 0,
      tokensBought: 0,
      giftsSentToTraders: 0,
      lastUpdate: new Date().toISOString(),
      nextCycleIn: 120,
      totalProfitCycles: 0,
      currentSolPrice: 0,
    }

    if (!supabase) {
      console.log('GET /api/bullball/stats', defaultMetrics)
      return NextResponse.json(defaultMetrics)
    }

    const { data: metricsRow } = await supabase.from('profit_metrics').select('*').limit(1).single()
    if (!metricsRow) {
      console.log('GET /api/bullball/stats default')
      return NextResponse.json(defaultMetrics)
    }

    const { creator_fees_collected, tokens_bought, gifts_sent_sol, last_update, total_cycles, current_sol_price, next_cycle_in } = metricsRow
    const payload = {
      creatorFeesCollected: creator_fees_collected ?? 0,
      tokensBought: tokens_bought ?? 0,
      giftsSentToTraders: gifts_sent_sol ?? 0,
      lastUpdate: last_update ?? new Date().toISOString(),
      nextCycleIn: next_cycle_in ?? 120,
      totalProfitCycles: total_cycles ?? 0,
      currentSolPrice: current_sol_price ?? 0,
    }
    console.log('GET /api/bullball/stats', payload)
    return NextResponse.json(payload)
  } catch (e) {
    console.error('GET /api/bullball/stats error', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
