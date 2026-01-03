import { Connection, Keypair, VersionedTransaction, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, AddressLookupTableAccount, TransactionInstruction, SendTransactionError } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from '@solana/spl-token'
import bs58 from 'bs58'

// Mock token info for now - implement proper pump portal integration
export const getTokenInfo = async (mint: string) => {
  return {
    graduated: false, // Mock value
    price: 0.001, // Mock price
    tokens: 1000 // Mock token amount
  }
}

export const getConnection = () => {
  // Skip initialization during build time (when env vars might not be available)
  if (!process.env.SOLANA_RPC_ENDPOINT && typeof window === 'undefined') {
    // During build time, return a mock connection
    return new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
  }
  
  const endpoint = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
  return new Connection(endpoint, 'confirmed')
}

export const getSigner = () => {
  // Skip during build time
  if (typeof window === 'undefined' && !process.env.WALLET_DEV_KEY && !process.env.WALLET_DEV && !process.env.SOLANA_PRIVATE_KEY_BASE58) {
    throw new Error('Wallet not available during build time');
  }
  
  const secret = process.env.WALLET_DEV_KEY || process.env.WALLET_DEV || process.env.SOLANA_PRIVATE_KEY_BASE58
  if (!secret) throw new Error('Missing WALLET_DEV_KEY, WALLET_DEV or SOLANA_PRIVATE_KEY_BASE58')
  return Keypair.fromSecretKey(bs58.decode(secret))
}

export const getRewardSigner = () => {
  const secret = process.env.WALLET_REWARD_KEY || process.env.REWARD_KEY
  if (!secret) throw new Error('Missing WALLET_REWARD_KEY or REWARD_KEY')
  return Keypair.fromSecretKey(bs58.decode(secret))
}

export const sendEncodedTransaction = async (encoded: Uint8Array) => {
  const connection = getConnection()
  const signer = getSigner()
  const tx = VersionedTransaction.deserialize(encoded)
  tx.sign([signer])
  try {
    const sig = await connection.sendTransaction(tx, { maxRetries: 3 })
    return sig
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError logs:', error.getLogs(connection))
    }
    throw error
  }
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
  try {
    const connection = getConnection()
    const signer = getSigner()
    
    // Check wallet balance first
    const balance = await connection.getBalance(signer.publicKey)
    const balanceSol = balance / 1e9
    
    if (balanceSol < amountSol + 0.002) { // Add 0.002 SOL for rent buffer
      throw new Error(`Insufficient wallet balance: ${balanceSol} SOL (need ${amountSol + 0.002} SOL including rent)`)
    }
    
    const toPubkey = new PublicKey(to)
    const ix = SystemProgram.transfer({ fromPubkey: signer.publicKey, toPubkey, lamports: Math.floor(amountSol * LAMPORTS_PER_SOL) })
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    const msg = new TransactionMessage({ payerKey: signer.publicKey, recentBlockhash: blockhash, instructions: [ix] }).compileToV0Message([] as AddressLookupTableAccount[])
    const tx = new VersionedTransaction(msg)
    tx.sign([signer])
    const sig = await connection.sendTransaction(tx, { maxRetries: 3, preflightCommitment: 'confirmed' })
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed')
    return sig
  } catch (error) {
    console.error('Transfer failed:', error instanceof Error ? error.message : error)
    throw error
  }
}

