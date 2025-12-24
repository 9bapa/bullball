import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      const payload = { address: '', balance: 0, totalReceived: 0, totalSent: 0 }
      console.log('GET /api/bullball/dev-wallet', payload)
      return NextResponse.json(payload)
    }
    const { data } = await supabaseAdmin
      .from('developer_wallet_stats')
      .select('address,last_balance_sol,total_received_sol,total_sent_sol,captured_at')
      .eq('address', process.env.SOLANA_PUBLIC_KEY)
      .maybeSingle()

    if (!data) {
      const payload = { address: '', balance: 0, totalReceived: 0, totalSent: 0 }
      console.log('GET /api/bullball/dev-wallet', payload)
      return NextResponse.json(payload)
    }
    const payload = {
      address: data.address || '',
      rewardAddress: process.env.REWARD_ADDRESS,
      balance: Number(data.last_balance_sol || 0),
      totalReceived: Number(data.total_received_sol || 0),
      totalSent: Number(data.total_sent_sol || 0)
    }
    console.log('GET /api/bullball/dev-wallet', payload)
    return NextResponse.json(payload)
  } catch (e) {
    console.error('GET /api/bullball/dev-wallet error', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
