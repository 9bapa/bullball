import { sendEncodedTransaction } from './solana'
import { PublicKey } from '@solana/web3.js'

type PoolOption = 'pump' | 'raydium' | 'pump-amm' | 'launchlab' | 'raydium-cpmm' | 'bonk' | 'auto'

const TRADE_LOCAL_URL = 'https://pumpportal.fun/api/trade-local'

const getWalletPublicKey = () => {
  const pk = process.env.SOLANA_PUBLIC_KEY
  if (!pk) throw new Error('Missing SOLANA_PUBLIC_KEY')
  return pk
}

const fetchEncodedTx = async (payload: any) => {
  const res = await fetch(TRADE_LOCAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`PumpPortal error: ${res.statusText}`)
  const buf = await res.arrayBuffer()
  return new Uint8Array(buf)
}

export const collectCreatorFee = async (priorityFee = 0.000001) => {
  const publicKey = getWalletPublicKey()
  const encoded = await fetchEncodedTx({ publicKey, action: 'collectCreatorFee', priorityFee })
  const signature = await sendEncodedTransaction(encoded)
  return signature
}

export const buyToken = async ({ mint, amount, denominatedInSol, slippage = 3, priorityFee = 0.00005, pool = 'auto' as PoolOption }: { mint: string; amount: number; denominatedInSol: boolean; slippage?: number; priorityFee?: number; pool?: PoolOption }) => {
  const publicKey = getWalletPublicKey()
  const encoded = await fetchEncodedTx({ publicKey, action: 'buy', mint, amount, denominatedInSol: String(denominatedInSol), slippage, priorityFee, pool })
  const signature = await sendEncodedTransaction(encoded)
  return signature
}
