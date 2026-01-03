// Crypto price service for SOL/USD conversion
export interface CryptoPrice {
  solana: {
    usd: number;
  };
}

export interface ConversionResult {
  usdAmount: number;
  solAmount: number;
  exchangeRate: number;
}

class CryptoService {
  private cache = new Map<string, { price: number; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  async getSOLPrice(): Promise<number> {
    const cacheKey = 'SOL_USD';
    const cached = this.cache.get(cacheKey);
    
    // Return cached price if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CryptoPrice = await response.json();
      const price = data.solana.usd;

      // Cache the price
      this.cache.set(cacheKey, { price, timestamp: Date.now() });
      
      return price;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      
      // Return cached price even if expired as fallback
      if (cached) {
        return cached.price;
      }
      
      // Default fallback price
      return 150; // Default SOL price in USD
    }
  }

  async convertUSDToSOL(usdAmount: number): Promise<ConversionResult> {
    const solPrice = await this.getSOLPrice();
    const solAmount = usdAmount / solPrice;
    
    // Round to 9 decimal places (SOL precision)
    const roundedSolAmount = Math.round(solAmount * 1e9) / 1e9;
    
    return {
      usdAmount,
      solAmount: roundedSolAmount,
      exchangeRate: solPrice
    };
  }

  async convertSOLToUSD(solAmount: number): Promise<ConversionResult> {
    const solPrice = await this.getSOLPrice();
    const usdAmount = solAmount * solPrice;
    
    return {
      usdAmount,
      solAmount,
      exchangeRate: solPrice
    };
  }

  formatSOLAmount(amount: number): string {
    return `${amount.toFixed(9)} SOL`;
  }

  formatUSDAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

export const cryptoService = new CryptoService();