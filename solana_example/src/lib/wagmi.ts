import { createConfig, http } from 'wagmi'
import { solana, solanaDevnet } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [solana, solanaDevnet],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '', // You'll need to get this from WalletConnect
    }),
  ],
  transports: {
    [solana.id]: http(),
    [solanaDevnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}