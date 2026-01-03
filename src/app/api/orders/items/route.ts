import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderItems } = await request.json();

    if (!orderItems || !Array.isArray(orderItems)) {
      return NextResponse.json(
        { error: 'Order items array is required' },
        { status: 400 }
      );
    }

    // Create order items using service role
    const { data, error } = await supabaseService
      .from('bullrhun_order_items')
      .insert(
        orderItems.map(item => ({
          ...item,
          created_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      console.error('Failed to create order items:', error);
      return NextResponse.json(
        { error: 'Failed to create order items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Order items created successfully',
        items: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}