import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, email } = await request.json();

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseService
      .from('bullrhun_users')
      .select('id')
      .eq('wallet_address', wallet_address)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user email
    const { data: updatedUser, error: updateError } = await supabaseService
      .from('bullrhun_users')
      .update({
        email: email,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'User updated successfully',
        user: updatedUser
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}