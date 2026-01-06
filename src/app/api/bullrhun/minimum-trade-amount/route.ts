import { NextRequest, NextResponse } from 'next/server';
import { ListenerRepository } from '@/repositories';
import { z } from 'zod';

const updateAmountSchema = z.object({
  amount: z.number().min(0.001).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { amount } = updateAmountSchema.parse(body);
    
    // Update minimum trade amount in database
    const listenerRepository = new ListenerRepository();
    await listenerRepository.updateTradeGoal(amount);
    
    return NextResponse.json({
      success: true,
      minimumTradeAmount: amount,
      message: 'Minimum trade amount updated successfully'
    });

  } catch (error) {
    console.error('Update minimum trade amount error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update minimum trade amount',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}