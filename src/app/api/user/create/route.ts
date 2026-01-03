import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { wallet_address } = await request.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseService
      .from('bullrhun_users')
      .select('id, username, role, avatar_url')
      .eq('wallet_address', wallet_address)
      .single()

    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser })
    }

    // Create new user with service role (bypasses RLS)
    const { data: newUser, error } = await supabaseService
      .from('bullrhun_users')
      .insert({
        wallet_address,
        role: 'customer',
      })
      .select('id, username, role, avatar_url')
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}