export const transferRewardSol = async (to: string, amountSol: number) => {
  try {
    const connection = getConnection()
    const signer = getRewardSigner()
    
    // Check reward wallet balance first
    const balance = await connection.getBalance(signer.publicKey)
    const balanceSol = balance / 1e9
    
    if (balanceSol < amountSol + 0.002) { // Add 0.002 SOL for rent buffer
      throw new Error(`Insufficient reward wallet balance: ${balanceSol} SOL (need ${amountSol + 0.002} SOL including rent)`)
    }
    
    const toPubkey = new PublicKey(to)
    const ix = SystemProgram.transfer({ fromPubkey: signer.publicKey, toPubkey, lamports: Math.floor(amountSol * LAMPORTS_PER_SOL) })
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
    const msg = new TransactionMessage({ payerKey: signer.publicKey, recentBlockhash: blockhash, instructions: [ix] }).compileToV0Message([] as AddressLookupTableAccount[])
    const tx = new VersionedTransaction(msg)
    tx.sign([signer])
    const sig = await connection.sendTransaction(tx, { maxRetries: 3, preflightCommitment: 'confirmed' })
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed')
    return sig
  } catch (error) {
    console.error('Reward transfer failed:', error instanceof Error ? error.message : error)
    throw error
  }
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

export const collectCreatorFee = async (mint: string, amountSol: number) => {
  // Collect creator fees from trading operations
  // In a real implementation, this would interact with token-specific fee mechanisms
  // For now, we'll simulate fee collection by recording the transaction
  
  try {
    // Generate a mock transaction signature for fee collection
    const signature = `fee_collected_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    console.log(`💰 Simulated fee collection: ${amountSol} SOL for mint ${mint.substring(0, 8)}... ${signature}`);
    
    return {
      signature: {
        signature,
        amount: amountSol,
        status: 'success' as const
      },
      amount: amountSol,
      status: 'success' as const
    };
  } catch (error) {
    throw new Error(`Fee collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const buyToken = async (mint: string, amountSol: number) => {
  const maxRetries = 3
  const retryDelay = 2000 // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`💰 Buying ${amountSol} SOL worth of tokens for mint: ${mint.substring(0, 8)}... (Attempt ${attempt}/${maxRetries})`);
      
      const connection = getConnection()
      const signer = getSigner()
      
      // Check if we have sufficient balance
      const balance = await connection.getBalance(signer.publicKey)
      const balanceSol = balance / 1e9
      
      if (balanceSol < amountSol + 0.005) { // Add 0.005 SOL for transaction fees
        throw new Error(`Insufficient balance: ${balanceSol} SOL (need ${amountSol + 0.005} SOL including fees)`)
      }

      // Use the proper PumpPortal implementation
      const result:any = await buyTokenWithPumpPortal({ mint, amount: amountSol })
      
      console.log(`✅ Successfully bought ${amountSol} SOL worth of tokens: ${result.signature}`);
      
      return {
        signature: result.signature,
        amount: amountSol,
        status: 'success' as const,
        venue: result.venue,
        tokens: Math.floor(amountSol * 1000000), // Mock conversion rate for compatibility
        price: 0.001 // Mock price for compatibility
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Token purchase failed (attempt ${attempt}/${maxRetries}):`, errorMessage);
      
      // If this is the last attempt, fail properly
      if (attempt === maxRetries) {
        console.error('❌ All retry attempts exhausted. Token purchase failed.');
        throw new Error(`Token purchase failed after ${maxRetries} attempts: ${errorMessage}`);
      }
      
      // Wait before retry
      console.warn(`⚠️ Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('Token purchase failed: Unexpected error in retry loop');
}

// Helper function using the proper PumpPortal implementation
const buyTokenWithPumpPortal = async ({ mint, amount, denominatedInSol = true, slippage = 15, priorityFee = 0.0001 }: { 
  mint: string; 
  amount: number; 
  denominatedInSol?: boolean; 
  slippage?: number; 
  priorityFee?: number 
}) => {
  const TRADE_LOCAL_URL = 'https://pumpportal.fun/api/trade-local'
  const MIN_BUY_AMOUNT = 0.001 // Minimum 0.001 SOL or token amount
  
  if (denominatedInSol && amount < MIN_BUY_AMOUNT) {
    throw new Error(`Amount ${amount} below minimum ${MIN_BUY_AMOUNT} SOL`)
  }

  const getWalletPublicKey = () => {
    const pk = process.env.WALLET_DEV
    if (!pk) throw new Error('Missing SOLANA_PUBLIC_KEY')
    return pk
  }

  const getGraduationStatus = async (mint: string) => {
    const { supabaseAdmin } = await import('./supabase')
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin.from('bullrhun_tokens').select('is_graduated').eq('mint', mint).maybeSingle()
      return !!data?.is_graduated
    }
    return false
  }

  const fetchEncodedTx = async (payload: any) => {
    const apiKey = process.env.PUMPPORTAL_API_KEY
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['x-api-key'] = apiKey
    
    try {
      const { action, mint: m, amount: amt, denominatedInSol: d, slippage: s, priorityFee: p, pool } = payload || {}
      console.log('PumpPortal fetch', { action, mint: m, amount: amt, denominatedInSol: d, slippage: s, priorityFee: p, pool })
    } catch {}
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const res = await fetch(TRADE_LOCAL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`PumpPortal error: ${res.statusText} - ${errorText}`)
      }
      
      const buf = await res.arrayBuffer()
      return new Uint8Array(buf)
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  const publicKey = getWalletPublicKey()
  console.log('buyToken start', { mint, amount, denominatedInSol, slippage, priorityFee })
  
  // Check if token is graduated and prefer AMM
  let preferAmm = await getGraduationStatus(mint)  
  // Try pump-amm first if token is graduated
  if (preferAmm) {
    try {
      const encoded = await fetchEncodedTx({ 
        publicKey, 
        action: 'buy', 
        mint, 
        amount, 
        denominatedInSol: String(denominatedInSol), 
        slippage, 
        priorityFee, 
        pool: 'pump-amm' 
      })
      const signature = await sendEncodedTransaction(encoded)
      console.log('buyToken venue', { venue: 'pump-amm', signature })
      return { signature, venue: 'pump-amm' as const }
    } catch (error) {
      console.warn('pump-amm failed, trying pump:', error)
    }
  }
  
  // try pump non-amm if token is not graduated
  try {
    const encoded = await fetchEncodedTx({ 
      publicKey, 
      action: 'buy', 
      mint, 
      amount, 
      denominatedInSol: String(denominatedInSol), 
      slippage, 
      priorityFee, 
      pool: 'pump' 
    })
    const signature = await sendEncodedTransaction(encoded)
    console.log('buyToken venue', { venue: 'pump', signature })
        
    return { signature, venue: 'pump-amm' as const }
  } catch (error) {
    console.warn('pump-amm failed, trying pump:', error)
  }
  
}

export const depositAndBurnLp = async (mint: string, amount: number) => {
  // Placeholder implementation for depositing and burning liquidity pool tokens
  const connection = getConnection()
  const signer = getSigner()
  
  // Mock implementation - would interact with actual DEX
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const msg = new TransactionMessage({ 
    payerKey: signer.publicKey, 
    recentBlockhash: blockhash, 
    instructions: [] 
  }).compileToV0Message([] as AddressLookupTableAccount[])
  const tx = new VersionedTransaction(msg)
  tx.sign([signer])
  const sig = await connection.sendTransaction(tx, { maxRetries: 3 })
  
  return {
    depositSig: sig,
    burnSig: null,
    base: 1000 // Mock value
  }
}
