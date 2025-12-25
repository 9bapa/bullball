import { NextResponse } from 'next/server';
import { TradeRepository, ListenerRepository, MetricsRepository } from '@/repositories';
import { config } from '@/config';

const tradeRepo = new TradeRepository();
const listenerRepo = new ListenerRepository();
const metricsRepo = new MetricsRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint') || config.BULLRHUN_MINT;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const venue = searchParams.get('venue');
    const traderAddress = searchParams.get('trader');

    // Get trades with filters
    const trades = await tradeRepo.findByMint(mint!, {
      limit,
      offset,
      venue: venue || undefined,
      traderAddress: traderAddress || undefined,
      orderBy: 'created_at',
      orderDirection: 'desc',
    });

    // Get trade stats
    const stats = await tradeRepo.getTradeStats(mint);

    // Get listener status
    const listenerStatus = await listenerRepo.getHealthStatus();

    return NextResponse.json({
      trades: trades.map(trade => ({
        id: trade.id,
        mint: trade.mint,
        signature: trade.signature,
        venue: trade.venue,
        amountSol: trade.amount_sol,
        amountTokens: trade.amount_tokens,
        pricePerToken: trade.price_per_token,
        traderAddress: trade.trader_address,
        isSystemBuy: trade.is_system_buy,
        cycleId: trade.cycle_id,
        createdAt: trade.created_at,
      })),
      pagination: {
        limit,
        offset,
        hasMore: trades.length === limit,
      },
      stats: {
        totalTrades: stats.totalTrades,
        systemBuys: stats.systemBuys,
        userTrades: stats.userTrades,
        totalVolumeSol: stats.totalVolumeSol,
        totalVolumeTokens: stats.totalVolumeTokens,
        averageTradeSizeSol: stats.averageTradeSizeSol,
      },
      listener: listenerStatus,
      filters: {
        mint,
        venue,
        traderAddress,
      },
    });

  } catch (error) {
    console.error('GET /api/bullrhun/trades error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mint, signature, venue, amountSol, amountTokens, traderAddress } = body;

    // Validate required fields
    if (!mint || !signature || !venue) {
      return NextResponse.json(
        { error: 'Missing required fields: mint, signature, venue' },
        { status: 400 }
      );
    }

    // Create trade record (typically called by listener)
    const trade = await tradeRepo.createTrade({
      mint,
      signature,
      venue,
      amount_sol: amountSol,
      amount_tokens: amountTokens,
      price_per_token: (amountSol && amountTokens) ? amountSol / amountTokens : undefined,
      trader_address: traderAddress,
      is_system_buy: false, // User trades
    });

    // Update listener trade count if this is a qualifying trade
    if (amountSol >= config.MIN_GIFT_TRADE_AMOUNT) {
      await listenerRepo.incrementTradeCount();
    }

    return NextResponse.json({
      trade: {
        id: trade.id,
        mint: trade.mint,
        signature: trade.signature,
        venue: trade.venue,
        amountSol: trade.amount_sol,
        amountTokens: trade.amount_tokens,
        pricePerToken: trade.price_per_token,
        traderAddress: trade.trader_address,
        isSystemBuy: trade.is_system_buy,
        createdAt: trade.created_at,
      },
      message: 'Trade recorded successfully',
    });

  } catch (error) {
    console.error('POST /api/bullrhun/trades error:', error);
    return NextResponse.json(
      { error: 'Failed to record trade' },
      { status: 500 }
    );
  }
}