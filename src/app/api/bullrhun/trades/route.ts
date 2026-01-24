import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!gameId) {
      return NextResponse.json({ error: 'Missing required field: game_id' }, { status: 400 });
    }

    const { data: trades, error } = await supabaseService
      .from('bullrhun_games_trades')
      .select(`
        id,
        game_id,
        trader_wallet_address,
        amount,
        price_usd,
        price_native,
        transaction_signature,
        trade_type,
        created_at
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }

    return NextResponse.json({
      trades: trades || [],
      count: trades?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/bullrhun/trades error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, traderWalletAddress, amount, priceUsd, priceNative, transactionSignature, tradeType } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'Missing required field: gameId' }, { status: 400 });
    }

    if (!traderWalletAddress) {
      return NextResponse.json({ error: 'Missing required field: traderWalletAddress' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!transactionSignature) {
      return NextResponse.json({ error: 'Missing required field: transactionSignature' }, { status: 400 });
    }

    if (!tradeType || !['buy', 'sell'].includes(tradeType)) {
      return NextResponse.json({ error: 'Invalid tradeType. Must be "buy" or "sell"' }, { status: 400 });
    }

    const { data: game, error: gameError } = await supabaseService
      .from('bullrhun_games')
      .select('id, trade_count')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const { data: trade, error: tradeError } = await supabaseService
      .from('bullrhun_games_trades')
      .insert({
        game_id: gameId,
        trader_wallet_address: traderWalletAddress,
        amount: amount,
        price_usd: priceUsd,
        price_native: priceNative,
        transaction_signature: transactionSignature,
        trade_type: tradeType,
      })
      .select()
      .single();

    if (tradeError) {
      return NextResponse.json({ error: 'Failed to create trade record' }, { status: 500 });
    }

    await supabaseService
      .from('bullrhun_games')
      .update({ trade_count: (game.trade_count || 0) + 1 })
      .eq('id', gameId);

    return NextResponse.json({
      trade: {
        id: trade.id,
        gameId: trade.game_id,
        traderWalletAddress: trade.trader_wallet_address,
        amount: trade.amount,
        priceUsd: trade.price_usd,
        priceNative: trade.price_native,
        transactionSignature: trade.transaction_signature,
        tradeType: trade.trade_type,
        createdAt: trade.created_at,
      },
      message: 'Trade recorded successfully',
    });
  } catch (error) {
    console.error('POST /api/bullrhun/trades error:', error);
    return NextResponse.json({ error: 'Failed to record trade' }, { status: 500 });
  }
}