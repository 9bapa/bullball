import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ address: '', balance: 0, totalReceived: 0, totalSent: 0 })
    const { data } = await supabaseAdmin
      .from('developer_wallet_stats')
      .select('address,balance_sol,total_received_sol,total_sent_sol,captured_at')
      .order('captured_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return NextResponse.json({ address: '', balance: 0, totalReceived: 0, totalSent: 0 })
    return NextResponse.json({
      address: data.address || '',
      balance: Number(data.balance_sol || 0),
      totalReceived: Number(data.total_received_sol || 0),
      totalSent: Number(data.total_sent_sol || 0)
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
