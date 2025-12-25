import { 
  CycleRepository, 
  TradeRepository, 
  RewardRepository,
  LiquidityRepository,
  MetricsRepository,
  ListenerRepository 
} from '@/repositories';
import { 
  collectCreatorFee, 
  buyToken, 
  transferSol, 
  transferRewardSol,
  transferToken,
  getTokenBalance,
  getBalance,
  depositAndBurnLp,
  getConnection,
  getSigner 
} from '@/lib/solana';
import { config, FEATURES } from '@/config';
import { 
  BullrhunError, 
  CycleExecutionResult, 
  CycleStatus,
  BullrhunCycle,
  ExternalServiceError 
} from '@/types/bullrhun.types';
import { supabase } from '@/lib/supabase';

export class CycleService {
  private cycleRepo = new CycleRepository();
  private tradeRepo = new TradeRepository();
  private rewardRepo = new RewardRepository();
  private liquidityRepo = new LiquidityRepository();
  private metricsRepo = new MetricsRepository();
  private listenerRepo = new ListenerRepository();

  // Fetch SOL price from CoinGecko API
  private async fetchSolPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      if (response.ok) {
        const data = await response.json();
        const price = data.solana?.usd || 0;
        console.log('Fetched SOL price from CoinGecko:', price);
        return price;
      }
    } catch (error) {
      console.error('Failed to fetch SOL price from CoinGecko:', error);
    }
    return 0;
  }

  async executeCycle(mint?: string): Promise<CycleExecutionResult> {
    const targetMint = mint || config.BULLRHUN_MINT;
    
    if (!targetMint) {
      throw new BullrhunError('No mint specified for cycle execution', 'NO_MINT', 400);
    }

    // Create cycle record
    const cycle = await this.cycleRepo.createCycle({
      mint: targetMint,
    });

    console.log(`Starting cycle ${cycle.id} for mint ${targetMint}`);

    try {
      // Step 0: Initialize - Check wallet balance and conditionally claim fees
      const initResult = await this.initializeCycle(cycle);
      if (!initResult.shouldProceed) {
        console.warn(`⚠️ Cycle initialization failed: ${initResult.error || 'Unknown error'}`);
        const failedCycle = await this.cycleRepo.updateCycleStatus(
          cycle.id,
          CycleStatus.FAILED,
          {
            error_message: initResult.error || 'Cycle initialization failed',
          }
        );
        return {
          cycle: failedCycle,
          feeSignature: undefined,
          buySignature: undefined,
          liquiditySignature: undefined,
          rewardSignature: undefined,
          error: initResult.error || 'Cycle initialization failed',
        };
      }

      // Step 1: Collect creator fees (only if balance is sufficient)
      const feeResult = await this.collectCreatorFees(cycle);
      if (!feeResult.success) {
        throw new ExternalServiceError(feeResult.error || 'Fee collection failed', 'PUMPPORTAL');
      }

      // Step 2: Calculate fees from BALANCE (not from fee amount)
      const balanceAmount = initResult.balanceSol || 0; // Use wallet balance
      const platformFee = balanceAmount * 0.12; // 12% of BALANCE
      const rewardFee = balanceAmount * 0.10; // 10% of BALANCE
      const tokenAmount = balanceAmount - platformFee - rewardFee; // Remaining for tokens
      
      console.log(`💰 Fee Distribution from ${balanceAmount} SOL balance:`);
      console.log(`   Platform fee: ${platformFee} SOL (12%)`);
      console.log(`   Reward fee: ${rewardFee} SOL (10%)`);
      console.log(`   Token buying: ${tokenAmount} SOL (${((tokenAmount / balanceAmount) * 100).toFixed(1)}%)`);
      
      // Step 3: Execute buy with token amount
      const buyResult = await this.executeBuy(cycle.id, targetMint, tokenAmount);
      
      // Check if buy was successful before proceeding with fee transfers
      if (!buyResult.success) {
        throw new ExternalServiceError(buyResult.error || 'Token purchase failed', 'PUMPPORTAL');
      }
      
      // Step 4: Handle platform fees AFTER successful token purchase (non-blocking)
      // Calculate total for platformFees function
      const platformFeeResult = await this.handlePlatformFees(cycle.id, platformFee, rewardFee);
      
      // Step 5: Handle token transfer if not graduated
      if (buyResult.signature) {
        await this.handleTokenTransfer(targetMint, buyResult.signature);
      }

      // Step 6: Handle liquidity if enabled
      const liquidityResult = await this.handleLiquidity(cycle.id, targetMint, buyResult.liquidityAmount);

      // Step 7: Handle rewards
      const rewardResult = await this.handleRewards(cycle.id);

      // Step 8: Update cycle as completed
      const completedCycle = await this.cycleRepo.updateCycleStatus(
        cycle.id,
        CycleStatus.COMPLETED,
        {
          fee_signature: feeResult.signature?.signature || feeResult.signature,
          fee_amount_sol: feeResult.amount,
          buy_signature: buyResult.signature,
          buy_amount_sol: buyResult.amount,
          liquidity_signature: liquidityResult.depositSignature,
          reward_signature: rewardResult.signature,
        }
      );

      // Step 9: Update metrics
      await this.updateMetrics(completedCycle);

      console.log(`Cycle ${cycle.id} completed successfully`);

      return {
        cycle: completedCycle,
        feeSignature: feeResult.signature,
        buySignature: buyResult.signature,
        liquiditySignature: liquidityResult.depositSignature,
        rewardSignature: rewardResult.signature,
      };

    } catch (error) {
      // Mark cycle as failed
      const failedCycle = await this.cycleRepo.updateCycleStatus(
        cycle.id,
        CycleStatus.FAILED,
        {
          error_message: error instanceof Error ? error.message : 'Unknown error',
        },
        error instanceof Error ? error.message : 'Unknown error'
      );

      console.error(`Cycle ${cycle.id} failed:`, error);

      return {
        cycle: failedCycle,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async initializeCycle(cycle: BullrhunCycle): Promise<{
    shouldProceed: boolean;
    error?: string;
    balanceSol?: number;
  }> {
    try {
      console.log('💰 Step 0: Checking wallet balance for initialization...');
      
      // Get current wallet balance
      const connection = getConnection();
      const signer = getSigner();
      const balance = await connection.getBalance(signer.publicKey);
      const balanceSol = balance / 1e9;
      
      console.log(`💳 Current wallet balance: ${balanceSol} SOL`);
      
      // Check if balance is sufficient for fee collection and operations
      const MIN_BALANCE_FOR_FEES = 0.02; // 0.02 SOL minimum (10% = 0.002 SOL fee)
      
      if (balanceSol < MIN_BALANCE_FOR_FEES) {
        const message = `Balance ${balanceSol} SOL below minimum ${MIN_BALANCE_FOR_FEES} SOL. Skipping fee collection and cycle execution.`;
        console.warn(`⚠️ ${message}`);
        
        return {
          shouldProceed: false,
          error: message,
          balanceSol
        };
      }
      
      console.log(`✅ Balance sufficient (${balanceSol} SOL >= ${MIN_BALANCE_FOR_FEES} SOL). Proceeding with fee collection...`);
      
      return {
        shouldProceed: true,
        balanceSol
      };
      
    } catch (error) {
      const message = `Balance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${message}`);
      
      return {
        shouldProceed: false,
        error: message
      };
    }
  }

  private async collectCreatorFees(cycle: BullrhunCycle): Promise<{
    success: boolean;
    signature?: any;
    amount?: number;
    error?: string;
  }> {
    try {
      // Get current wallet balance and calculate 10% as fee
      const connection = getConnection();
      const signer = getSigner();
      const balance = await connection.getBalance(signer.publicKey);
      const balanceSol = balance / 1e9;
      
      // Calculate 10% of current wallet balance as fee amount
      const feeAmount = Math.max(0.001, balanceSol * 0.10); // Minimum 0.001 SOL
      
      console.log(`💰 Collecting ${feeAmount} SOL fee (${((feeAmount / balanceSol) * 100).toFixed(1)}% of wallet balance)`);
      
      const signature = await collectCreatorFee(cycle.mint, feeAmount);
      return { success: true, signature, amount: feeAmount };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Fee collection failed' 
      };
    }
  }

  private async handlePlatformFees(
    cycleId: string, 
    platformFee: number,
    rewardFee: number,
  ): Promise<{
    platformFee: number;
    rewardFee: number;
    remainingAmount: number;
  }> {

    if (platformFee > 0 && config.WALLET_PLATFORM) {
      try {
        await transferSol(config.WALLET_PLATFORM!, platformFee);
        console.log(`Platform fee of ${platformFee} SOL transferred`);
      } catch (error) {
        console.error('Platform fee transfer failed:', error instanceof Error ? error.message : error);
        // Continue cycle even if platform transfer fails
      }
    }

    if (rewardFee > 0 && config.WALLET_REWARD) {
      try {
        await transferSol(config.WALLET_REWARD!, rewardFee);
        console.log(`Reward fee of ${rewardFee} SOL transferred`);
      } catch (error) {
        console.error('Reward fee transfer failed:', error instanceof Error ? error.message : error);
        // Continue cycle even if reward transfer fails
      }
    }

    return { platformFee, rewardFee, remainingAmount: 0 };
  }

  private async executeBuy(
    cycleId: string,
    mint: string,
    availableAmount: number
  ): Promise<{
    success: boolean;
    signature?: string;
    amount?: number;
    liquidityAmount: number;
    error?: string;
  }> {
    const buyAmount = Math.max(0, availableAmount - 0.006); // Reserve 0.001 SOL for fees
    let liquidityAmount = 0;

    if (buyAmount < config.MIN_BUY_AMOUNT_SOL) {
      return { 
        success: false, 
        liquidityAmount: 0,
        error: `Amount ${buyAmount} SOL below minimum ${config.MIN_BUY_AMOUNT_SOL} SOL` 
      };
    }

    // Check if token is graduated
    const tokenStatus = await this.getTokenStatus(mint);
    if (tokenStatus?.is_graduated) {
      // Split 50/50 for graduated tokens
      liquidityAmount = buyAmount / 2;
    }

    try {
      const result = await buyToken(mint, buyAmount - liquidityAmount);

      // Record trade
      await this.tradeRepo.createTrade({
        mint,
        signature: result.signature!,
        venue: result.venue,
        amount_sol: buyAmount - liquidityAmount,
        is_system_buy: true,
        cycle_id: cycleId,
      });

      return {
        success: true,
        signature: result.signature,
        amount: buyAmount - liquidityAmount,
        liquidityAmount,
      };

    } catch (error) {
      return {
        success: false,
        liquidityAmount,
        error: error instanceof Error ? error.message : 'Buy failed',
      };
    }
  }

  private async handleTokenTransfer(mint: string, buySignature: string): Promise<void> {
     const isGraduated = await this.getTokenStatus(mint);
     if (isGraduated?.is_graduated) {
      return; // Skip transfer for graduated tokens
     }

    try {
      const tokenBalance = await getTokenBalance(mint, config.WALLET_DEV as string);
      if (tokenBalance > 0) {
        await transferToken(config.WALLET_PLATFORM!, mint, tokenBalance);
        console.log(`Transferred ${tokenBalance} tokens to platform wallet`);
      }
    } catch (error) {
      console.error('Token transfer failed:', error);
    }
  }

  private async handleLiquidity(
    cycleId: string,
    mint: string,
    liquidityAmount: number
  ): Promise<{
    success: boolean;
    depositSignature?: string;
    burnSignature?: string;
    error?: string;
  }> {
    if (!FEATURES.LIQUIDITY_ENABLED || liquidityAmount < 0.001) {
      return { success: true }; // Skipped
    }

    try {
      const result:any = await depositAndBurnLp(mint, liquidityAmount);

      // Record liquidity event
      await this.liquidityRepo.createLiquidityEvent({
        cycle_id: cycleId,
        mint,
        pool_key: config.PUMPSWAP_POOL!,
        deposit_amount_sol: liquidityAmount,
        deposit_signature: result.depositSig,
        burn_amount_tokens: Number(result.burnSig ? result.base : 0),
        burn_signature: result.burnSig,
      });

      return {
        success: true,
        depositSignature: result.depositSig,
        burnSignature: result.burnSig,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Liquidity operation failed',
      };
    }
  }

  private async handleRewards(cycleId: string): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    if (!FEATURES.REWARDS_ENABLED) {
      return { success: true }; // Skipped
    }

    try {
      const rewardBalance = await getBalance(config.WALLET_REWARD!);
      if (rewardBalance <= 0) {
        return { success: true }; // No rewards to distribute
      }

      // Check trade threshold
      const listener = await this.listenerRepo.getListenerStatus();
      if (!listener || listener.current_trade_count < listener.current_trade_threshold) {
        return { success: true }; // Threshold not met
      }

      // Get last qualifying trader
      const lastTrader = await this.tradeRepo.findLastQualifyingTrader(config.MIN_GIFT_TRADE_AMOUNT);
      if (!lastTrader) {
        console.log('No qualifying trader found for reward');
        return { success: true };
      }

      // Send reward
      const signature = await transferRewardSol(
        lastTrader.trader_address,
        rewardBalance
      );

      // Record reward
      await this.rewardRepo.createReward({
        cycle_id: cycleId,
        to_address: lastTrader.trader_address,
        amount_sol: rewardBalance,
        signature,
        mode: config.REWARD_MODE,
      });

      // Reset trade count
      const newThreshold = 30 + Math.floor(Math.random() * 271);
      await this.listenerRepo.updateTradeThreshold(newThreshold, 0);

      console.log(`Reward of ${rewardBalance} SOL sent to ${lastTrader.trader_address}`);

      return { success: true, signature };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Reward distribution failed',
      };
    }
  }

  private async updateMetrics(cycle: BullrhunCycle): Promise<void> {
    try {
      // Fetch current SOL price from CoinGecko
      const currentSolPrice = await this.fetchSolPrice();
      
      const currentMetrics = await this.metricsRepo.getMetrics();
      const updatedMetrics = {
        ...currentMetrics,
        total_cycles: currentMetrics.total_cycles + 1,
        total_fees_collected: currentMetrics.total_fees_collected + (cycle.fee_amount_sol || 0),
        total_trades: currentMetrics.total_trades + (cycle.buy_signature ? 1 : 0),
        total_rewards_sent: currentMetrics.total_rewards_sent + (cycle.reward_amount_sol || 0),
        current_sol_price: currentSolPrice || currentMetrics.current_sol_price, // Use CoinGecko price if available, fallback to existing
        last_cycle_at: cycle.executed_at,
        updated_at: new Date().toISOString(),
      };

      await this.metricsRepo.updateMetrics(updatedMetrics);
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  private async getTokenStatus(mint: string): Promise<{ is_graduated: boolean } | null> {
    const { data: tokenStatus, error } = await supabase.from('bullrhun_tokens')
    .select('is_graduated')
    .eq('mint', config.BULLRHUN_MINT)
    .single();
    if (error) {
      // console.error('Error fetching token status:', error);
      return null; // Return null if error fetching token status
    }
    return { is_graduated: tokenStatus?.is_graduated || false };  
  }

  // Public methods for API consumption
  async getCycleHistory(mint?: string, limit: number = 10): Promise<BullrhunCycle[]> {
    return this.cycleRepo.findByMint(mint || config.BULLRHUN_MINT as string, { limit });
  }

  async getCycleStats(): Promise<any> {
    return this.cycleRepo.getCycleStats();
  }

  async getRunningCycles(): Promise<BullrhunCycle[]> {
    return this.cycleRepo.getRunningCycles();
  }
}