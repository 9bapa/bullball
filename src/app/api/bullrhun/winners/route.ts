import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('mint');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseService
      .from('bullrhun_winners')
      .select(`
        id,
        game_id,
        token_mint,
        winner_wallet_address,
        winning_amount,
        winning_signature,
        payout_tx_id,
        game_stats,
        won_at
      `)
      .order('won_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tokenMint) {
      query = query.eq('token_mint', tokenMint);
    }

    const { data: winners, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 });
    }

    return NextResponse.json({
      winners: winners || [],
      pagination: {
        limit,
        offset,
        hasMore: (winners?.length || 0) === limit,
      },
      total: count,
    });
  } catch (error) {
    console.error('GET /api/bullrhun/winners error:', error);
    return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 });
  }
}
