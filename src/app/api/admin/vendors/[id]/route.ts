import { NextRequest, NextResponse } from 'next/server'
import { vendorService } from '@/services/vendor.service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorData = await request.json()
    const vendor = await vendorService.updateVendor(params.id, vendorData)
    return NextResponse.json({ vendor })
  } catch (error) {
    console.error('Admin Vendors API Error:', error)
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to update vendor',
      details: error 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await vendorService.deleteVendor(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin Vendors API Error:', error)
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to delete vendor',
      details: error 
    }, { status: 500 })
  }
}