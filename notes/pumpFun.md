PumpFun data
Stream real-time trading and token creation data by connecting to the PumpPortal Websocket at wss://pumpportal.fun/api/data.

Once you connect, you can subscribe to different data streams. The following methods are available:

subscribeNewToken For token creation events.

subscribeTokenTrade For all trades made on specific token(s).

subscribeAccountTrade For all trades made by specific account(s).

subscribeMigration For subscribing to token migration events.

import WebSocket from 'ws';

const ws = new WebSocket('wss://pumpportal.fun/api/data');

ws.on('open', function open() {

  // Subscribing to token creation events
  let payload = {
      method: "subscribeNewToken", 
    }
  ws.send(JSON.stringify(payload));

  // Subscribing to migration events
  let payload = {
      method: "subscribeMigration", 
    }
  ws.send(JSON.stringify(payload));

  // Subscribing to trades made by accounts
  payload = {
      method: "subscribeAccountTrade",
      keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    }
  ws.send(JSON.stringify(payload));

  // Subscribing to trades on tokens
  payload = {
      method: "subscribeTokenTrade",
      keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
    }
  ws.send(JSON.stringify(payload));
});

ws.on('message', function message(data) {
  console.log(JSON.parse(data));
});

You can also unsubscribe from any data stream in the same way, using the following methods:

unsubscribeNewToken

unsubscribeTokenTrade

unsubscribeAccountTrade

const ws = new WebSocket(`wss://pumpportal.fun/api/data`);

ws.on('open', function open() {
  ws.send(JSON.stringify({
    method: "subscribeTokenTrade", 
    keys: ["Bwc4EBE65qXVzZ9ZiieBraj9GZL4Y2d7NN7B9pXENWR2"]
  }));

  // unsubscribe after 10 seconds
  setTimeout(()=>{
    ws.send(JSON.stringify({
        method: "unsubscribeTokenTrade", 
        keys: ["Bwc4EBE65qXVzZ9ZiieBraj9GZL4Y2d7NN7B9pXENWR2"]
    }));
  }, 10000);
});


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

You can also unsubscribe from any data stream in the same way, using the following methods:

unsubscribeTokenTrade

unsubscribeAccountTrade

Claiming Token Creator Fees
Pump.fun rewards token creators by allowing them to collect a fraction of the fees generated from trading activity on their token. You can use the PumpPortal Lightning or Local Transaction APIs to claim any creator fees from Pump.fun. The Lightning Transaction API can now also be used to claim creator fees from Meteora Dynamic Bonding Curves.

Examples below:
const response = await fetch("https://pumpportal.fun/api/trade?api-key=your-api-key-here", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        "action": "collectCreatorFee",
        "priorityFee": 0.000001,
        "pool": "meteora-dbc" // "pump" or "meteora-dbc"
        "mint": "token CA" // the token for which you are claiming fees
        // Note: pump.fun claims creator fees all at once, so you do not need to specify "mint"
    })
});
const data = await response.json();  // JSON object with tx signature or error(s)

https://socket.dev/npm/package/@pump-fun/pump-swap-sdk