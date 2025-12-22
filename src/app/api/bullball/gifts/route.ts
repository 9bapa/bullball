import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json([])
    const { data } = await supabaseAdmin
      .from('gifts')
      .select('id,to_address,amount_sol,signature,created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const items = (data || []).map((g: any) => ({
      id: g.id,
      trader: g.to_address,
      amount: Number(g.amount_sol || 0),
      timestamp: g.created_at,
      txHash: g.signature || ''
    }))
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
