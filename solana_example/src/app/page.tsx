'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletConnect } from '@/components/wallet-connect'
import { WalletInfo } from '@/components/wallet-info'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Zap, 
  Shield, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'

export default function Home() {
  const { publicKey, connected, wallet } = useWallet()

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Friendly",
      description: "Connect wallets on both mobile and desktop browsers"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Connection",
      description: "Your private keys never leave your wallet"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Built on Solana's high-performance blockchain"
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Multi-Wallet Support",
      description: "Support for Phantom, Solflare, and more"
    }
  ]

  const supportedWallets = [
    { name: "Phantom", description: "Most popular Solana wallet", mobile: true, desktop: true },
    { name: "Solflare", description: "Secure browser extension", mobile: true, desktop: true },
    { name: "Backpack", description: "Advanced trading wallet", mobile: false, desktop: true },
    { name: "Ledger", description: "Hardware wallet support", mobile: false, desktop: true }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Solana Wallet Connect
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your Solana wallet to interact with blockchain applications securely and seamlessly.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Wallet Connection */}
          <div className="lg:col-span-1">
            <WalletConnect />
          </div>

          {/* Account Info */}
          <div className="lg:col-span-2">
            {connected && publicKey ? (
              <div className="space-y-6">
                <WalletInfo />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      Your connected wallet details and blockchain information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Wallet Type</label>
                        <Badge variant="secondary" className="text-sm">
                          {wallet?.adapter.name}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Network</label>
                        <Badge variant="outline" className="text-sm">
                          Mainnet Beta
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Public Address</label>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {formatAddress(publicKey.toString())}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyAddress}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://solscan.io/account/${publicKey.toString()}`, '_blank')}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Balance
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Solscan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Solana DApp</CardTitle>
                  <CardDescription>
                    Connect your wallet to get started with blockchain interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Connect your Solana wallet to access account information, 
                      check balances, and interact with decentralized applications.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline">Phantom</Badge>
                      <Badge variant="outline">Solflare</Badge>
                      <Badge variant="outline">Backpack</Badge>
                      <Badge variant="outline">Ledger</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Wallet Connect?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Supported Wallets */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-8">Supported Wallets</h2>
          <Card>
            <CardHeader>
              <CardTitle>Wallet Compatibility</CardTitle>
              <CardDescription>
                We support a wide range of Solana wallets for both desktop and mobile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {supportedWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{wallet.name}</h4>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {wallet.desktop && <Badge variant="outline">Desktop</Badge>}
                      {wallet.mobile && <Badge variant="outline">Mobile</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; 2024 Solana Wallet Connect. Built with Next.js and Solana.</p>
        </footer>
      </div>
    </div>
  )
}