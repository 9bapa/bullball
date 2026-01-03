import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { monitored_mint, id } = await request.json();

    if (!monitored_mint || !id) {
      return NextResponse.json(
        { error: 'Monitored mint and id are required' },
        { status: 400 }
      );
    }

    // Insert or update listener using service role
    const { data, error } = await supabaseService
      .from('bullrhun_listeners')
      .upsert({
        id: id,
        monitored_mint: monitored_mint,
        last_heartbeat: new Date().toISOString(),
        total_trades_monitored: 0,
        current_trade_threshold: 30,
        current_trade_count: 0,
        updated_at: new Date().toISOString(),
        trade_goal: 100,
        minimum_trade_amount: 0.05,
        last_winner_address: null,
        last_winner_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create listener:', error);
      return NextResponse.json(
        { error: 'Failed to create listener', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Listener created successfully',
        listener: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Listener create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}