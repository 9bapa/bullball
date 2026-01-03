import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productData = await request.json()
    const product = await productService.updateProduct(params.id, productData)
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin Products API Error:', error)
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to update product',
      details: error 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await productService.deleteProduct(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin Products API Error:', error)
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to delete product',
      details: error 
    }, { status: 500 })
  }
}