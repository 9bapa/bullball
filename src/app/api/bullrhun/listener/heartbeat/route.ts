import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id, monitored_mint } = await request.json();

    if (!id || !monitored_mint) {
      return NextResponse.json(
        { error: 'ID and monitored mint are required' },
        { status: 400 }
      );
    }

    // Update heartbeat using service role
    const { data, error } = await supabaseService
      .from('bullrhun_listeners')
      .upsert({
        id: id,
        monitored_mint: monitored_mint,
        last_heartbeat: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to update heartbeat:', error);
      return NextResponse.json(
        { error: 'Failed to update heartbeat', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Heartbeat updated successfully',
        lastHeartbeat: data?.last_heartbeat,
        monitoredMint: data?.monitored_mint
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}