import { Connection, Keypair, VersionedTransaction, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, AddressLookupTableAccount, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from '@solana/spl-token'
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

export const getRewardSigner = () => {
  const secret = process.env.REWARD_KEY
  if (!secret) throw new Error('Missing REWARD_KEY')
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

export const getBalance = async (publicKey: string) => {
  const connection = getConnection()
  const pubkey = new PublicKey(publicKey)
  const balance = await connection.getBalance(pubkey)
  return balance / LAMPORTS_PER_SOL
}

export const getTokenBalance = async (mint: string, owner: string) => {
  const connection = getConnection()
  const mintPubkey = new PublicKey(mint)
  const ownerPubkey = new PublicKey(owner)
  const tokenAccount = await getAssociatedTokenAddress(mintPubkey, ownerPubkey)
  try {
    const account = await getAccount(connection, tokenAccount)
    return Number(account.amount)
  } catch {
    return 0
  }
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

export const transferRewardSol = async (to: string, amountSol: number) => {
  const connection = getConnection()
  const signer = getRewardSigner()
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

export const transferToken = async (to: string, mint: string, amount: number) => {
  const connection = getConnection()
  const signer = getSigner()
  const toPubkey = new PublicKey(to)
  const mintPubkey = new PublicKey(mint)

  const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, signer.publicKey)
  const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey)

  const instructions: TransactionInstruction[] = []

  // Check if recipient's token account exists
  try {
    await getAccount(connection, toTokenAccount)
  } catch {
    // Create associated token account if it doesn't exist
    instructions.push(
      createAssociatedTokenAccountInstruction(
        signer.publicKey,
        toTokenAccount,
        toPubkey,
        mintPubkey
      )
    )
  }

  // Transfer instruction
  instructions.push(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      signer.publicKey,
      amount
    )
  )

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const msg = new TransactionMessage({ payerKey: signer.publicKey, recentBlockhash: blockhash, instructions }).compileToV0Message([] as AddressLookupTableAccount[])
  const tx = new VersionedTransaction(msg)
  tx.sign([signer])
  const sig = await connection.sendTransaction(tx, { maxRetries: 3, preflightCommitment: 'confirmed' })
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed')
  return sig
}
