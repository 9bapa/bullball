import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { mint, price } = await request.json();

    if (!mint || price === undefined) {
      return NextResponse.json(
        { error: 'Mint address and price are required' },
        { status: 400 }
      );
    }

    // Update token price using service role
    const { data, error } = await supabaseService
      .from('bullrhun_tokens')
      .upsert({
        mint: mint,
        price: price,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to update token price:', error);
      return NextResponse.json(
        { error: 'Failed to update token price', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Token price updated successfully',
        token: data
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token price update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}