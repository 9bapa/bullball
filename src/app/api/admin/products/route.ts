import { NextResponse } from 'next/server';
import { productService } from '@/services/product.service';

export async function GET() {
  try {
    const products = await productService.getAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin Products API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch products',
      details: error 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    const product = await productService.createProduct(productData);
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin Products API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create product',
      details: error 
    }, { status: 500 });
  }
}