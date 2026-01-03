import { NextResponse } from "next/server";

export async function GET() {
  // Simulate real-time data updates
  const mockData = {
    creatorFeesCollected: 2.4567 + Math.random() * 0.01,
    tokensBought: 1234567 + Math.floor(Math.random() * 100),
    giftsSentToTraders: 0.8923 + (Math.random() > 0.8 ? Math.random() * 0.1 : 0),
    lastUpdate: new Date().toISOString(),
    nextCycleIn: Math.floor(Math.random() * 120),
    totalProfitCycles: 156 + Math.floor(Math.random() * 5),
    currentSolPrice: 145.32 + (Math.random() * 10 - 5),
    giftHistory: [
      {
        id: '1',
        trader: '7xKsTG...z3M9',
        amount: 0.125 + Math.random() * 0.05,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        txHash: '3J8n9K2...7LmQ'
      },
      {
        id: '2',
        trader: '9WpRfA...x2N4',
        amount: 0.089 + Math.random() * 0.03,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        txHash: '5Km7Pq3...9RtX'
      },
      {
        id: '3',
        trader: '2LmHdY...8Vb1',
        amount: 0.156 + Math.random() * 0.04,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        txHash: '8Nq4Jx2...3WsZ'
      }
    ]
  };

  return NextResponse.json(mockData);
}