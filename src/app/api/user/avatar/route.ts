import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

// PUT /api/user/avatar - Update user avatar
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const body = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { avatarUrl } = body

    if (!avatarUrl) {
      return NextResponse.json({ error: 'Avatar URL required' }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: checkError } = await supabaseService
      .from('bullrhun_users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (checkError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update avatar
    const { data: updatedUser, error } = await supabaseService
      .from('bullrhun_users')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select('id, username, avatar_url, updated_at')
      .single()

    if (error) {
      console.error('Error updating avatar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Avatar updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}