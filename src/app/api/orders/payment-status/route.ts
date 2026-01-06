import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order with related data using service role
    const { data: order, error } = await supabaseService
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_order_items (
          *,
          bullrhun_products (
            *,
            bullrhun_vendors (
              name,
              business_name
            )
          ),
          bullrhun_product_variants (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch order', details: error.message },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        ...order,
        items: order.bullrhun_order_items?.map((item: any) => ({
          ...item,
          product: item.bullrhun_products,
          variant: item.bullrhun_product_variants
        })) || []
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}