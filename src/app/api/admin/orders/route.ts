import { NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'

export async function GET() {
  try {
    // For now, return empty array since we don't have getAllOrdersAdmin method
    // TODO: Implement getAllOrdersAdmin in orderService
    const orders: any[] = [] // Temporary empty array until admin method is implemented
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Admin Orders API Error:', error)
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to fetch orders',
      details: error 
    }, { status: 500 })
  }
}