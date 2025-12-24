import { sendEncodedTransaction, getBalance } from './solana'
import { supabaseAdmin } from './supabase'

type PoolOption = 'pump' | 'raydium' | 'pump-amm' | 'launchlab' | 'raydium-cpmm' | 'bonk' | 'auto'

const TRADE_LOCAL_URL = 'https://pumpportal.fun/api/trade-local'

const getWalletPublicKey = () => {
  const pk = process.env.SOLANA_PUBLIC_KEY
  if (!pk) throw new Error('Missing SOLANA_PUBLIC_KEY')
  return pk
}

const fetchEncodedTx = async (payload: any) => {
  const apiKey = process.env.PUMPPORTAL_API_KEY
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey
  try {
    const { action, mint, amount, denominatedInSol, slippage, priorityFee, pool } = payload || {}
    console.log('PumpPortal fetch', { action, mint, amount, denominatedInSol, slippage, priorityFee, pool })
  } catch {}
  const res = await fetch(TRADE_LOCAL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`PumpPortal error: ${res.statusText}`)
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

export const collectCreatorFee = async (priorityFee = 0.000001) => {

  const publicKey = getWalletPublicKey()
  console.log('collectCreatorFee start', { publicKey, priorityFee })
  const encoded = await fetchEncodedTx({ publicKey, action: 'collectCreatorFee', priorityFee })
  const signature = await sendEncodedTransaction(encoded)
  console.log('collectCreatorFee done', { signature })

  return signature
  
}

export const buyToken = async ({ mint, amount, denominatedInSol, slippage = 3, priorityFee = 0.00005 }: { mint: string; amount: number; denominatedInSol: boolean; slippage?: number; priorityFee?: number }) => {
  const publicKey = getWalletPublicKey()
  const MIN_BUY_AMOUNT = 0.001 // Minimum 0.001 SOL or token amount
  
  if (denominatedInSol && amount < MIN_BUY_AMOUNT) {
    console.log('buyToken skipped: amount below minimum', { amount, minRequired: MIN_BUY_AMOUNT })
    return { signature: null, venue: 'skipped-minimum' as PoolOption }
  }
  
  console.log('buyToken start', { mint, amount, denominatedInSol, slippage, priorityFee })
  let preferAmm = false
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from('token_status').select('is_graduated').eq('mint', mint).maybeSingle()
    preferAmm = !!data?.is_graduated
  }
  if (preferAmm) {
    try {
      const encoded = await fetchEncodedTx({ publicKey, action: 'buy', mint, amount, denominatedInSol: String(denominatedInSol), slippage, priorityFee, pool: 'pump-amm' })
      const signature = await sendEncodedTransaction(encoded)
      console.log('buyToken venue', { venue: 'pump-amm', signature })
      if (supabaseAdmin) {
        await supabaseAdmin.from('trade_history').insert({
          mint,
          signature,
          venue: 'pump-amm',
          amount_sol: denominatedInSol ? amount : null,
          amount_tokens: !denominatedInSol ? amount : null,
          denominated_in_sol: denominatedInSol,
          slippage,
          price_per_token: null,
          created_at: new Date().toISOString(),
        })
      }
      return { signature, venue: 'pump-amm' as PoolOption }
    } catch {}
  }
  try {
    const encoded = await fetchEncodedTx({ publicKey, action: 'buy', mint, amount, denominatedInSol: String(denominatedInSol), slippage, priorityFee, pool: 'pump-amm' })
    const signature = await sendEncodedTransaction(encoded)
    console.log('buyToken venue', { venue: 'pump-amm', signature })
    if (supabaseAdmin && !preferAmm) {
      await supabaseAdmin.from('token_status').upsert({ mint, is_graduated: true, graduated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    }
    if (supabaseAdmin) {
      await supabaseAdmin.from('trade_history').insert({
        mint,
        signature,
        venue: 'pump-amm',
        amount_sol: denominatedInSol ? amount : null,
        amount_tokens: !denominatedInSol ? amount : null,
        denominated_in_sol: denominatedInSol,
        slippage,
        price_per_token: null,
        created_at: new Date().toISOString(),
      })
    }
    return { signature, venue: 'pump-amm' as PoolOption }
  } catch {
    const encoded = await fetchEncodedTx({ publicKey, action: 'buy', mint, amount, denominatedInSol: String(denominatedInSol), slippage, priorityFee, pool: 'pump' })
    const signature = await sendEncodedTransaction(encoded)
    console.log('buyToken venue', { venue: 'pump', signature })
    if (supabaseAdmin && preferAmm) {
      await supabaseAdmin.from('token_status').upsert({ mint, is_graduated: false, updated_at: new Date().toISOString() })
    }
    if (supabaseAdmin) {
      await supabaseAdmin.from('trade_history').insert({
        mint,
        signature,
        venue: 'pump',
        amount_sol: denominatedInSol ? amount : null,
        amount_tokens: !denominatedInSol ? amount : null,
        denominated_in_sol: denominatedInSol,
        slippage,
        price_per_token: null,
        created_at: new Date().toISOString(),
      })
    }
    return { signature, venue: 'pump' as PoolOption }
  }
}
