import { NextResponse } from "next/server";
import { collectCreatorFee, buyToken } from "@/lib/pumpportal";
import {
  getConnection,
  transferSol,
  transferRewardSol,
  transferToken,
  getTokenBalance,
  getBalance,
} from "@/lib/solana";
import { depositAndBurnLp } from "@/lib/pumpswap";
import { supabaseAdmin } from "@/lib/supabase";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function POST() {
  //collect creator fee
  try {
    const mint = process.env.BULLBALL_MINT;
    if (!mint)
      return NextResponse.json(
        { error: "Missing BULLBALL_MINT" },
        { status: 400 }
      );

    if (supabaseAdmin) {
      const { data: limitCycle } = await supabaseAdmin
        .from("ops_limits")
        .select("last_executed,window_seconds")
        .eq("key", "run-cycle")
        .maybeSingle();
      const now = Date.now();
      const last = limitCycle?.last_executed
        ? new Date(limitCycle.last_executed).getTime()
        : 0;
      const windowMs =
        ((process.env.RATE_LIMIT_CYCLE_SECONDS &&
          parseInt(process.env.RATE_LIMIT_CYCLE_SECONDS)) ||
          limitCycle?.window_seconds ||
          120) * 1000;
      if (last && now - last < windowMs)
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const connection = getConnection();
    const walletPubkeyStr = process.env.SOLANA_PUBLIC_KEY!;
    const walletPubkey = new PublicKey(walletPubkeyStr);
    const balanceBefore = await connection.getBalance(
      walletPubkey,
      "confirmed"
    );
    console.log("run-cycle wallet balance before", {
      wallet: walletPubkeyStr,
      lamports: balanceBefore,
    });

    const feeSig = await collectCreatorFee();
    const balanceAfterClaim = await connection.getBalance(
      walletPubkey,
      "confirmed"
    );
    console.log("run-cycle wallet balance after claim", {
      lamports: balanceAfterClaim,
    });
    const deltaLamports = Math.max(0, balanceAfterClaim);
    const deltaSol = deltaLamports / LAMPORTS_PER_SOL;
    let last_cycle_balance = 0;
    let pay_next_cycle_fee = false;

    const { data: last_cycle } = await supabaseAdmin
      .from("developer_wallet_stats")
      .select("*")
      .eq("address", process.env.BULLBALL_MINT)
      .maybeSingle();

    console.log("run-cycle delta", { deltaLamports, deltaSol });
    const platformAddress = process.env.PLATFORM_WALLET;
    let platformSig: string | null = null;
    let rewardFeeSig: string | null = null;
    let remainingSol = deltaSol;
    if (platformAddress && deltaSol > 0 && last_cycle?.pay_next_cycle_fee) {
      const platformSol = deltaSol * 0.12;
      const rewardSol = deltaSol * 10;
      remainingSol = Math.max(0, deltaSol - platformSol);
      platformSig = await transferSol(platformAddress, platformSol);
      rewardFeeSig = await transferSol(process.env.REWARD_WALLET!, rewardSol);
      pay_next_cycle_fee = true;
      console.log("run-cycle platform fee", {
        platformAddress,
        platformSol,
        platformSig,
        rewardFeeSig,
        rewardSol,
      });

      last_cycle_balance = Math.max(0, last_cycle?.last_balance_sol || 0);
      last_cycle_balance = last_cycle_balance / LAMPORTS_PER_SOL;
      const { data, error } = await supabaseAdmin
        .from("developer_wallet_stats")
        .update({
          total_received_sol: last_cycle_balance + remainingSol,
          last_balance_sol: remainingSol,
          pay_next_cycle_fee,
        })
        .eq("address", process.env.SOLANA_PUBLIC_KEY!);

      if (error) {
        // Log specific Supabase/database errors
        console.error("Supabase Update Error:", error.message, error.details);
      } else {
        console.log(
          "Wallet stats updated successfully" + process.env.SOLANA_PUBLIC_KEY!
        );
      }
    }
    /// collect creator fee

    /// start buy token... 
    const tokenStatus = await supabaseAdmin
    .from("token_status")
    .select("*")
    .eq("mint", process.env.BULLBALL_MINT!)
    .maybeSingle();
    let buySol = remainingSol * .99;
    let liquiditySol = 0;

    if(tokenStatus?.is_graduated){
      buySol = buySol/2;
      liquiditySol = buySol/2;
    }
    console.log("run-cycle allocations", { buySol, liquiditySol });

    let buySig: string | null = null;
    const MIN_BUY_AMOUNT_SOL = 0.001; // Minimum 0.001 SOL to buy
    if (buySol > MIN_BUY_AMOUNT_SOL) {
      console.log("run-cycle buy check passed", {
        buySol,
        minRequired: MIN_BUY_AMOUNT_SOL,
      });
      if (supabaseAdmin) {
        const { data: limitBuy } = await supabaseAdmin
          .from("ops_limits")
          .select("last_executed,window_seconds")
          .eq("key", "buy")
          .maybeSingle();
        const now = Date.now();
        const last = limitBuy?.last_executed
          ? new Date(limitBuy.last_executed).getTime()
          : 0;
        const windowMs =
          ((process.env.RATE_LIMIT_BUY_SECONDS &&
            parseInt(process.env.RATE_LIMIT_BUY_SECONDS)) ||
            limitBuy?.window_seconds ||
            30) * 1000;
        if (!last || now - last >= windowMs) {
          try {
            const r = await buyToken({
              mint,
              amount: buySol,
              denominatedInSol: true,
              slippage: 3,
              priorityFee: 0.00005,
            });
            buySig = r.signature;
            await supabaseAdmin
              .from("ops_limits")
              .upsert({
                key: "buy",
                window_seconds: Math.floor(windowMs / 1000),
                last_executed: new Date().toISOString(),
              });
            await supabaseAdmin
              .from("developer_wallet_stats")
              .update({ pay_next_cycle_fee: true })
              .eq("address", process.env.SOLANA_PUBLIC_KEY!);
          } catch (error) {
            await supabaseAdmin
              .from("developer_wallet_stats")
              .update({ pay_next_cycle_fee: false })
              .eq("address", process.env.SOLANA_PUBLIC_KEY!);
            console.error("run-cycle buy failed", error);
          }
        } else {
          console.log("run-cycle buy rate limited", { last, now, windowMs });
        }
      } else {
        try {
          const r = await buyToken({
            mint,
            amount: buySol,
            denominatedInSol: true,
            slippage: 3,
            priorityFee: 0.00005,
          });
          buySig = r.signature;
          await supabaseAdmin
            .from("developer_wallet_stats")
            .update({ pay_next_cycle_fee: true })
            .eq("address", process.env.SOLANA_PUBLIC_KEY!);
        } catch (error) {
          await supabaseAdmin
            .from("developer_wallet_stats")
            .update({ pay_next_cycle_fee: false })
            .eq("address", process.env.SOLANA_PUBLIC_KEY!);
          console.error("run-cycle buy failed", error);
          console.error("run-cycle buy failed", error);
        }
      }
    } else {
      console.log("run-cycle buy amount too low", {
        buySol,
        minRequired: MIN_BUY_AMOUNT_SOL,
      });
    }

    // Transfer bought tokens to platform wallet if not graduated
    let tokenTransferSig: string | null = null;
    if (buySig && platformAddress) {
      try {
        if (!tokenStatus?.is_graduated) {
        const tokenBalance = await getTokenBalance(mint, walletPubkeyStr);
        if (tokenBalance > 0) {
          tokenTransferSig = await transferToken(
            platformAddress,
            mint,
            tokenBalance
          );
          console.log("run-cycle token transfer", {
            platformAddress,
            mint,
            tokenBalance,
            tokenTransferSig,
          });
        } else {
          console.log("run-cycle no tokens to transfer", {
            mint,
            tokenBalance,
          });
        }        
      }
        
      } catch (error) {
        console.error("run-cycle token transfer failed", error);
      }
    }

    let depositSig: string | null = null;
    let burnSig: string | null = null;
    let liquidityStatus = "skipped";
    const poolKey = process.env.PUMPSWAP_POOL;

    // Only attempt liquidity operations if we have a pool key and sufficient SOL
    if (poolKey && liquiditySol > 0.001) {
      liquidityStatus = "attempted";
      let allowDeposit = true;
      if (supabaseAdmin) {
        const { data: limitDeposit } = await supabaseAdmin
          .from("ops_limits")
          .select("last_executed,window_seconds")
          .eq("key", "deposit")
          .maybeSingle();
        const now = Date.now();
        const last = limitDeposit?.last_executed
          ? new Date(limitDeposit.last_executed).getTime()
          : 0;
        const windowMs =
          ((process.env.RATE_LIMIT_DEPOSIT_SECONDS &&
            parseInt(process.env.RATE_LIMIT_DEPOSIT_SECONDS)) ||
            limitDeposit?.window_seconds ||
            30) * 1000;
        allowDeposit = !last || now - last >= windowMs;

        if (allowDeposit) {
          try {
            const res = await depositAndBurnLp({
              poolKey,
              quoteAmountSol: liquiditySol,
              slippage: 3,
            });
            depositSig = res.depositSig;
            burnSig = res.burnSig;
            liquidityStatus = depositSig ? "executed" : "failed";
            await supabaseAdmin
              .from("ops_limits")
              .upsert({
                key: "deposit",
                window_seconds: Math.floor(windowMs / 1000),
                last_executed: new Date().toISOString(),
              });
          } catch (error) {
            console.error("run-cycle liquidity deposit failed:", error);
            liquidityStatus = "failed";
          }
        } else {
          console.log("run-cycle deposit rate limited", {
            last,
            now,
            windowMs,
          });
          liquidityStatus = "rate_limited";
        }
      } else {
        try {
          const res = await depositAndBurnLp({
            poolKey,
            quoteAmountSol: liquiditySol,
            slippage: 3,
          });
          depositSig = res.depositSig;
          burnSig = res.burnSig;
          liquidityStatus = depositSig ? "executed" : "failed";
        } catch (error) {
          console.error("run-cycle liquidity deposit failed:", error);
          liquidityStatus = "failed";
        }
      }
    } else {
      console.log("run-cycle liquidity skipped", {
        poolKey,
        liquiditySol,
        reason: poolKey ? "insufficient_sol" : "no_pool_key",
      });
    }

    // Handle rewards (must be before database updates)
    const rewardAddress:any = process.env.REWARD_ADDRESS;
    const rewardAddressBalance = await getBalance(rewardAddress);
    let rewardSig: string | null = null;
    const MIN_GIFT_TRADE_AMOUNT = 0.5; // Only trades ≥0.50 SOL qualify for gifts

    if (rewardAddressBalance > 0 && supabaseAdmin) {
      const { data: state } = await supabaseAdmin
        .from("profit_trade_state")
        .select("current_threshold,current_count")
        .eq("id", 1)
        .maybeSingle();
      const count = state?.current_count || 0;
      const threshold = state?.current_threshold || 30;

      if (count >= threshold) {
        const rewardSolUsed = rewardAddressBalance;

          // Only get last trader who made a qualifying trade (≥0.50 SOL)
          const { data: lastQualifyingTrader } = await supabaseAdmin
            .from("profit_last_trader")
            .select("address, trade_amount_sol")
            .gte("trade_amount_sol", MIN_GIFT_TRADE_AMOUNT) // Only qualifying trades
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

          if (lastQualifyingTrader?.address) {
            rewardSig = await transferRewardSol(
              lastQualifyingTrader.address,
              rewardSolUsed
            );
            await supabaseAdmin
              .from("gifts")
              .insert({
                to_address: lastQualifyingTrader.address,
                amount_sol: rewardSolUsed, // Reset trade amount after gift
                updated_at: new Date().toISOString(),
                signature: rewardSig,
                mode: 'last-trader',
              });

            console.log("run-cycle reward sent to last qualifying trader", {
              address: lastQualifyingTrader.address,
              tradeAmount: lastQualifyingTrader.trade_amount_sol,
              rewardSolUsed,
              rewardSig,
            });
          } else {
            console.log(
              "run-cycle no qualifying trader found (min 0.50 SOL required)"
            );
          }

        const newThreshold = Math.floor(30 + Math.random() * 271);
        await supabaseAdmin
          .from("profit_trade_state")
          .upsert({
            id: 1,
            current_threshold: newThreshold,
            current_count: 0,
            updated_at: new Date().toISOString(),
          });

        console.log("run-cycle reward threshold reset", {
          newThreshold,
          rewardSig: !!rewardSig,
        });
      } else {
        console.log("run-cycle reward threshold not met", { count, threshold });
      }
    }

    // Only insert into profit_liquidity_events if we performed buy or deposit operations
    if (supabaseAdmin && (buySig || depositSig)) {
      await supabaseAdmin.from("profit_liquidity_events").insert({
        mint,
        sol_amount: liquiditySol,
        status: liquidityStatus,
        fee_tx: feeSig,
        buy_tx: buySig,
        deposit_tx: depositSig,
        burn_tx: burnSig,
        created_at: new Date().toISOString(),
      });

      // Update ops_limits for performed operations
      const operationsPerformed: string[] = [];
      if (buySig) operationsPerformed.push("buy");
      if (depositSig) operationsPerformed.push("deposit");

      for (const op of operationsPerformed) {
        const windowSeconds = parseInt(
          op === "buy"
            ? process.env.RATE_LIMIT_BUY_SECONDS || "30"
            : process.env.RATE_LIMIT_DEPOSIT_SECONDS || "30"
        );
        await supabaseAdmin.from("ops_limits").upsert({
          key: op,
          window_seconds: windowSeconds,
          last_executed: new Date().toISOString(),
        });
      }
    }

    // Always update profit_metrics last_update and next_cycle_in
    if (supabaseAdmin) {
      const cycleWindowSeconds = parseInt(
        process.env.RATE_LIMIT_CYCLE_SECONDS || "120"
      );

      // Always update ops_limits for run-cycle to prevent rate limiting when no operations
      await supabaseAdmin.from("ops_limits").upsert({
        key: "run-cycle",
        window_seconds: cycleWindowSeconds,
        last_executed: new Date().toISOString(),
      });
    }

    const payload = {
      feeSig,
      buySig,
      tokenTransferSig,
      depositSig,
      burnSig,
      liquiditySol,
      rewardSig,
      deltaSol,
      platformSig,
    };
    console.log("POST /api/bullball/run-cycle", payload);
    return NextResponse.json(payload);
  } catch (e) {
    console.error("POST /api/bullball/run-cycle error", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
