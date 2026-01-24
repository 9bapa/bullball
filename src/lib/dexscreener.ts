export interface DexPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  labels: string[]
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  txns: {
    [key: string]: {
      buys: number
      sells: number
    }
  }
  volume: {
    [key: string]: number
  }
  priceChange: {
    [key: string]: number
  }
  liquidity: {
    usd: number
    base: number
    quote: number
  }
  fdv: number
  marketCap: number
  pairCreatedAt: number
  info: {
    imageUrl: string
    websites: Array<{
      url: string
    }>
    socials: Array<{
      platform: string
      handle: string
    }>
  }
  boosts: {
    active: number
  }
}

export interface DexPairsResponse {
  schemaVersion: string
  pairs: DexPair[]
}

export async function getDexPairs(tokenAddress: string): Promise<DexPair[]> {
  try {
    const url = `https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`
    console.log(`Fetching DexScreener pairs for token: ${tokenAddress}`)
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`DexScreener API error for ${tokenAddress}: ${response.statusText}`)
      throw new Error(`DexScreener API error: ${response.statusText}`)
    }
    const data: DexPair[] = await response.json()
    console.log(`DexScreener returned ${data.length} pairs for ${tokenAddress}`)
    return data
  } catch (error) {
    console.error('Failed to fetch DexScreener pairs:', error)
    throw error
  }
}

export async function getDexPairPrice(pairId: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairId}`)
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.statusText}`)
    }
    const data = await response.json()
    return data.pairs || []
  } catch (error) {
    console.error('Failed to fetch DexScreener pair price:', error)
    throw error
  }
}

export async function getBestPair(tokenAddress: string): Promise<DexPair | null> {
  try {
    const pairs = await getDexPairs(tokenAddress)
    if (pairs.length === 0) {
      console.warn(`No pairs found for token: ${tokenAddress}`)
      return null
    }
    
    const sortedPairs = pairs.sort((a, b) => {
      const aLiquidity = a.liquidity?.usd || 0
      const bLiquidity = b.liquidity?.usd || 0
      return bLiquidity - aLiquidity
    })
    
    const bestPair = sortedPairs[0]
    console.log(`Best pair for ${tokenAddress}:`, {
      pairAddress: bestPair.pairAddress,
      liquidity: bestPair.liquidity?.usd,
      priceUsd: bestPair.priceUsd,
      baseToken: bestPair.baseToken.symbol,
      quoteToken: bestPair.quoteToken.symbol
    })
    
    return bestPair
  } catch (error) {
    console.error('Failed to get best pair:', error)
    return null
  }
}

export function calculateEstimatedOutput(
  inputAmount: number,
  inputPriceUsd: number,
  outputPriceUsd: number,
  slippagePercent: number = 0.5
): number {
  if (inputPriceUsd <= 0 || outputPriceUsd <= 0) return 0
  
  const inputValueUsd = inputAmount * inputPriceUsd
  const estimatedOutputValueUsd = inputValueUsd / outputPriceUsd
  
  const slippageFactor = 1 - (slippagePercent / 100)
  const minOutput = estimatedOutputValueUsd * slippageFactor
  
  return minOutput
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num === 0) return '0'
  if (num < 0.0001) return num.toExponential(2)
  return num.toFixed(decimals)
}

export function formatCurrency(num: number | undefined | null): string {
  if (!num || num === 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatLargeNumber(num: number | undefined | null): string {
  if (!num || num === 0) return '$0.00'
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}