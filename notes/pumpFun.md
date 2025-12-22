
PumpSwap Data API
Accessing PumpSwap data requires a PumpPortal API key and linked wallet funded with at least 0.02 SOL. By streaming PumpSwap data your wallet will incur a charge of 0.01 SOL for every 10000 websocket messages you receive.

PumpSwap data is enabled only if you connect to the websocket using the following URL format:

wss://pumpportal.fun/api/data?api-key=your-api-key-here

If the wallet linked to your API key does not contain the minimum balance of SOL, the connection will be restricted to only trades on the bonding curve.

import WebSocket from 'ws';

const ws = new WebSocket('wss://pumpportal.fun/api/data?api-key=your-api-key-here');

ws.on('open', function open() {

  // Subscribing to trades made by accounts
  payload = {
      method: "subscribeAccountTrade",
      keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    }
  ws.send(JSON.stringify(payload));

  // Subscribing to trades on tokens
  payload = {
      method: "subscribeTokenTrade",
      keys: ["GkyPYa7NnCFbduLknCfBfP7p8564X1VZhwZYJ6CZpump"] // array of token CAs to watch
    }
  ws.send(JSON.stringify(payload));
});

ws.on('message', function message(data) {
  console.log(JSON.parse(data));
});

Transaction API Docs
To get a transaction for signing and sending with a custom RPC, send a POST request to

https://pumpportal.fun/api/trade-local

Your request body must contain the following options:

publicKey: Your wallet public key
action: "buy" or "sell"
mint: The contract address of the token you want to trade (this is the text after the '/' in the pump.fun url for the token.)
amount: The amount of SOL or tokens to trade. If selling, amount can be a percentage of tokens in your wallet (ex. amount: "100%")
denominatedInSol: "true" if amount is SOL, "false" if amount is tokens
slippage: The percent slippage allowed
priorityFee: Amount to use as priority fee
pool: (optional) Currently 'pump', 'raydium', 'pump-amm', 'launchlab', 'raydium-cpmm', 'bonk', and 'auto' are supported options. Default is 'pump'.
If your parameters are valid, you will receive a serialized transaction in response. See the examples below for how to send this transaction with Python (Solders) or JavaScript (Web3.js).

import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from "bs58";

const RPC_ENDPOINT = "Your RPC Endpoint";
const web3Connection = new Connection(
    RPC_ENDPOINT,
    'confirmed',
);

async function sendPortalTransaction(){
  const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          "publicKey": "your-public-key",  // Your wallet public key
          "action": "buy",                 // "buy" or "sell"
          "mint": "token-ca-here",         // contract address of the token you want to trade
          "denominatedInSol": "false",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
          "amount": 1000,                  // amount of SOL or tokens
          "slippage": 10,                  // percent slippage allowed
          "priorityFee": 0.00001,          // priority fee
          "pool": "auto"                   // exchange to trade on. "pump", "raydium", "pump-amm", 'launchlab', 'raydium-cpmm', 'bonk' or "auto"
      })
  });
  if(response.status === 200){ // successfully generated transaction
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      const signerKeyPair = Keypair.fromSecretKey(bs58.decode("your-wallet-private-key"));
      tx.sign([signerKeyPair]);
      const signature = await web3Connection.sendTransaction(tx)
      console.log("Transaction: https://solscan.io/tx/" + signature);
  } else {
      console.log(response.statusText); // log error
  }
}

sendPortalTransaction();

Claiming Token Creator Fees
Pump.fun rewards token creators by allowing them to collect a fraction of the fees generated from trading activity on their token. You can use the PumpPortal Lightning or Local Transaction APIs to claim any creator fees from Pump.fun. The Lightning Transaction API can now also be used to claim creator fees from Meteora Dynamic Bonding Curves.

Examples below:

import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from "bs58";

const RPC_ENDPOINT = "Your RPC Endpoint";
const web3Connection = new Connection(
    RPC_ENDPOINT,
    'confirmed',
);

async function sendPortalTransaction(){
  const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
            "publicKey": "Your public key here",
            "action": "collectCreatorFee",
            "priorityFee": 0.000001,
      })
  });
  if(response.status === 200){ // successfully generated transaction
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      const signerKeyPair = Keypair.fromSecretKey(bs58.decode("your-wallet-private-key"));
      tx.sign([signerKeyPair]);
      const signature = await web3Connection.sendTransaction(tx)
      console.log("Transaction: https://solscan.io/tx/" + signature);
  } else {
      console.log(response.statusText); // log error
  }
}

sendPortalTransaction();

also see pump swap sdk
https://socket.dev/npm/package/@pump-fun/pump-swap-sdk