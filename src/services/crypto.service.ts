// Crypto price service for SOL/USD conversion and balance fetching
export interface CryptoPrice {
  solana: {
    usd: number;
  };
}

export interface TokenBalance {
  address: string;
  balance: number;
  decimals: number;
  symbol: string;
  name: string;
}

export interface SPLTokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol: string;
  name: string;
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

  // Get SOL balance for a given address
  async getSOLBalance(address: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.devnet.solana.com`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Solana API error: ${response.status}`);
      }

      const data = await response.json();
      const lamports = data.result?.value || 0;
      
      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      return lamports / 1_000_000_000;
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  }

  // Get SPL token balances for a given address
  async getSPLTokenBalances(address: string): Promise<SPLTokenBalance[]> {
    try {
      const response = await fetch(
        `https://api.devnet.solana.com`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [
              address,
              {
                encoding: 'jsonParsed'
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Solana API error: ${response.status}`);
      }

      const data = await response.json();
      const tokenAccounts = data.result?.value || [];

      return tokenAccounts
        .filter((account: any) => account.account && account.account.data.parsed)
        .map((account: any) => {
          const parsedInfo = account.account.data.parsed.info;
          return {
            mint: parsedInfo.mint,
            balance: parsedInfo.tokenAmount.uiAmount || 0,
            decimals: parsedInfo.tokenAmount.decimals || 0,
            symbol: parsedInfo.tokenAmount.symbol || 'UNKNOWN',
            name: parsedInfo.tokenAmount.name || 'Unknown Token'
          };
        });
    } catch (error) {
      console.error('Error fetching SPL token balances:', error);
      return [];
    }
  }

  // Get comprehensive balance including SOL and all SPL tokens
  async getFullBalance(address: string): Promise<{
    solBalance: number;
    splTokens: SPLTokenBalance[];
  }> {
    const [solBalance, splTokens] = await Promise.all([
      this.getSOLBalance(address),
      this.getSPLTokenBalances(address)
    ]);

    return {
      solBalance,
      splTokens
    };
  }

  // Get short address format
  getShortAddress(address: string | null): string {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
}

export const cryptoService = new CryptoService();