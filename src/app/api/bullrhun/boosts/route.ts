import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { getConnection } from '@/lib/solana';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ error: 'Missing required field: game_id' }, { status: 400 });
    }

    const { data: boosts, error } = await supabaseService
      .from('bullrhun_game_boosts')
      .select(`
        id,
        game_id,
        user_wallet_address,
        amount,
        transaction_signature,
        created_at
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch boosts' }, { status: 500 });
    }

    return NextResponse.json({
      boosts: boosts || [],
      count: boosts?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/bullrhun/boosts error:', error);
    return NextResponse.json({ error: 'Failed to fetch boosts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, amount, userPublicKey } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'Missing required field: gameId' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount. Must be greater than 0' }, { status: 400 });
    }

    if (amount < 0.01) {
      return NextResponse.json({ error: 'Minimum boost amount is 0.01 SOL' }, { status: 400 });
    }

    if (!userPublicKey) {
      return NextResponse.json({ error: 'Missing required field: userPublicKey' }, { status: 400 });
    }

    const { data: game, error: gameError } = await supabaseService
      .from('bullrhun_games')
      .select('id, game_wallet_address, game_wallet_balance')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const connection = getConnection();
    const userPubkey = new PublicKey(userPublicKey);
    const gamePubkey = new PublicKey(game.game_wallet_address);

    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: gamePubkey,
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transferTransaction.recentBlockhash = blockhash;
    transferTransaction.feePayer = userPubkey;

    const serializedTransaction = transferTransaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    const { data: boost, error: boostError } = await supabaseService
      .from('bullrhun_game_boosts')
      .insert({
        game_id: gameId,
        user_wallet_address: userPublicKey,
        amount: amount,
      })
      .select()
      .single();

    if (boostError) {
      return NextResponse.json({ error: 'Failed to create boost record' }, { status: 500 });
    }

    return NextResponse.json({
      boost: {
        id: boost.id,
        gameId: boost.game_id,
        userWalletAddress: boost.user_wallet_address,
        amount: boost.amount,
        createdAt: boost.created_at,
      },
      transaction: Buffer.from(serializedTransaction).toString('base64'),
      gameWalletAddress: game.game_wallet_address,
      message: 'Boost transaction created. Please sign and send the transaction.',
    });
  } catch (error) {
    console.error('POST /api/bullrhun/boosts error:', error);
    return NextResponse.json({ error: 'Failed to create boost' }, { status: 500 });
  }
}