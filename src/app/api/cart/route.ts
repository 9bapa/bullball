import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

// GET /api/cart - Get cart items for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Normalize wallet address to lowercase to match user creation
    const normalizedWalletAddress = walletAddress.toLowerCase()

    // Get user by wallet address
    const { data: user, error: userError } = await supabaseService
      .from('bullrhun_users')
      .select('id')
      .eq('wallet_address', normalizedWalletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get cart items with product details
    const { data: cartItems, error: cartError } = await supabaseService
      .from('bullrhun_cart')
      .select(`
        id,
        user_wallet_address,
        product_id,
        variant_id,
        quantity,
        created_at,
        updated_at,
        bullrhun_products (
          id,
          name,
          description,
          base_price,
          cost_price,
          image_url,
          inventory_quantity,
          is_active,
          vendor_id
        )
      `)
      .eq('user_wallet_address', normalizedWalletAddress)
      .order('created_at', { ascending: false })

    if (cartError) {
      console.error('Error fetching cart:', cartError)
      return NextResponse.json({ error: cartError.message || 'Database error' }, { status: 500 })
    }

    // Transform data to match expected format
    const items = (cartItems || []).map(item => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      added_date: item.created_at,
      name: item.bullrhun_products?.name,
      description: item.bullrhun_products?.description,
      price: item.bullrhun_products?.base_price,
      cost_price: item.bullrhun_products?.cost_price,
      vendor_id: item.bullrhun_products?.vendor_id,
      image_url: item.bullrhun_products?.image_url,
      stock_quantity: item.bullrhun_products?.inventory_quantity,
      is_active: item.bullrhun_products?.is_active
    }))

    return NextResponse.json({
      success: true,
      cartItems: items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const body = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Normalize wallet address to lowercase to match user creation
    const normalizedWalletAddress = walletAddress.toLowerCase()

    const { product_id, variant_id, quantity = 1 } = body

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID and quantity required' }, { status: 400 })
    }

    // Validate UUID format for product_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(product_id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 })
    }

    // Get user by wallet address
    const { data: user, error: userError } = await supabaseService
      .from('bullrhun_users')
      .select('id')
      .eq('wallet_address', normalizedWalletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if product exists and is active
    const { data: product, error: productError } = await supabaseService
      .from('bullrhun_products')
      .select('id, name, inventory_quantity, is_active')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found or not active' }, { status: 404 })
    }

    // Check stock
    if (product.inventory_quantity !== null && product.inventory_quantity < quantity) {
      return NextResponse.json({ 
        error: `Insufficient stock. Only ${product.inventory_quantity} items available.` 
      }, { status: 400 })
    }

    // Check if item already exists in cart
    const { data: existing, error: existingError } = await supabaseService
      .from('bullrhun_cart')
      .select('id, quantity')
      .eq('user_wallet_address', normalizedWalletAddress)
      .eq('product_id', product_id)
      .eq('variant_id', variant_id || null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing cart item:', existingError);
      return NextResponse.json({ error: existingError.message || 'Database error' }, { status: 500 })
    }

    if (existing) {
      // Update existing item
      const newQuantity = existing.quantity + quantity
      
      // Check stock again
      if (product.inventory_quantity !== null && product.inventory_quantity < newQuantity) {
        return NextResponse.json({ 
          error: `Insufficient stock. Only ${product.inventory_quantity} items available.` 
        }, { status: 400 })
      }

      const { error: updateError } = await supabaseService
        .from('bullrhun_cart')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .single()

      if (updateError) {
        console.error('Error updating cart item:', updateError);
        return NextResponse.json({ error: updateError.message || 'Database error' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Cart item updated successfully',
        cartItem: {
          id: existing.id,
          product_id: existing.product_id,
          variant_id: existing.variant_id,
          quantity: newQuantity
        }
      })
    } else {
      // Add new item
      const { data: cartItem, error: insertError } = await supabaseService
        .from('bullrhun_cart')
        .insert({
          user_wallet_address: normalizedWalletAddress,
          product_id,
          variant_id: variant_id || null,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, created_at')
        .single()

      if (insertError) {
        console.error('Error inserting cart item:', insertError);
        return NextResponse.json({ error: insertError.message || 'Database error' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Added to cart successfully',
        cartItem: {
          id: cartItem.id,
          product_id: cartItem.product_id,
          variant_id: cartItem.variant_id,
          quantity: cartItem.quantity
        }
      })
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const itemId = params.id

    if (!walletAddress || !itemId) {
      return NextResponse.json({ error: 'Wallet address and item ID required' }, { status: 400 })
    }

    // Normalize wallet address to lowercase to match user creation
    const normalizedWalletAddress = walletAddress.toLowerCase()

    // Get user by wallet address
    const { data: user, error: userError } = await supabaseService
      .from('bullrhun_users')
      .select('id')
      .eq('wallet_address', normalizedWalletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if item belongs to user
    const { data: existing, error: existingError } = await supabaseService
      .from('bullrhun_cart')
      .select('id')
      .eq('id', itemId)
      .eq('user_wallet_address', normalizedWalletAddress)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Remove from cart
    const { error: deleteError } = await supabaseService
      .from('bullrhun_cart')
      .delete()
      .eq('id', itemId)
      .eq('user_wallet_address', normalizedWalletAddress)

    if (deleteError) {
      console.error('Error deleting cart item:', deleteError);
      return NextResponse.json({ error: deleteError.message || 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from cart successfully'
    })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}