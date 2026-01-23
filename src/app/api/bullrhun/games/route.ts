import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { encryptionService } from '@/lib/encryption';
import { getConnection } from '@/lib/solana';
import { Keypair } from '@solana/web3.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('mint');
    const status = searchParams.get('status');

    let query = supabaseService
      .from('bullrhun_games')
      .select(`
        id,
        token_mint,
        token_name,
        token_ticker,
        trade_goal,
        trade_count,
        trade_type,
        min_trade_amount,
        is_bull_mode,
        game_wallet_address,
        game_wallet_balance,
        status,
        created_at
      `)
      .order('game_wallet_balance', { ascending: false });

    if (tokenMint) {
      query = query.eq('token_mint', tokenMint);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: games, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
    }

    return NextResponse.json({
      games: games || [],
      count: games?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/bullrhun/games error:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenMint, tokenName, tokenTicker } = body;

    if (!tokenMint || !tokenName || !tokenTicker) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenMint, tokenName, tokenTicker' },
        { status: 400 }
      );
    }

    const { data: existingGame } = await supabaseService
      .from('bullrhun_games')
      .select('id, token_mint')
      .eq('token_mint', tokenMint)
      .single();

    if (existingGame) {
      return NextResponse.json(
        { error: 'Token address already registered. Each token can only have one BullRhun game.' },
        { status: 409 }
      );
    }

    const connection = getConnection();
    const gameWalletKeypair = Keypair.generate();
    const gameWalletAddress = gameWalletKeypair.publicKey.toBase58();

    const tradeGoal = Math.floor(Math.random() * (1000 - 50 + 1)) + 50;
    const tradeType = Math.random() > 0.5 ? 'buys_sells' : 'buys_only';
    const minTradeAmount = (Math.random() * (0.99 - 0.1) + 0.1).toFixed(2);
    const isBullMode = tradeGoal > 300;

    const gameWalletPrivateKey = encryptionService.encryptPrivateKey(
      Array.from(gameWalletKeypair.secretKey)
    );

    const { data: game, error } = await supabaseService
      .from('bullrhun_games')
      .insert({
        token_mint: tokenMint,
        token_name: tokenName,
        token_ticker: tokenTicker,
        trade_goal: tradeGoal,
        trade_count: 0,
        trade_type: tradeType,
        min_trade_amount: minTradeAmount,
        is_bull_mode: isBullMode,
        game_wallet_address: gameWalletAddress,
        game_wallet_private_key: gameWalletPrivateKey,
        game_wallet_balance: 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    return NextResponse.json({
      game: {
        id: game.id,
        tokenMint: game.token_mint,
        tokenName: game.token_name,
        tokenTicker: game.token_ticker,
        tradeGoal: game.trade_goal,
        tradeType: game.trade_type,
        minTradeAmount: game.min_trade_amount,
        isBullMode: game.is_bull_mode,
        gameWalletAddress: game.game_wallet_address,
        status: game.status,
      },
      message: 'Game created successfully',
    });
  } catch (error) {
    console.error('POST /api/bullrhun/games error:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
