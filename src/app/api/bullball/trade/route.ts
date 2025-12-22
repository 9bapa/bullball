import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ current_threshold: 0, current_count: 0 })
    const { data } = await supabaseAdmin
      .from('profit_trade_state')
      .select('current_threshold,current_count,updated_at')
      .eq('id', 1)
      .maybeSingle()
    if (!data) return NextResponse.json({ current_threshold: 0, current_count: 0 })
    return NextResponse.json({ current_threshold: data.current_threshold, current_count: data.current_count })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  try {
    if (!supabaseAdmin) return NextResponse.json({})
    const { data } = await supabaseAdmin
      .from('profit_trade_state')
      .select('current_threshold,current_count')
      .eq('id', 1)
      .maybeSingle()
    const count = (data?.current_count || 0) + 1
    await supabaseAdmin
      .from('profit_trade_state')
      .upsert({ id: 1, current_threshold: data?.current_threshold || 30, current_count: count, updated_at: new Date().toISOString() })
    return NextResponse.json({ current_count: count, current_threshold: data?.current_threshold || 30 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
