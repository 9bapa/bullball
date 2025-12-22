import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json([])
    const { data: liq } = await supabaseAdmin
      .from('profit_liquidity_events')
      .select('id,fee_tx,deposit_tx,burn_tx,created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: gifts } = await supabaseAdmin
      .from('gifts')
      .select('id,created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const items: any[] = []
    for (const e of liq || []) {
      if (e.fee_tx) items.push({ id: e.id + '-fees', type: 'fees', description: 'Fees claimed & tokens bought', timestamp: e.created_at })
      if (e.deposit_tx && e.burn_tx) items.push({ id: e.id + '-liq', type: 'liquidity', description: 'Liquidity added & LP burned', timestamp: e.created_at })
    }
    for (const g of gifts || []) {
      items.push({ id: g.id + '-gift', type: 'gift', description: 'Gift sent to trader', timestamp: g.created_at })
    }
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return NextResponse.json(items.slice(0, 10))
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

