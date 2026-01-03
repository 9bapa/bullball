import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id, current_trade_count } = await request.json();

    if (!id || current_trade_count === undefined) {
      return NextResponse.json(
        { error: 'ID and trade count are required' },
        { status: 400 }
      );
    }

    // Update trade count using service role
    const { data, error } = await supabaseService
      .from('bullrhun_listeners')
      .upsert({
        id: id,
        current_trade_count: current_trade_count,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to update trade count:', error);
      return NextResponse.json(
        { error: 'Failed to update trade count', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Trade count updated successfully',
        currentTradeCount: data?.current_trade_count,
        timestamp: data?.updated_at
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Trade count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}