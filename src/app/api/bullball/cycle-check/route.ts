import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ shouldRun: false, reason: 'supabase_not_available' })
    }

    // Check if cycle is due based on ops_limits
    const { data: cycleLimit } = await supabaseAdmin
      .from('ops_limits')
      .select('last_executed,window_seconds')
      .eq('key', 'run-cycle')
      .maybeSingle()

    const now = Date.now()
    const lastExecuted = cycleLimit?.last_executed ? new Date(cycleLimit.last_executed).getTime() : 0
    const windowMs = ((process.env.RATE_LIMIT_CYCLE_SECONDS && parseInt(process.env.RATE_LIMIT_CYCLE_SECONDS)) || cycleLimit?.window_seconds || 120) * 1000
    
    const shouldRun = !lastExecuted || (now - lastExecuted) >= windowMs
    const timeUntilNext = Math.max(0, Math.ceil((lastExecuted + windowMs - now) / 1000))

    console.log('GET /api/bullball/cycle-check', { 
      shouldRun, 
      lastExecuted: new Date(lastExecuted).toISOString(),
      now: new Date(now).toISOString(),
      windowMs,
      timeUntilNext,
      reason: shouldRun ? 'cycle_due' : 'rate_limited'
    })

    return NextResponse.json({ 
      shouldRun, 
      timeUntilNext,
      lastExecuted: cycleLimit?.last_executed,
      windowSeconds: windowMs / 1000,
      reason: shouldRun ? 'cycle_due' : 'rate_limited'
    })
  } catch (e) {
    console.error('GET /api/bullball/cycle-check error', e)
    return NextResponse.json({ shouldRun: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Trigger the cycle run
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/bullball/run-cycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    console.log('POST /api/bullball/cycle-check triggered cycle', result)
    
    return NextResponse.json({ 
      triggered: true, 
      result,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    console.error('POST /api/bullball/cycle-check error', e)
    return NextResponse.json({ triggered: false, error: String(e) }, { status: 500 })
  }
}