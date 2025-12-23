import { NextResponse } from 'next/server'
import { collectCreatorFee, buyToken } from '@/lib/pumpportal'
import { getConnection, transferSol } from '@/lib/solana'
import { depositAndBurnLp } from '@/lib/pumpswap'
import { supabaseAdmin } from '@/lib/supabase'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'

export async function POST() {
  try {
    const mint = process.env.BULLBALL_MINT
    if (!mint) return NextResponse.json({ error: 'Missing BULLBALL_MINT' }, { status: 400 })

    if (supabaseAdmin) {
      const { data: limitCycle } = await supabaseAdmin
        .from('ops_limits')
        .select('last_executed,window_seconds')
        .eq('key', 'run-cycle')
        .maybeSingle()
      const now = Date.now()
      const last = limitCycle?.last_executed ? new Date(limitCycle.last_executed).getTime() : 0
      const windowMs = ((process.env.RATE_LIMIT_CYCLE_SECONDS && parseInt(process.env.RATE_LIMIT_CYCLE_SECONDS)) || limitCycle?.window_seconds || 30) * 1000
      if (last && now - last < windowMs) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const connection = getConnection()
    const walletPubkeyStr = process.env.SOLANA_PUBLIC_KEY!
    const walletPubkey = new PublicKey(walletPubkeyStr)
    const balanceBefore = await connection.getBalance(walletPubkey, 'confirmed')

    const feeSig = await collectCreatorFee()
    const balanceAfterClaim = await connection.getBalance(walletPubkey, 'confirmed')

    const deltaLamports = Math.max(0, balanceAfterClaim - balanceBefore)
    const deltaSol = deltaLamports / LAMPORTS_PER_SOL
    const platformAddress = process.env.PLATFORM_WALLET
    let platformSig: string | null = null
    let remainingSol = deltaSol
    if (platformAddress && deltaSol > 0) {
      const platformSol = deltaSol * 0.1
      remainingSol = Math.max(0, deltaSol - platformSol)
      platformSig = await transferSol(platformAddress, platformSol)
    }
    const buySol = remainingSol
    const liquiditySol = 0

    let buySig: string | null = null
    if (buySol > 0) {
      if (supabaseAdmin) {
        const { data: limitBuy } = await supabaseAdmin
          .from('ops_limits')
          .select('last_executed,window_seconds')
          .eq('key', 'buy')
          .maybeSingle()
        const now = Date.now()
        const last = limitBuy?.last_executed ? new Date(limitBuy.last_executed).getTime() : 0
        const windowMs = ((process.env.RATE_LIMIT_BUY_SECONDS && parseInt(process.env.RATE_LIMIT_BUY_SECONDS)) || limitBuy?.window_seconds || 30) * 1000
        if (!last || now - last >= windowMs) {
          const r = await buyToken({ mint, amount: buySol, denominatedInSol: true, slippage: 3, priorityFee: 0.00005 })
          buySig = r.signature
          await supabaseAdmin.from('ops_limits').upsert({ key: 'buy', window_seconds: Math.floor(windowMs / 1000), last_executed: new Date().toISOString() })
        }
      } else {
        const r = await buyToken({ mint, amount: buySol, denominatedInSol: true, slippage: 3, priorityFee: 0.00005 })
        buySig = r.signature
      }
    }

    let depositSig: string | null = null
    let burnSig: string | null = null
    const poolKey = process.env.PUMPSWAP_POOL
    if (poolKey && liquiditySol > 0) {
      let allowDeposit = true
      if (supabaseAdmin) {
        const { data: limitDeposit } = await supabaseAdmin
          .from('ops_limits')
          .select('last_executed,window_seconds')
          .eq('key', 'deposit')
          .maybeSingle()
        const now = Date.now()
        const last = limitDeposit?.last_executed ? new Date(limitDeposit.last_executed).getTime() : 0
        const windowMs = ((process.env.RATE_LIMIT_DEPOSIT_SECONDS && parseInt(process.env.RATE_LIMIT_DEPOSIT_SECONDS)) || limitDeposit?.window_seconds || 30) * 1000
        allowDeposit = !last || now - last >= windowMs
        if (allowDeposit) {
          const res = await depositAndBurnLp({ poolKey, quoteAmountSol: liquiditySol, slippage: 3 })
          depositSig = res.depositSig
          burnSig = res.burnSig
          await supabaseAdmin.from('ops_limits').upsert({ key: 'deposit', window_seconds: Math.floor(windowMs / 1000), last_executed: new Date().toISOString() })
        }
      } else {
        const res = await depositAndBurnLp({ poolKey, quoteAmountSol: liquiditySol, slippage: 3 })
        depositSig = res.depositSig
        burnSig = res.burnSig
      }
    }
    if (supabaseAdmin) {
      await supabaseAdmin.from('profit_liquidity_events').insert({
        mint,
        sol_amount: liquiditySol,
        status: depositSig ? 'executed' : 'skipped',
        fee_tx: feeSig,
        buy_tx: buySig,
        deposit_tx: depositSig,
        burn_tx: burnSig,
        created_at: new Date().toISOString()
      })
      await supabaseAdmin.from('ops_limits').upsert({ key: 'run-cycle', window_seconds: parseInt(process.env.RATE_LIMIT_CYCLE_SECONDS || '30'), last_executed: new Date().toISOString() })
    }

    const rewardMode = process.env.REWARD_MODE || 'address'
    const rewardAddress = process.env.REWARD_ADDRESS
    let rewardSig: string | null = null
    let rewardSolUsed = 0
    const configuredRewardSol = parseFloat(process.env.REWARD_SOL_AMOUNT || '0')
    if (configuredRewardSol > 0 && supabaseAdmin) {
      const { data: state } = await supabaseAdmin
        .from('profit_trade_state')
        .select('current_threshold,current_count')
        .eq('id', 1)
        .maybeSingle()
      const count = state?.current_count || 0
      const threshold = state?.current_threshold || 30
      if (count >= threshold) {
        rewardSolUsed = configuredRewardSol
        if (rewardMode === 'address' && rewardAddress) {
          rewardSig = await transferSol(rewardAddress, rewardSolUsed)
        } else if (rewardMode === 'last-trader') {
          const { data: last } = await supabaseAdmin
            .from('profit_last_trader')
            .select('address')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single()
          if (last?.address) rewardSig = await transferSol(last.address, rewardSolUsed)
        }
        const newThreshold = Math.floor(30 + Math.random() * 271)
        await supabaseAdmin
          .from('profit_trade_state')
          .upsert({ id: 1, current_threshold: newThreshold, current_count: 0, updated_at: new Date().toISOString() })
      }
    }

    if (supabaseAdmin) {
      await supabaseAdmin.from('profit_metrics').upsert({
        id: 1,
        creator_fees_collected: (deltaSol || 0),
        tokens_bought: null,
        gifts_sent_sol: rewardSolUsed || 0,
        last_update: new Date().toISOString(),
        total_cycles: supabaseAdmin.rpc ? null : null,
        next_cycle_in: 120,
      })
    }

    return NextResponse.json({ feeSig, buySig, depositSig, burnSig, liquiditySol, rewardSig, deltaSol, platformSig })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
