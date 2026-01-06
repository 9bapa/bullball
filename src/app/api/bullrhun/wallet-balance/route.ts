import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { getBalance, getConnection } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';

export async function GET() {
  try {
    // Get the reward wallet address from config
    const rewardAddress = process.env.WALLET_REWARD;
    const devAddress = process.env.WALLET_DEV;
    
    if (!rewardAddress || !devAddress) {
      return NextResponse.json({ 
        error: 'Wallet addresses not configured' 
      }, { status: 500 });
    }

    // Get actual SOL balance for reward wallet
    let rewardBalance = 0;
    let devBalance = 0;
    
    try {
      if (rewardAddress) {
        rewardBalance = await getBalance(rewardAddress);
      }
    } catch (error) {
      console.error('Error fetching reward wallet balance:', error);
    }
    
    try {
      if (devAddress) {
        devBalance = await getBalance(devAddress);
      }
    } catch (error) {
      console.error('Error fetching dev wallet balance:', error);
    }

    // Get dev wallet token balance from blockchain
    let tokenBalance = 0;
    let rewardTokenBalance = 0;
    
    try {
      if (devAddress && process.env.BULLRHUN_MINT) {
        const connection = getConnection();
        const devTokenAccounts = await connection.getTokenAccountsByOwner(
          new PublicKey(devAddress),
          { mint: new PublicKey(process.env.BULLRHUN_MINT) }
        );
        
        tokenBalance = devTokenAccounts.value?.reduce((total, account) => {
          // account.account.data is a Buffer, parse it using the SPL Token layout
          const data = account.account.data;
          // Use the SPL Token account layout to parse the data
          const amount = data.readBigUInt64LE(64); // Token amount is at byte offset 64
          return total + Number(amount);
        }, 0) || 0;
      }
    } catch (error) {
      console.error('Error fetching dev wallet token balance:', error);
      // Fallback to 0 instead of using token_supply (which is total supply, not wallet balance)
    }
    
    // Get reward wallet's token balance
    try {

      if (rewardAddress && process.env.BULLRHUN_MINT) {
        const connection = getConnection();
        const rewardTokenAccounts = await connection.getTokenAccountsByOwner(
          new PublicKey(rewardAddress),
          { mint: new PublicKey(process.env.BULLRHUN_MINT) }
        );
        

        
        rewardTokenBalance = rewardTokenAccounts.value?.reduce((total, account) => {
          try {
            // Use proper Solana AccountLayout to parse token account data
            const data = account.account.data;
            if (data && Buffer.isBuffer(data)) {
              // Parse using AccountLayout (proper SPL token account structure)
              const accountInfo = AccountLayout.decode(data);
              const amount = accountInfo.amount;
              return total + Number(amount);
            } else {
              // Fallback to parsed data if available
              const parsedData = (account.account?.data as any)?.parsed;
              const tokenAmount = parsedData?.info?.tokenAmount?.amount;
              return total + (tokenAmount || 0);
            }
          } catch (error) {
            console.error('Error parsing token account:', error);
            return total;
          }
        }, 0) || 0;
      }

    } catch (tokenError) {
      console.error('Error fetching reward token balance:', tokenError);
      // Fallback to 0 instead of using incorrect value
      rewardTokenBalance = 0;
    }

    return NextResponse.json({
      dev_wallet: {
        address: devAddress,
        solBalance: Math.floor(devBalance * 1000000000), // Convert to lamports
        tokenBalance: tokenBalance,
      },
      reward_wallet: {
        address: rewardAddress,
        solBalance: Math.floor(rewardBalance * 1000000000), // Convert to lamports
        tokenBalance: rewardTokenBalance, // Use actual reward wallet token balance
      }
    });

  } catch (error) {
    console.error('Trade game data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade game data' },
      { status: 500 }
    );
  }
}