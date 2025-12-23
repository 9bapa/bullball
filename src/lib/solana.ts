import { Connection, Keypair, VersionedTransaction, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, AddressLookupTableAccount } from '@solana/web3.js'
import bs58 from 'bs58'

export const getConnection = () => {
  const endpoint = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
  return new Connection(endpoint, 'confirmed')
}

export const getSigner = () => {
  const secret = process.env.DEV_WALLET || process.env.SOLANA_PRIVATE_KEY_BASE58
  if (!secret) throw new Error('Missing DEV_WALLET or SOLANA_PRIVATE_KEY_BASE58')
  return Keypair.fromSecretKey(bs58.decode(secret))
}

export const sendEncodedTransaction = async (encoded: Uint8Array) => {
  const connection = getConnection()
  const signer = getSigner()
  const tx = VersionedTransaction.deserialize(encoded)
  tx.sign([signer])
  const sig = await connection.sendTransaction(tx, { maxRetries: 3 })
  return sig
}

export const transferSol = async (to: string, amountSol: number) => {
  const connection = getConnection()
  const signer = getSigner()
  const toPubkey = new PublicKey(to)
  const ix = SystemProgram.transfer({ fromPubkey: signer.publicKey, toPubkey, lamports: Math.floor(amountSol * LAMPORTS_PER_SOL) })
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const msg = new TransactionMessage({ payerKey: signer.publicKey, recentBlockhash: blockhash, instructions: [ix] }).compileToV0Message([] as AddressLookupTableAccount[])
  const tx = new VersionedTransaction(msg)
  tx.sign([signer])
  const sig = await connection.sendTransaction(tx, { maxRetries: 3, preflightCommitment: 'confirmed' })
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed')
  return sig
}
