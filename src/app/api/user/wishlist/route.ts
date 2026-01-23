import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'

// GET /api/user/wishlist - Get wishlist items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Get wishlist items with product details and count
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: wishlistItems, error, count } = await supabaseService
      .from('bullrhun_wishlist')
      .select(`
        id,
        created_at,
        bullrhun_products (
          id,
          name,
          description,
          price,
          image_url,
          stock_quantity,
          is_active
        )
      `, { count: 'exact' })
      .eq('user_wallet_address', walletAddress)
      .eq('bullrhun_products.is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching wishlist:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform data to match expected format
    const items = (wishlistItems || []).map(item => ({
      id: item.id,
      added_date: item.created_at,
      product_id: item.bullrhun_products?.id,
      name: item.bullrhun_products?.name,
      description: item.bullrhun_products?.description,
      price: item.bullrhun_products?.price,
      image_url: item.bullrhun_products?.image_url,
      stock_quantity: item.bullrhun_products?.stock_quantity,
      is_active: item.bullrhun_products?.is_active
    }))

    return NextResponse.json({
      products: items,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const body = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { product_id } = body

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Check if product exists and is active
    const { data: product, error: productError } = await supabaseService
      .from('bullrhun_products')
      .select('id, name')
      .eq('id', product_id)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const { data: existing, error: existingError } = await supabaseService
      .from('bullrhun_wishlist')
      .select('id')
      .eq('user_wallet_address', walletAddress)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 409 })
    }

    // Add to wishlist
    const { data: wishlistItem, error } = await supabaseService
      .from('bullrhun_wishlist')
      .insert({
        user_wallet_address: walletAddress,
        product_id
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('Error adding to wishlist:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Added to wishlist successfully',
      wishlistItem: {
        id: wishlistItem.id,
        product_id: product_id,
        product_name: product.name,
        added_date: wishlistItem.created_at
      }
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}