import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { encryptionService } from '@/lib/encryption';
import { getConnection } from '@/lib/solana';
import { Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getTokenMetadata } from '@/lib/helius';
import { getBestPair } from '@/lib/dexscreener';

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
        token_description,
        token_image_url,
        token_supply,
        token_decimals,
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
    const { tokenMint, startingAmount, userPublicKey } = body;

    if (!tokenMint) {
      return NextResponse.json(
        { error: 'Missing required field: tokenMint' },
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

    const metadata = await getTokenMetadata(tokenMint);

    const connection = getConnection();
    const gameWalletKeypair = Keypair.generate();
    const gameWalletAddress = gameWalletKeypair.publicKey.toBase58();

    const tradeGoal = Math.floor(Math.random() * (1000 - 50 + 1)) + 50;
    const tradeType = Math.random() > 0.5 ? 'buys_sells' : 'buys_only';
    const minTradeAmount = (Math.random() * (0.99 - 0.1) + 0.1).toFixed(2);
    const isBullMode = tradeGoal > 300;

    const dexPair = await getBestPair(tokenMint);

    const gameWalletPrivateKey = encryptionService.encryptPrivateKey(
      Array.from(gameWalletKeypair.secretKey)
    );

    const { data: game, error } = await supabaseService
      .from('bullrhun_games')
      .insert({
        token_mint: tokenMint,
        token_name: metadata?.name || '',
        token_ticker: metadata?.symbol || '',
        token_description: metadata?.description || '',
        token_image_url: metadata?.image_url || '',
        token_supply: metadata?.supply || 0,
        token_decimals: metadata?.decimals || 0,
        trade_goal: tradeGoal,
        trade_count: 0,
        trade_type: tradeType,
        min_trade_amount: minTradeAmount,
        is_bull_mode: isBullMode,
        game_wallet_address: gameWalletAddress,
        game_wallet_private_key: gameWalletPrivateKey,
        game_wallet_balance: 0,
        status: 'active',
        pair_address: dexPair?.pairAddress || null,
        dex_id: dexPair?.dexId || null,
        price_usd: dexPair?.priceUsd ? parseFloat(dexPair.priceUsd) : null,
        volume_usd: dexPair?.volume?.h24 || dexPair?.volume?.['1'] || null,
        price_change_24h: dexPair?.priceChange?.h24 || null,
        liquidity_usd: dexPair?.liquidity?.usd || null,
        marketcap_usd: dexPair?.marketCap || null,
        fdv_usd: dexPair?.fdv || null,
        websites: dexPair?.info?.websites || [],
        socials: dexPair?.info?.socials || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    let transaction: string | null = null;

    if (startingAmount && startingAmount > 0 && userPublicKey) {
      try {
        const userPubkey = new PublicKey(userPublicKey);
        const gamePubkey = new PublicKey(gameWalletAddress);

        const lamports = Math.floor(startingAmount * LAMPORTS_PER_SOL);

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

        transaction = Buffer.from(serializedTransaction).toString('base64');
      } catch (txError) {
        console.error('Failed to create transfer transaction:', txError);
        return NextResponse.json(
          { error: 'Failed to create transfer transaction' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      game: {
        id: game.id,
        tokenMint: game.token_mint,
        tokenName: game.token_name,
        tokenTicker: game.token_ticker,
        tokenDescription: game.token_description,
        tokenImageUrl: game.token_image_url,
        tokenSupply: game.token_supply,
        tokenDecimals: game.token_decimals,
        tradeGoal: game.trade_goal,
        tradeType: game.trade_type,
        minTradeAmount: game.min_trade_amount,
        isBullMode: game.is_bull_mode,
        gameWalletAddress: game.game_wallet_address,
        status: game.status,
      },
      transaction,
      message: 'Game created successfully',
    });
  } catch (error) {
    console.error('POST /api/bullrhun/games error:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
