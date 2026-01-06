import { NextRequest, NextResponse } from 'next/server';
import { getBalance } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Balance check request:', body);
    
    const { paymentAddress, requiredAmount } = body;

    if (!paymentAddress || !requiredAmount) {
      console.error('Missing required fields:', { paymentAddress, requiredAmount });
      return NextResponse.json({ 
        error: 'Payment address and required amount are required',
        paymentAddress,
        requiredAmount
      }, { status: 400 });
    }

    // Get current balance of payment address
    const currentBalance = await getBalance(paymentAddress);

    const sufficient = currentBalance >= requiredAmount;

    return NextResponse.json({
      currentBalance,
      requiredAmount,
      sufficient,
      difference: currentBalance - requiredAmount
    });

  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}