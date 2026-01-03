import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseService } from '@/lib/supabase'

const supabaseClient = supabase!;

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ isAdmin: false }, { status: 400 })
    }

    console.log('🔍 API: Checking wallet address:', address)
    
    // Check if user exists using service client (bypasses RLS)
    const { data: userData, error } = await supabaseService
      .from('bullrhun_users')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single()

    console.log('🔍 API: User check result:', { userData, error })

    if (error && error.code !== 'PGRST116') {
      console.error('❌ API: Error checking user:', error)
      return NextResponse.json({ isAdmin: false }, { status: 500 })
    }

    if (!userData) {
      console.log('🆕 API: Creating new user for wallet:', address)
      
      // Create user if doesn't exist
      const userDataToInsert = {
        wallet_address: address.toLowerCase(),
        email: `${address.toLowerCase()}@solana.wallet`,
        role: 'customer',
        username: `sol_${address.toLowerCase().slice(0, 8)}`,
        is_active: true,
        email_verified: false,
        auth_provider: 'wallet'
      }
      
      console.log('📝 API: User data to insert:', userDataToInsert)
      
      const { data: newUser, error: createError } = await supabaseService
        .from('bullrhun_users')
        .insert(userDataToInsert)
        .select()
        .single()

      console.log('🆕 API: User creation result:', { newUser, createError })

      if (createError) {
        console.error('❌ API: Error creating user:', createError)
        return NextResponse.json({ isAdmin: false }, { status: 500 })
      }

      console.log('✅ API: New user created successfully:', address)
      return NextResponse.json({ isAdmin: false }) // New users are not admin
    }

    console.log('✅ API: Existing user found:', userData)
    const isAdmin = userData.role === 'admin' || userData.role === 'super_admin'

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}