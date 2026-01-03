import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { mint, is_active, is_graduated, graduated_at, price, market_cap, volume_24h } = await request.json();

    if (!mint) {
      return NextResponse.json(
        { error: 'Mint address is required' },
        { status: 400 }
      );
    }

    // Create token using service role
    const { data, error } = await supabaseService
      .from('bullrhun_tokens')
      .insert({
        mint,
        is_active: is_active ?? true,
        is_graduated: is_graduated ?? false,
        graduated_at: graduated_at || null,
        price: price || null,
        market_cap: market_cap || null,
        volume_24h: volume_24h || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create token:', error);
      return NextResponse.json(
        { error: 'Failed to create token', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Token created successfully',
        token: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Token create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}