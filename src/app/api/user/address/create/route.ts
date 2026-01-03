import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      user_wallet_address,
      type,
      is_default,
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

    if (!user_wallet_address || !type || !first_name || !last_name || !address_line_1 || !city || !zip_code || !country) {
      return NextResponse.json(
        { error: 'Required address fields are missing' },
        { status: 400 }
      );
    }

    // Create user address
    const { data: address, error: insertError } = await supabaseService
      .from('bullrhun_user_addresses')
      .insert({
        user_wallet_address: user_wallet_address.toLowerCase(),
        type: type,
        is_default: is_default || false,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user address:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user address' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'User address created successfully',
        address: address
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('User address creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}