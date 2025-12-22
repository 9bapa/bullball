import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk'
import { getConnection, getSigner } from './solana'
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createBurnInstruction } from '@solana/spl-token'

export const depositAndBurnLp = async ({ poolKey, quoteAmountSol, slippage = 3 }: { poolKey: string; quoteAmountSol: number; slippage?: number }) => {
  const connection = getConnection()
  const signer = getSigner()
  const sdk = new PumpAmmSdk()
  const user = signer.publicKey
  const poolPubkey = new PublicKey(poolKey)

  const liquidityState = await sdk.liquiditySolanaState(poolPubkey, user)
  const { base, lpToken } = await sdk.depositAutocompleteBaseAndLpTokenFromQuote(liquidityState, quoteAmountSol, slippage)
  const depositIxs = await sdk.depositInstructions(liquidityState, lpToken, slippage)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const msg1 = new TransactionMessage({ payerKey: user, recentBlockhash: blockhash, instructions: depositIxs }).compileToV0Message()
  const tx1 = new VersionedTransaction(msg1)
  tx1.sign([signer])
  const depositSig = await connection.sendTransaction(tx1, { maxRetries: 3, preflightCommitment: 'confirmed' })

  const lpMint = liquidityState.pool.lpMint
  const lpAta = await getAssociatedTokenAddress(lpMint, user)
  const lpAccount = await connection.getTokenAccountBalance(lpAta).catch(() => null as any)
  const lpAmount = lpAccount?.value?.amount ? BigInt(lpAccount.value.amount) : 0n
  let burnSig: string | null = null
  if (lpAmount > 0n) {
    const burnIx = createBurnInstruction(lpAta, lpMint, user, Number(lpAmount))
    const { blockhash: bh2, lastValidBlockHeight: lvbh2 } = await connection.getLatestBlockhash('confirmed')
    const msg2 = new TransactionMessage({ payerKey: user, recentBlockhash: bh2, instructions: [burnIx] }).compileToV0Message()
    const tx2 = new VersionedTransaction(msg2)
    tx2.sign([signer])
    burnSig = await connection.sendTransaction(tx2, { maxRetries: 3, preflightCommitment: 'confirmed' })
  }

  return { depositSig, burnSig, base, lpToken }
}
