import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'User-Agent': 'BullRhun/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Cache for 2 minutes
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
      }
    })
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    
    // Return fallback price if API fails
    return NextResponse.json({ 
      solana: { usd: 128.17 } // fallback price
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60'
      }
    })
  }
}