import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

// GET /api/user/addresses - Get user addresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { data: addresses, error } = await supabaseService
      .from('bullrhun_user_addresses')
      .select(`
        id, type, is_default, first_name, last_name, company, 
        address_line_1, address_line_2, city, state, zip_code, country, phone,
        created_at, updated_at
      `)
      .eq('user_wallet_address', walletAddress)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      addresses: addresses || []
    })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/addresses - Add new address
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const body = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { 
      type, isDefault, firstName, lastName, company, 
      addressLine1, addressLine2, city, state, zipCode, country, phone 
    } = body

    // Validate required fields
    if (!type || !firstName || !lastName || !addressLine1 || !city || !zipCode || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['billing', 'shipping'].includes(type)) {
      return NextResponse.json({ error: 'Invalid address type' }, { status: 400 })
    }

    // If this is set as default, unset other default addresses of same type
    if (isDefault) {
      const { error: updateError } = await supabaseService
        .from('bullrhun_user_addresses')
        .update({ is_default: false })
        .eq('user_wallet_address', walletAddress)
        .eq('type', type)

      if (updateError) {
        console.error('Error updating default addresses:', updateError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    }

    // Insert new address
    const { data: address, error } = await supabaseService
      .from('bullrhun_user_addresses')
      .insert({
        user_wallet_address: walletAddress,
        type,
        is_default: isDefault,
        first_name: firstName,
        last_name: lastName,
        company,
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        city,
        state,
        zip_code: zipCode,
        country,
        phone
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      address
    })
  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}