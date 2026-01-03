import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      mint, 
      price, 
      amountTokens, 
      amountSol, 
      marketCap, 
      volume24h 
    } = await request.json();

    if (!mint || price === undefined) {
      return NextResponse.json(
        { error: 'Mint address and price are required' },
        { status: 400 }
      );
    }

    // Update token with trade data using service role
    const { data, error } = await supabaseService
      .from('bullrhun_tokens')
      .upsert({
        mint: mint,
        price: price,
        market_cap: marketCap || null,
        volume_24h: volume24h || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to update token with trade:', error);
      return NextResponse.json(
        { error: 'Failed to update token with trade data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Token updated with trade data successfully',
        token: data
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token trade update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}