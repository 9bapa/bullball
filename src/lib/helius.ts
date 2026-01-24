interface HeliusAssetResponse {
  result: {
    interface: string
    id: string
    content: {
      $schema: string
      json_uri: string
      files: Array<{
        uri: string
        cdn_uri: string
        mime: string
      }>
    }
    metadata: {
      description: string
      name: string
      symbol: string
      links?: {
        image: string
      }
    }
    token_info: {
      supply: number
      decimals: number
      token_program: string
    }
  }
}

export interface TokenMetadata {
  symbol: string
  name: string
  description: string
  image_url: string
  supply: number
  decimals: number
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY

export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  if (!HELIUS_API_KEY) {
    console.error('HELIUS_API_KEY not configured')
    return null
  }

  try {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getAsset',
        params: {
          id: mintAddress,
          options: {
            showUnverifiedCollections: false,
            showCollectionMetadata: false,
            showFungible: true,
            showInscription: false
          }
        }
      })
    }

    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, options)
    const data: HeliusAssetResponse = await response.json()

    if (!data.result) {
      console.error('No result from Helius API for mint:', mintAddress)
      return null
    }

    const result = data.result
    const content:any = result.content

    let imageUrl = ''
    if (content.files && content.files.length > 0) {
      imageUrl = content.files[0].uri
    } else if (content.metadata?.links?.image) {
      imageUrl = content.metadata.links.image
    }

    return {
      symbol: content.metadata.symbol || '',
      name: content.metadata.name || '',
      description: content.metadata.description || '',
      image_url: imageUrl,
      supply: result.token_info.supply || 0,
      decimals: result.token_info.decimals || 0
    }
  } catch (error) {
    console.error('Failed to fetch token metadata from Helius:', error)
    return null
  }
}
