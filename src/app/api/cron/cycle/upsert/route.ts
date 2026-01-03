import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data, conflictColumns } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      );
    }

    // Upsert using service role
    const { result, error } = await supabaseService
      .from('bullrhun_cycles')
      .upsert(data, { 
        onConflict: conflictColumns && conflictColumns.length > 0 ? conflictColumns.join(',') : undefined 
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to upsert in bullrhun_cycles:', error);
      return NextResponse.json(
        { error: 'Failed to upsert cycle', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Cycle upserted successfully',
        data: result
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Cycle upsert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}