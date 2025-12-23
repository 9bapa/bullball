BullBall End-to-End Profit Cycle Flow

1) Check and Claim Creator Fees
- Action: Request encoded fee collection and sign+send
- Code: `src/app/api/bullball/run-cycle/route.ts:30` → calls `collectCreatorFee`
- Impl: `src/lib/pumpportal.ts:26–31` logs start and signature; `fetchEncodedTx` sends `action: 'collectCreatorFee'`
- Logs: wallet balance before/after claim `src/app/api/bullball/run-cycle/route.ts:28–33`

2) Split Claimed Fees (10% → Platform Wallet)
- Action: Transfer 10% of `deltaSol` to `PLATFORM_WALLET`
- Code: `src/app/api/bullball/run-cycle/route.ts:35–45`
- Env: `PLATFORM_WALLET` destination
- Logs: platform fee and signature `src/app/api/bullball/run-cycle/route.ts:38–42`

3) Buy Token (50% of Remaining Fees)
- Action: Use part of remaining SOL to buy token via PumpPortal
- Code: `src/app/api/bullball/run-cycle/route.ts:46–66`
- Impl: Venue-aware buy `src/lib/pumpportal.ts:34–82` (tries `pump-amm` then falls back to `pump`), writes `trade_history`
- Logs: `buyToken start` and chosen venue with signature in `src/lib/pumpportal.ts` and allocation logs in `src/app/api/bullball/run-cycle/route.ts:43–45`

4) Add Liquidity with Tokens Bought (Remaining 50%)
- Action: Deposit quote to AMM and burn LP
- Code path to enable: set `liquiditySol` > 0 and `PUMPSWAP_POOL`
- Current behavior: liquidity disabled (`liquiditySol = 0`) in `src/app/api/bullball/run-cycle/route.ts:44`
- Deposit+Burn: `src/app/api/bullball/run-cycle/route.ts:68–94` → `depositAndBurnLp({ poolKey, quoteAmountSol, slippage })`
- AMM impl: `src/lib/pumpswap.ts:8–41` (Online state, Offline instructions, deposit tx), burn LP if present `src/lib/pumpswap.ts:26–36`
- Logs: `pumpswap deposit start/sent`, `pumpswap burn sent` `src/lib/pumpswap.ts:15, 19–21, 31–33`

5) Burn LP Tokens
- Action: After deposit, read LP ATA and burn all LP
- Code: `src/lib/pumpswap.ts:26–36`
- Logs: burn signature and LP amount `src/lib/pumpswap.ts:31–33`

6) Rewards (Threshold-based)
- Action: If trade count ≥ threshold, send configured reward SOL to `REWARD_ADDRESS` or last trader
- Code: `src/app/api/bullball/run-cycle/route.ts:109–139`
- Env: `REWARD_MODE` ('address' | 'last-trader'), `REWARD_ADDRESS`, `REWARD_SOL_AMOUNT`
- Data: last trader stored by listener `profit_last_trader`

7) Persist Cycle Metrics and Ops Limits
- Records: `profit_liquidity_events` (fee/buy/deposit/burn tx and status)
- Code: `src/app/api/bullball/run-cycle/route.ts:95–107`
- Updates: `ops_limits` keys `run-cycle`, `buy`, `deposit` with window timestamps

Real-Time Trade Subscription
- Listener: `mini-services/pumpportal-trade-listener.js:31–98`
- Subscribes: `subscribeTokenTrade` on token mint (from `listener_status` or `BULLBALL_MINT`)
- Increments: `profit_trade_state.current_count` on each trade `mini-services/pumpportal-trade-listener.js:45–53`
- Persists: `trade_history` with venue, amounts `mini-services/pumpportal-trade-listener.js:60–74`
- Heartbeat: `listener_status` for health and mint tracking `mini-services/pumpportal-trade-listener.js:39–41, 76–77`
- Health Endpoint: `GET /api/bullball/listener-status` `src/app/api/bullball/listener-status/route.ts:1–28`

Configuration (Env)
- Trading: `SOLANA_PUBLIC_KEY`, `DEV_WALLET` (private key), `PUMPPORTAL_API_KEY`
- Token/Mint: `BULLBALL_MINT`; AMM pool: `PUMPSWAP_POOL`
- Platform fee: `PLATFORM_WALLET`
- Rewards: `REWARD_MODE`, `REWARD_ADDRESS`, `REWARD_SOL_AMOUNT`

Logging Overview
- PumpPortal requests: `src/lib/pumpportal.ts:14–22` (encoded tx parameters)
- Fee ops: `collectCreatorFee start/done` `src/lib/pumpportal.ts:26–31`
- Buy ops: `buyToken start` and `venue` `src/lib/pumpportal.ts:34–82`
- Cycle balances/delta/platform: `src/app/api/bullball/run-cycle/route.ts:28–45`
- Pumpswap deposit/burn: `src/lib/pumpswap.ts:15, 19–21, 31–33`
- Cycle payload summary: `src/app/api/bullball/run-cycle/route.ts:154–157`

To Enable Liquidity Step
- Set `liquiditySol` to `remainingSol * 0.5` and `buySol = remainingSol - liquiditySol` in `src/app/api/bullball/run-cycle/route.ts:43–45`
- Ensure `PUMPSWAP_POOL` is a valid pool address; keep `slippage` conservative (e.g., 3)

