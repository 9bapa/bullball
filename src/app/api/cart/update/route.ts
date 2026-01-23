import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export async function PUT(request: NextRequest) {
  try {
    const { cart_item_id, quantity } = await request.json()
    


    if (!cart_item_id || quantity === undefined || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

    // First get the cart item with product info (matching GET API approach)
    const { data: cartItem, error: cartError } = await supabaseService
      .from('bullrhun_cart')
      .select(`
        id,
        product_id,
        variant_id,
        quantity,
        user_wallet_address,
        created_at,
        updated_at,
        bullrhun_products!inner (
          id,
          name,
          description,
          base_price,
          cost_price,
          image_url,
          inventory_quantity,
          is_active
        )
      `)
      .eq('id', cart_item_id)
      .single()

    if (cartError) {
      console.error('Error fetching cart item:', cartError)
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Check stock availability
    const product = Array.isArray(cartItem.bullrhun_products) ? cartItem.bullrhun_products[0] : cartItem.bullrhun_products
    if (product && product.inventory_quantity !== null && product.inventory_quantity < quantity) {
      return NextResponse.json({ 
        error: `Insufficient stock. Only ${product.inventory_quantity} items available.` 
      }, { status: 400 })
    }

    // Update the cart item
    const { data, error } = await supabaseService
      .from('bullrhun_cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart_item_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cart item:', error)
      return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      cartItem: data 
    })

  } catch (error) {
    console.error('Error in update cart API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}