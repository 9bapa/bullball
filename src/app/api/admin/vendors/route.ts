import { NextResponse } from 'next/server';
import { vendorService } from '@/services/vendor.service';

export async function POST(request: Request) {
  try {
    const vendorData = await request.json();
    const vendor = await vendorService.createVendor(vendorData);
    return NextResponse.json({ vendor });
  } catch (error) {
    console.error('Admin Vendors API Error:', error);
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to create vendor',
      details: error 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const vendors = await vendorService.getAllVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Admin Vendors API Error:', error);
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to fetch vendors',
      details: error 
    }, { status: 500 });
  }
}