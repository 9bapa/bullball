import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { getBestPair, getDexPairPrice, DexPair } from '@/lib/dexscreener';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gameId = (await params).id;
    console.log(`[Dex Update] Fetching game ${gameId}`);

    const { data: game, error: fetchError } = await supabaseService
      .from('bullrhun_games')
      .select('id, token_mint, token_ticker, pair_address, dex_id, updated_at')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      console.error(`[Dex Update] Game not found: ${gameId}`, fetchError);
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    console.log(`[Dex Update] Game ${game.token_ticker} (${gameId}): pair_address=${game.pair_address}, dex_id=${game.dex_id}`);

    let dexPair: DexPair | null = null;

    if (!game.pair_address || !game.dex_id) {
      console.log(`[Dex Update] No pair_address/dex_id, fetching from DexScreener for ${game.token_mint}`);
      const bestPair = await getBestPair(game.token_mint);
      if (bestPair) {
        dexPair = bestPair;
        console.log(`[Dex Update] Found best pair for ${game.token_ticker}`);
      } else {
        console.warn(`[Dex Update] No pair found for ${game.token_ticker} (${game.token_mint})`);
      }
    } else if (game.pair_address && game.dex_id) {
      console.log(`[Dex Update] Existing pair found, fetching price for ${game.dex_id}`);
      const pairs = await getDexPairPrice(game.dex_id);
      if (pairs.length > 0) {
        dexPair = pairs.find(p => p.pairAddress === game.pair_address) || pairs[0];
        console.log(`[Dex Update] Found ${pairs.length} pairs, using pair for ${game.token_ticker}`);
      } else {
        console.warn(`[Dex Update] No price data found for dex_id: ${game.dex_id}`);
      }
    }

    if (!dexPair) {
      console.error(`[Dex Update] No DexScreener data available for ${game.token_ticker}`);
      return NextResponse.json(
        { error: 'No DexScreener data available for this token' },
        { status: 404 }
      );
    }

    console.log(`[Dex Update] Updating ${game.token_ticker} with DexScreener data:`, {
      pairAddress: dexPair.pairAddress,
      priceUsd: dexPair.priceUsd,
      liquidity: dexPair.liquidity?.usd,
      volume: dexPair.volume?.h24
    });

    const { data: updatedGame, error: updateError } = await supabaseService
      .from('bullrhun_games')
      .update({
        pair_address: dexPair.pairAddress,
        dex_id: dexPair.dexId,
        price_usd: parseFloat(dexPair.priceUsd),
        volume_usd: dexPair.volume?.h24 || 0,
        price_change_24h: dexPair.priceChange?.h24 || 0,
        liquidity_usd: dexPair.liquidity?.usd || 0,
        marketcap_usd: dexPair.marketCap || 0,
        fdv_usd: dexPair.fdv || 0,
        websites: JSON.stringify(dexPair.info?.websites || []),
        socials: JSON.stringify(dexPair.info?.socials || []),
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update game with DexScreener data:', updateError);
      return NextResponse.json(
        { error: 'Failed to update game with DexScreener data' },
        { status: 500 }
      );
    }

    console.log(`[Dex Update] Successfully updated ${game.token_ticker}`);

    return NextResponse.json({
      game: {
        id: updatedGame.id,
        pair_address: updatedGame.pair_address,
        dex_id: updatedGame.dex_id,
        price_usd: updatedGame.price_usd,
        volume_usd: updatedGame.volume_usd,
        price_change_24h: updatedGame.price_change_24h,
        liquidity_usd: updatedGame.liquidity_usd,
        marketcap_usd: updatedGame.marketcap_usd,
        fdv_usd: updatedGame.fdv_usd,
        websites: updatedGame.websites,
        socials: updatedGame.socials,
        updated_at: updatedGame.updated_at,
      },
      message: 'Game updated with DexScreener data',
    });
  } catch (error) {
    console.error('POST /api/bullrhun/games/[id]/dex-update error:', error);
    return NextResponse.json(
      { error: 'Failed to update game with DexScreener data' },
      { status: 500 }
    );
  }
}
