import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

// GET /api/user/profile - Get user profile data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')?.toLowerCase()
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { data: user, error } = await supabaseService
      .from('bullrhun_users')
      .select('id, username, display_name, avatar_url, bio, email, role, created_at, updated_at')
      .eq('wallet_address', walletAddress)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get user's default addresses
    const { data: addresses, error: addressesError } = await supabaseService
      .from('bullrhun_user_addresses')
      .select('id, type, is_default, first_name, last_name, company, address_line_1, address_line_2, city, state, zip_code, country, phone')
      .eq('user_wallet_address', walletAddress)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    return NextResponse.json({
      user,
      addresses: addresses || []
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const body = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { username, displayName, bio, email } = body

    // Validate input
    if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseService
      .from('bullrhun_users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user profile
    const updateData: any = { updated_at: new Date().toISOString() }
    if (username !== undefined) updateData.username = username
    if (displayName !== undefined) updateData.display_name = displayName
    if (bio !== undefined) updateData.bio = bio
    if (email !== undefined) updateData.email = email

    const { data: user, error } = await supabaseService
      .from('bullrhun_users')
      .update(updateData)
      .eq('wallet_address', walletAddress)
      .select('id, username, display_name, avatar_url, bio, email, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}