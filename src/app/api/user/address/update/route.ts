import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      user_wallet_address,
      type,
      first_name,
      last_name,
      company,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_code,
      country,
      phone,
      notes
    } = await request.json();

    if (!user_wallet_address || !type) {
      return NextResponse.json(
        { error: 'User wallet address and type are required' },
        { status: 400 }
      );
    }

    // Find existing address
    const { data: existingAddress, error: fetchError } = await supabaseService
      .from('bullrhun_user_addresses')
      .select('id')
      .eq('user_wallet_address', user_wallet_address.toLowerCase())
      .eq('type', type)
      .single();

    if (fetchError) {
      console.error('Error fetching user address:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user address' },
        { status: 500 }
      );
    }

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Update user address
    const { data: address, error: updateError } = await supabaseService
      .from('bullrhun_user_addresses')
      .update({
        first_name: first_name,
        last_name: last_name,
        company: company || null,
        address_line_1: address_line_1,
        address_line_2: address_line_2 || null,
        city: city,
        state: state || null,
        zip_code: zip_code,
        country: country,
        phone: phone || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAddress.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user address:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user address' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'User address updated successfully',
        address: address
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('User address update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}