import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ mint: string }> }) {
  try {
    const { mint } = await params;

    if (!mint) {
      return NextResponse.json(
        { error: 'Mint address is required' },
        { status: 400 }
      );
    }

    // Get token using service role
    const { data, error } = await supabaseService
      .from('bullrhun_tokens')
      .select('*')
      .eq('mint', mint)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Failed to get token:', error);
      return NextResponse.json(
        { error: 'Failed to get token', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Token retrieved successfully',
        token: data
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}