import { NextRequest, NextResponse } from 'next/server'

interface TokenFormData {
  name: string
  symbol: string
  description: string
  twitter: string
  telegram: string
  image: string | null
  pumpportalWallet: string
  pumpportalApiKey: string
  payerPrivateKeyBase58: string
  initialLiquidity: string
  creatorFeeBps: string
  enableBullRuns: boolean
  bullRunFrequency: string
  traderRewardBps: string
  enableTraderRewards: boolean
}

interface TokenResponse {
  success: boolean
  tokenAddress?: string
  txSignature?: string
  error?: string
}

// Mock token storage
let createdTokens = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json() as TokenFormData
    
    // Simulate token creation
    const tokenAddress = `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 8)}`
    const txSignature = `3J8n9K2...7LmQ${Math.random().toString(36).substring(2, 8)}`
    
    const tokenResponse: TokenResponse = {
      success: true,
      tokenAddress,
      txSignature
    }

    // Store the created token
    createdTokens.push({
      address: tokenAddress,
      symbol: formData.symbol,
      name: formData.name,
      description: formData.description,
      twitter: formData.twitter,
      telegram: formData.telegram,
      image: formData.image,
      createdAt: new Date().toISOString(),
      creator: formData.payerPrivateKeyBase58,
      initialLiquidity: formData.initialLiquidity,
      creatorFeeBps: formData.creatorFeeBps,
      enableBullRuns: formData.enableBullRuns,
      bullRunFrequency: formData.bullRunFrequency,
      traderRewardBps: formData.traderRewardBps,
      enableTraderRewards: formData.enableTraderRewards
    })

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json(tokenResponse)
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create token'
    }, { status: 500 })
  }
}