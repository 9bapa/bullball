import WebSocket from 'ws';
import { supabaseService } from '@/lib/supabase';
import { config } from '@/config';
import { TokenRepository } from '@/repositories';

interface TradeMessage {
  signature?: string;
  tx?: string;
  pool?: string;
  venue?: string;
  solAmount?: number;
  amount?: number;
  tokenAmount?: number;
  price?: number;
  buyer?: string;
  trader?: string;
  account?: string;
  wallet?: string;
}



class BullRhunTradeListener {
  private supabase: any; // Using supabaseService with service role
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private isRunning: boolean = false;
  private currentMint: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = supabaseService;
    this.currentMint = config.BULLRHUN_MINT || '';
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🎧 Trade listener already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting BullRhun trade listener');
    console.log(`🎯 Monitoring mint: ${this.currentMint}`);
    console.log(`🔗 WebSocket URL: ${this.getWebSocketUrl()}`);

    await this.resolveMonitoredMint();
    
    // Start periodic heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.updateHeartbeat();
    }, 60000); // Every minute
    
    this.connect();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('🛑 Trade listener stopped');
  }

  private async resolveMonitoredMint(): Promise<void> {
    try {
      // Use direct service role access instead of API call
      const { data, error } = await supabaseService
        .from('bullrhun_listeners')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        this.currentMint = config.BULLRHUN_MINT || '';
        console.warn('Failed to resolve monitored mint, using default:', error);
      } else {
        this.currentMint = data.monitored_mint || config.BULLRHUN_MINT || '';
        console.log(`📡 Resolved monitored mint: ${this.currentMint}`);
      }
    } catch (error) {
      console.error('Failed to resolve monitored mint:', error);
      this.currentMint = config.BULLRHUN_MINT || '';
    }
  }

  private getWebSocketUrl(): string {
    const apiKey = config.PUMPPORTAL_API_KEY;
    return apiKey 
      ? `wss://pumpportal.fun/api/data?api-key=${apiKey}`
      : 'wss://pumpportal.fun/api/data';
  }

  private connect(): void {
    if (!this.isRunning) return;

    try {
      console.log('🔌 Connecting to WebSocket...');
      this.ws = new WebSocket(this.getWebSocketUrl());

      this.ws.on('open', () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.subscribeToTrades();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', () => {
        console.log('❌ WebSocket disconnected');
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('🔥 WebSocket error:', error);
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private subscribeToTrades(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      method: 'subscribeTokenTrade',
      keys: [this.currentMint]
    };

    this.ws.send(JSON.stringify(payload));
    console.log(`📡 Subscribed to trades for mint: ${this.currentMint}`);
    this.updateHeartbeat();
  }

  private async handleMessage(data: WebSocket.Data): Promise<void> {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle different message types
      if (message.message) {
        // Subscription confirmation or status messages
        if (message.message.includes('Successfully subscribed')) {
          console.log('✅ Subscription confirmed:', message.message);
          return;
        }
        if (message.message.includes('errors')) {
          console.warn('⚠️ API Error:', message.message);
          return;
        }
        // Log other messages but don't process as trades
        console.log('ℹ️ Status message:', message.message);
        return;
      }

      if (message.errors) {
        // Error messages from API
        console.warn('⚠️ API Error:', message.errors);
        return;
      }

      // Try to extract trade information from remaining messages
      const tradeData = this.extractTradeData(message as TradeMessage);
      if (!tradeData) return;

      console.log(`📈 Trade received:`, {
        signature: tradeData.signature,
        venue: tradeData.venue,
        amountSol: tradeData.amountSol,
        amountTokens: tradeData.amountTokens,
        price: tradeData.price,
        trader: tradeData.trader,
      });

      // Record trade in database
      await this.recordTrade(tradeData);
      
      // Update listener status
      await this.updateListenerStatus({
        amountSol: tradeData.amountSol,
        traderAddress: tradeData.trader,
      });

    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  private extractTradeData(message: TradeMessage): {
    signature: string | null;
    venue: string | null;
    amountSol: number | null;
    amountTokens: number | null;
    price: number | null;
    trader: string | null;
  } | null {
    // Skip if message doesn't have trade-like fields
    if (!message || typeof message !== 'object') {
      return null;
    }

    

    const signature = message?.signature || message?.tx || null;
    const venue = message?.pool || message?.venue || null;
    const amountSol = typeof message?.solAmount === 'number' ? message.solAmount : 
                    (typeof message?.amount === 'number' ? message.amount : null);
    const amountTokens = typeof message?.tokenAmount === 'number' ? message.tokenAmount : null;
    const price = typeof message?.price === 'number' ? message.price : 
                  (amountSol && amountTokens ? amountSol / amountTokens : null);
    const trader = message?.buyer || message?.trader || message?.account || message?.wallet || null;

    // More flexible validation - allow messages with partial data
    if (!signature && !venue && !amountSol && !amountTokens) {
      // This is likely a status/error message, not a trade
      return null;
    }

    // Log validation issues but don't fail completely
    if (!signature) {
      console.warn('⚠️ Trade missing signature, but processing anyway:', message);
    }
    if (!venue) {
      console.warn('⚠️ Trade missing venue, but processing anyway:', message);
    }

    return {
      signature,
      venue,
      amountSol,
      amountTokens,
      price,
      trader,
    };
  }

  private async recordTrade(tradeData: {
    signature: string | null;
    venue: string | null;
    amountSol: number | null;
    amountTokens: number | null;
    price: number | null;
    trader: string | null;
  }): Promise<void> {
    if (!tradeData.signature || !tradeData.venue) return;

    try {
      // Record trade via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bullrhun/trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          mint: this.currentMint,
          signature: tradeData.signature,
          venue: tradeData.venue,
          amountSol: tradeData.amountSol,
          amountTokens: tradeData.amountTokens,
          traderAddress: tradeData.trader,
        }),
      });

      if (response.ok) {
        console.log(`✅ Trade recorded: ${tradeData.signature}`);
        
        // Update token price and trade data if we have price data
        if (tradeData.price !== null) {
          await this.updateTokenWithTradeData(tradeData);
        }
      } else {
        console.error(`❌ Failed to record trade: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Failed to record trade:', error);
    }
  }

  private async updateListenerStatus(tradeData: {
    amountSol: number | null;
    traderAddress: string | null;
  }): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bullrhun/listener/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'handle_trade',
          amountSol: tradeData.amountSol || 0,
          traderAddress: tradeData.traderAddress || 'unknown',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.thresholdMet) {
          console.log(`🎉 Trade threshold met! New threshold: ${result.newThreshold}`);
        }
      }

    } catch (error) {
      console.error('Failed to update listener status:', error);
    }
  }

  private async updateHeartbeat(): Promise<void> {
    try {
      // Use direct service role access instead of API call
      const { data, error } = await supabaseService
        .from('bullrhun_listeners')
        .update({ 
          last_heartbeat: new Date().toISOString(),
          monitored_mint: this.currentMint 
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update heartbeat:', error);
      } else {
        console.log(`💓 Heartbeat updated: ${this.currentMint}`);
      }
    } catch (error) {
      console.error('Failed to update heartbeat:', error);
    }
  }

  private scheduleReconnect(): void {
    if (!this.isRunning) return;

    this.reconnectAttempts++;
    const delay = Math.min(30000, 1000 * this.reconnectAttempts);
    
    console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private async updateTokenWithTradeData(tradeData: {
    price: number | null;
    amountTokens: number | null;
    amountSol: number | null;
  }): Promise<void> {
    try {
      const tokenRepository = new TokenRepository();
      
      // Calculate market cap using token supply of 1 billion
      const marketCap = tradeData.price ? 
        tradeData.price * 1000000000 : // 1 billion tokens * price
        undefined;
      
      await tokenRepository.updateTokenWithTrade(this.currentMint, {
        price: tradeData.price || 0,
        amountTokens: tradeData.amountTokens || 0,
        amountSol: tradeData.amountSol || 0,
        marketCap: marketCap,
        volume24h: tradeData.amountSol || 0 // Use SOL amount as volume indicator
      });
      
      console.log(`💰 Updated token ${this.currentMint} with trade data: price=${tradeData.price}, tokens=${tradeData.amountTokens}, SOL=${tradeData.amountSol}`);
    } catch (error) {
      console.error('Failed to update token with trade data:', error);
    }
  }

  // Public methods for external control
  async changeMonitoredMint(mint: string): Promise<void> {
    this.currentMint = mint;
    console.log(`🔄 Changing monitored mint to: ${mint}`);
    
    // Update database
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bullrhun/listener/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'update_mint',
          mint,
        }),
      });

      if (response.ok) {
        console.log(`✅ Monitored mint updated to: ${mint}`);
        
        // Reconnect with new mint
        if (this.ws) {
          this.ws.close();
        }
        this.connect();
      }
    } catch (error) {
      console.error('Failed to change monitored mint:', error);
    }
  }

  getStatus(): {
    isRunning: boolean;
    currentMint: string;
    reconnectAttempts: number;
    connected: boolean;
  } {
    return {
      isRunning: this.isRunning,
      currentMint: this.currentMint,
      reconnectAttempts: this.reconnectAttempts,
      connected: this.ws?.readyState === WebSocket.OPEN,
    };
  }
}

// Singleton instance
let tradeListener: BullRhunTradeListener | null = null;

export function getTradeListener(): BullRhunTradeListener {
  if (!tradeListener) {
    tradeListener = new BullRhunTradeListener();
    // Auto-start listener when first created
    tradeListener.start().catch(error => {
      console.error('Failed to auto-start trade listener:', error);
    });
  }
  return tradeListener;
}

// Start listener if this file is run directly
if (require.main === module) {
  const listener = getTradeListener();
  
  listener.start().catch(console.error);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\n🛑 Shutting down trade listener...');
    await listener.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\\n🛑 Shutting down trade listener...');
    await listener.stop();
    process.exit(0);
  });
}

export { BullRhunTradeListener };