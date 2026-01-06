import { NextRequest, NextResponse } from 'next/server';
import { ListenerRepository } from '@/repositories';
import { z } from 'zod';
import { supabaseService } from '@/lib/supabase';

const updateWinnerSchema = z.object({
  winnerAddress: z.string().min(32).max(44),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { winnerAddress } = updateWinnerSchema.parse(body);
    
    // Update last winner in database directly
    const updateData = {
      last_winner_address: winnerAddress,
      last_winner_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseService
      .from('bullrhun_listeners')
      .update(updateData)
      .eq('id', 1);

    if (error) {
      throw new Error('Failed to update last winner');
    }
    
    return NextResponse.json({
      success: true,
      winnerAddress,
      message: 'Last winner updated successfully'
    });

  } catch (error) {
    console.error('Update last winner error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update last winner',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}