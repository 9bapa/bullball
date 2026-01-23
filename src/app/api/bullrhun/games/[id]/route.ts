import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gameId = (await params).id;

    const { data: game, error } = await supabaseService
      .from('bullrhun_games')
      .select(`
        id,
        token_mint,
        trade_goal,
        trade_count,
        trade_type,
        min_trade_amount,
        is_bull_mode,
        game_wallet_address,
        game_wallet_balance,
        status,
        created_at,
        completed_at
      `)
      .eq('id', gameId)
      .single();

    if (error || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const progress = (game.trade_count / game.trade_goal) * 100;

    return NextResponse.json({
      game: {
        id: game.id,
        tokenMint: game.token_mint,
        tradeGoal: game.trade_goal,
        tradeCount: game.trade_count,
        tradeType: game.trade_type,
        minTradeAmount: game.min_trade_amount,
        isBullMode: game.is_bull_mode,
        gameWalletAddress: game.game_wallet_address,
        gameWalletBalance: game.game_wallet_balance,
        status: game.status,
        createdAt: game.created_at,
        completedAt: game.completed_at,
        progress,
      },
    });
  } catch (error) {
    console.error('GET /api/bullrhun/games/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const gameId = (await params).id;
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      const { data: existingGame } = await supabaseService
        .from('bullrhun_games')
        .select('token_mint, trade_count, game_wallet_balance')
        .eq('id', gameId)
        .single();

      if (!existingGame) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }

      const newTradeGoal = Math.floor(Math.random() * (1000 - 50 + 1)) + 50;
      const newTradeType = Math.random() > 0.5 ? 'buys_sells' : 'buys_only';
      const newMinTradeAmount = (Math.random() * (10 - 0.1) + 0.1).toFixed(2);
      const newIsBullMode = newTradeGoal > 300;

      const { data: updatedGame, error } = await supabaseService
        .from('bullrhun_games')
        .update({
          trade_goal: newTradeGoal,
          trade_type: newTradeType,
          min_trade_amount: newMinTradeAmount,
          is_bull_mode: newIsBullMode,
          status: 'active',
          trade_count: 0,
          game_wallet_balance: 0,
          winner_wallet_address: null,
          winning_signature: null,
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to reset game' }, { status: 500 });
      }

      return NextResponse.json({
        game: updatedGame,
        message: 'Game reset successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/bullrhun/games/[id] error:', error);
    return NextResponse.json({ error: 'Failed to process game action' }, { status: 500 });
  }
}
