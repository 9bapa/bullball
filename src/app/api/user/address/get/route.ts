import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { user_wallet_address, type } = await request.json();

    if (!user_wallet_address || !type) {
      return NextResponse.json(
        { error: 'User wallet address and type are required' },
        { status: 400 }
      );
    }

    // Fetch user address
    const { data: address, error: fetchError } = await supabaseService
      .from('bullrhun_user_addresses')
      .select('*')
      .eq('user_wallet_address', user_wallet_address.toLowerCase())
      .eq('type', type)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user address:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user address' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        address: address || null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('User address get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}