import { NextRequest, NextResponse } from 'next/server'
import { getBalance } from '@/lib/solana'

export async function POST(request: NextRequest) {
  try {
    const { publicKey } = await request.json()

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 })
    }

    const balance = await getBalance(publicKey)

    return NextResponse.json({ balance })
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
