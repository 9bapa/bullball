import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { encryptionService } from '@/lib/encryption';
import { getConnection } from '@/lib/solana';
import { Keypair, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Platform wallet addresses from environment variables
const WALLET_PLATFORM = process.env.WALLET_PLATFORM;
const WALLET_DEV = process.env.WALLET_DEV;

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!WALLET_PLATFORM) {
      return NextResponse.json({ error: 'Platform wallet not configured' }, { status: 500 });
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseService
      .from('bullrhun_orders')
      .select('*, bullrhun_order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order is not in pending status' }, { status: 400 });
    }

    if (!order.solana_private_key) {
      return NextResponse.json({ error: 'Order private key not found' }, { status: 400 });
    }

    // Decrypt the private key
    const privateKeyArray = encryptionService.decryptPrivateKey(order.solana_private_key);
    const privateKeyUint8Array = new Uint8Array(privateKeyArray);
    
    // Create keypair from decrypted private key
    const orderKeypair = Keypair.fromSecretKey(privateKeyUint8Array);
    const connection = getConnection();

    // Check the balance in the order payment address
    const balance = await connection.getBalance(orderKeypair.publicKey);
    const balanceSol = balance / LAMPORTS_PER_SOL;

    if (balanceSol < order.payment_amount_sol) {
      return NextResponse.json({ 
        error: 'Insufficient payment received',
        currentBalance: balanceSol,
        requiredAmount: order.payment_amount_sol
      }, { status: 400 });
    }

    // Calculate fee distribution
    let totalDevFee = 0;
    let platformAmount = balanceSol;

    // Calculate 25% of (base_price - cost_price) for each item
    for (const item of order.bullrhun_order_items || []) {
      if (item.bullrhun_products) {
        const product = item.bullrhun_products;
        const basePrice = product.base_price || 0;
        const costPrice = product.cost_price || 0;
        const margin = basePrice - costPrice;
        
        if (margin > 0) {
          const devFeePerItem = (margin * 0.25) * item.quantity;
          totalDevFee += devFeePerItem;
        }
      }
    }

    // Platform gets the remaining amount after dev fees
    platformAmount = balanceSol - totalDevFee;

    // Account for transaction fees (0.002 SOL buffer)
    const transactionFees = 0.002;
    if (platformAmount < transactionFees) {
      return NextResponse.json({ 
        error: 'Insufficient funds for transaction fees',
        platformAmount: platformAmount,
        requiredFees: transactionFees
      }, { status: 400 });
    }
    
    platformAmount -= transactionFees;

    // Build transfer instructions
    const instructions: any[] = [];

    // Transfer to dev wallet if there's a fee
    if (totalDevFee > 0 && WALLET_DEV) {
      const devPubkey = new PublicKey(WALLET_DEV);
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: orderKeypair.publicKey,
          toPubkey: devPubkey,
          lamports: Math.floor(totalDevFee * LAMPORTS_PER_SOL)
        })
      );
    }

    // Transfer to platform wallet
    const platformPubkey = new PublicKey(WALLET_PLATFORM);
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: orderKeypair.publicKey,
        toPubkey: platformPubkey,
        lamports: Math.floor(platformAmount * LAMPORTS_PER_SOL)
      })
    );

    // Create and sign transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const message = new TransactionMessage({
      payerKey: orderKeypair.publicKey,
      recentBlockhash: blockhash,
      instructions
    }).compileToV0Message([]);

    const transaction = new VersionedTransaction(message);
    transaction.sign([orderKeypair]);

    // Send transaction
    const signature = await connection.sendTransaction(transaction, { 
      maxRetries: 3,
      preflightCommitment: 'confirmed'
    });

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed');

    // Update order status to paid
    const { error: updateError } = await supabaseService
      .from('bullrhun_orders')
      .update({
        status: 'paid',
        solana_payment_signature: signature,
        payment_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order status:', updateError);
      // Don't fail the response, but log the error
    }

    console.log(`💰 Payment processed for order ${orderId}:`);
    console.log(`   Total received: ${balanceSol} SOL`);
    console.log(`   Dev fee (25%): ${totalDevFee} SOL`);
    console.log(`   Platform amount: ${platformAmount} SOL`);
    console.log(`   Transaction: ${signature}`);

    return NextResponse.json({
      success: true,
      signature,
      amountTransferred: balanceSol,
      devFee: totalDevFee,
      platformAmount: platformAmount,
      transactionHash: signature
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ 
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}