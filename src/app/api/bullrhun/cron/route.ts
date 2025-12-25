import { NextRequest, NextResponse } from 'next/server';
import { getCronManager } from '@/services/cron.service';

const cronManager = getCronManager();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start':
        await cronManager.start();
        return NextResponse.json({
          message: 'Cron job started',
          status: cronManager.getStatus(),
        });

      case 'stop':
        await cronManager.stop();
        return NextResponse.json({
          message: 'Cron job stopped',
          status: cronManager.getStatus(),
        });

      case 'status':
        return NextResponse.json({
          status: cronManager.getStatus(),
        });
        
      case 'activities':
        const status = cronManager.getStatus();
        return NextResponse.json({
          activities: status.activities || [],
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: start, stop, status' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('POST /api/bullrhun/cron error:', error);
    return NextResponse.json(
      { error: 'Failed to control cron job' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      status: cronManager.getStatus(),
    });
  } catch (error) {
    console.error('GET /api/bullrhun/cron error:', error);
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    );
  }
}