import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { customer_wallet_address, status } = await request.json();

    if (!customer_wallet_address) {
      return NextResponse.json(
        { error: 'Customer wallet address is required' },
        { status: 400 }
      );
    }

    // Fetch orders by wallet address and status
    let query = supabaseService
      .from('bullrhun_orders')
      .select('*')
      .eq('customer_wallet_address', customer_wallet_address.toLowerCase())
      .order('created_at', { ascending: false }); // Most recent first

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders by wallet:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Orders fetched successfully',
        orders: data || []
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Orders by wallet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}