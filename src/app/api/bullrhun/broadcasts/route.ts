import { NextResponse } from 'next/server';
import { BroadcastRepository } from '@/repositories/broadcast.repository';

const broadcastRepo = new BroadcastRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const broadcast = await broadcastRepo.createBroadcast({
      message_content: body.message_content,
      message_type: body.message_type,
      metadata: body.metadata || {},
      related_cycle_id: body.related_cycle_id || null
    });
    
    return NextResponse.json({
      success: true,
      data: broadcast
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create broadcast' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'step_update' | 'winner_announcement' | 'goal_reset' | 'liquidity_added' | 'reward_distributed' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let broadcasts;
    
    if (type) {
      broadcasts = await broadcastRepo.getBroadcastsByType(type, limit);
    } else {
      broadcasts = await broadcastRepo.getRecentBroadcasts(limit);
    }
    
    return NextResponse.json({
      success: true,
      data: broadcasts,
      count: broadcasts.length,
      type: type || 'all'
    });
  } catch (error) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch broadcasts' 
      },
      { status: 500 }
    );
  }
}