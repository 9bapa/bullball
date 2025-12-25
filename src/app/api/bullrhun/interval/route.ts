import { NextRequest, NextResponse } from 'next/server';
import { getIntervalService } from '@/services/interval.service';

const intervalService = getIntervalService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start':
        await intervalService.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Interval service started',
          interval: await intervalService.getStatus()
        });

      case 'stop':
        await intervalService.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Interval service stopped',
          interval: await intervalService.getStatus()
        });

      case 'status':
        const status = await intervalService.getStatus();
        return NextResponse.json({
          success: true,
          interval: status
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Interval API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = await intervalService.getStatus();
    
    // Get current leader and activities from global state
    const isLeader = await status.isLeader();
    const activities = (global as any).activities || [];
    
    return NextResponse.json({
      interval: {
        ...status,
        isLeader,
        executionCount: activities.filter((a: any) => a.type === 'success').length
      },
      activities
    });
  } catch (error) {
    console.error('Failed to get interval status:', error);
    return NextResponse.json(
      { error: 'Failed to get interval status' },
      { status: 500 }
    );
  }
}