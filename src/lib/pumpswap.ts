import { PumpAmmSdk, OnlinePumpAmmSdk } from '@pump-fun/pump-swap-sdk'
import { getConnection, getSigner } from './solana'
import BN from 'bn.js'
import { PublicKey, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, createBurnInstruction } from '@solana/spl-token'
import { supabaseAdmin } from './supabase'

export const depositAndBurnLp = async ({ poolKey, quoteAmountSol, slippage = 3 }: { poolKey: string; quoteAmountSol: number; slippage?: number }) => {
  const connection = getConnection()
  const signer = getSigner()
  const offlineSdk = new PumpAmmSdk()
  const onlineSdk = new OnlinePumpAmmSdk(connection)
  const user = signer.publicKey
  const poolPubkey = new PublicKey(poolKey)

  const liquidityState = await onlineSdk.liquiditySolanaState(poolPubkey, user)
  const quoteBn = new BN(BigInt(Math.round(quoteAmountSol * LAMPORTS_PER_SOL)).toString())
  const { base, lpToken } = offlineSdk.depositAutocompleteBaseAndLpTokenFromQuote(liquidityState, quoteBn, slippage)
  const depositIxs = await offlineSdk.depositInstructions(liquidityState, lpToken, slippage)
  const { blockhash } = await connection.getLatestBlockhash('confirmed')
  const msg1 = new TransactionMessage({ payerKey: user, recentBlockhash: blockhash, instructions: depositIxs }).compileToV0Message()
  const tx1 = new VersionedTransaction(msg1)
  tx1.sign([signer])
  const depositSig = await connection.sendTransaction(tx1, { maxRetries: 3, preflightCommitment: 'confirmed' })

  const lpMint = liquidityState.pool.lpMint
  const lpAta = await getAssociatedTokenAddress(lpMint, user)
  let lpAmount = BigInt(0)
  try {
    const lpAccount = await connection.getTokenAccountBalance(lpAta)
    if (lpAccount?.value?.amount) lpAmount = BigInt(lpAccount.value.amount)
  } catch {}
  let burnSig: string | null = null
  if (lpAmount > BigInt(0)) {
    const burnIx = createBurnInstruction(lpAta, lpMint, user, Number(lpAmount))
    const { blockhash: bh2 } = await connection.getLatestBlockhash('confirmed')
    const msg2 = new TransactionMessage({ payerKey: user, recentBlockhash: bh2, instructions: [burnIx] }).compileToV0Message()
    const tx2 = new VersionedTransaction(msg2)
    tx2.sign([signer])
    burnSig = await connection.sendTransaction(tx2, { maxRetries: 3, preflightCommitment: 'confirmed' })
  }

  if (supabaseAdmin) {
    const mint = process.env.BULLBALL_MINT || null
    await supabaseAdmin.from('liquidity_history').insert({
      mint,
      pool_key: poolKey,
      quote_amount_sol: quoteAmountSol,
      base_amount_tokens: base?.toString?.(),
      lp_tokens: lpToken?.toString?.(),
      slippage,
      deposit_sig: depositSig,
      burn_sig: burnSig,
      created_at: new Date().toISOString(),
    })
  }

  return { depositSig, burnSig, base, lpToken }
}
