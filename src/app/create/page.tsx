'use client'

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, 
  TrendingUp, 
  Gift, 
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Rocket,
  Users,
  Shield,
  Globe,
  Twitter,
  MessageCircle,
  Upload,
  Info,
  ChevronRight,
  Star,
  Target,
  Activity,
  DollarSign
} from 'lucide-react'
import Image from 'next/image'

interface TokenFormData {
  name: string
  symbol: string
  description: string
  twitter: string
  telegram: string
  image: File | null
  pumpportalWallet: string
  pumpportalApiKey: string
  payerPrivateKeyBase58: string
  initialLiquidity: string
  creatorFeeBps: string
  enableBullRuns: boolean
  bullRunFrequency: string
  traderRewardBps: string
  enableTraderRewards: boolean
}

interface CreatedToken {
  success: boolean
  tokenAddress?: string
  txSignature?: string
  error?: string
}

export default function CreateToken() {
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    image: null,
    pumpportalWallet: '',
    pumpportalApiKey: '',
    payerPrivateKeyBase58: '',
    initialLiquidity: '0.1',
    creatorFeeBps: '100',
    enableBullRuns: true,
    bullRunFrequency: '3600',
    traderRewardBps: '50',
    enableTraderRewards: true
  })
  
  const [loading, setLoading] = useState(false)
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files?.[0] : value
    }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCreatedToken(null)

    try {
      const response = await fetch('/api/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      setCreatedToken(result)
    } catch (error) {
      setCreatedToken({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create token'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatBps = (bps: string) => {
    const value = parseFloat(bps)
    return `${(100 * value).toFixed(1)}%`
  }

  const formatFrequency = (seconds: string) => {
    const value = parseInt(seconds)
    if (value < 60) return `${value}s`
    if (value < 3600) return `${Math.floor(value / 60)}m`
    return `${Math.floor(value / 3600)}h`
  }

  return (
    <>    
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-emerald-500/20 backdrop-blur-sm bg-black/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-emerald-500/25">
                <Image src="/bullball4.JPG" alt="BullBall" width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Create Token
                </h1>
                <p className="text-sm text-emerald-400/80 font-mono font-semibold tracking-wider">PumpPortal + Local Signing</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-emerald-400 font-semibold tracking-wide">CREATE MODE</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">SOL Price</p>
                <p className="text-lg font-mono font-bold text-emerald-400">$145.32</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-tight">
            Launch Your Token
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Create tokens with perpetual bull runs, automatic liquidity management, and trader rewards
          </p>
        </div>

        {/* Token Details Card */}
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl font-black">
              <Coins className="w-6 h-6 text-emerald-400" />
              <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">Token Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Token Name</label>
                  <Input
                    name="name"
                    placeholder="My Awesome Token"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Ticker Symbol</label>
                  <Input
                    name="symbol"
                    placeholder="TOKEN"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe your token..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full min-h-[100px] bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                    rows={3}
                  />
                </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Social Links</label>
                  <Input
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Telegram</label>
                  <Input
                    name="telegram"
                    placeholder="https://t.me/channel"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Token Image</label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-black/30 border-gray-600/50 text-white file:text-gray-400"
                  />
                  {previewImage && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-600/50">
                      <Image 
                        src={previewImage} 
                        alt="Token preview" 
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                {previewImage && (
                  <p className="text-xs text-gray-400 mt-2">Image preview</p>
                )}
              </div>

              <Separator className="bg-gray-700/50" />

              {/* PumpPortal Configuration */}
              <div className="space-y-4">
                <CardTitle className="flex items-center space-x-3 text-lg font-bold text-purple-400">
                  <Settings className="w-5 h-5" />
                  <span>PumpPortal Configuration</span>
                </CardTitle>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">PumpPortal Wallet</label>
                    <Input
                      name="pumpportalWallet"
                      placeholder="Public key (0x...)"
                      value={formData.pumpportalWallet}
                      onChange={handleInputChange}
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">API Key</label>
                    <Input
                      name="pumpportalApiKey"
                      placeholder="Your API key"
                      value={formData.pumpportalApiKey}
                      onChange={handleInputChange}
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <a 
                      href="https://pumpportal.fun/trading-api/setup" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Get PumpPortal API Key
                    </a>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700/50" />

              {/* BullBall Configuration */}
              <div className="space-y-4">
                <CardTitle className="flex items-center space-x-3 text-lg font-bold text-orange-400">
                  <Zap className="w-5 h-5" />
                  <span>BullBall Features</span>
                </CardTitle>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Payer Private Key (Base58)</label>
                    <Input
                      name="payerPrivateKeyBase58"
                      placeholder="Your private key for 0.035 SOL fee"
                      value={formData.payerPrivateKeyBase58}
                      onChange={handleInputChange}
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                      type="password"
                    />
                    <p className="text-xs text-gray-400">Required for 0.035 SOL creation fee</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Initial Liquidity (SOL)</label>
                    <Input
                      name="initialLiquidity"
                      placeholder="0.1"
                      value={formData.initialLiquidity}
                      onChange={handleInputChange}
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                      type="number"
                      step="0.01"
                      min="0.01"
                    />
                    <p className="text-xs text-gray-400">Starting liquidity pool</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Creator Fee (BPS)</label>
                    <Input
                      name="creatorFeeBps"
                      placeholder="100"
                      value={formData.creatorFeeBps}
                      onChange={handleInputChange}
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                      type="number"
                      step="0.01"
                      min="0.01"
                    />
                    <p className="text-xs text-gray-400">Current: {formatBps(formData.creatorFeeBps)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Bull Run Frequency</label>
                    <Input
                      name="bullRunFrequency"
                      placeholder="3600"
                      value={formData.bullRunFrequency}
                      onChange={handleInputChange}
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-500 rounded-lg p-3"
                      type="number"
                      min="60"
                    />
                    <p className="text-xs text-gray-400">Every {formatFrequency(formData.bullRunFrequency)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableBullRuns}
                      onChange={(e) => setFormData(prev => ({ ...prev, enableBullRuns: e.target.checked }))}
                      className="w-4 h-4 text-emerald-400 rounded"
                    />
                    <label className="text-sm font-medium text-gray-300">Enable Perpetual Bull Runs</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.enableTraderRewards}
                      onChange={(e) => setFormData(prev => ({ ...prev, enableTraderRewards: e.target.checked }))}
                      className="w-4 h-4 text-emerald-400 rounded"
                    />
                    <label className="text-sm font-medium text-gray-300">Enable Trader Rewards</label>
                  </div>
                </div>
              </div>
            </div>
          

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-3 disabled:opacity-50"
              >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white animate-spin"></div>
                  <span>Creating Token...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>Create Token</span>
                </div>
              )}
            </Button>
          </div>
        </form>
            </CardContent>
          </Card>

          {/* Result Display */}
          {createdToken && (
            <Card className={`${
              createdToken.success 
                ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30' 
                : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30'
            } backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 text-lg font-bold ${
                  createdToken.success ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {createdToken.success ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>Token Created Successfully!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6" />
                      <span>Creation Failed</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 rounded-lg border-emerald-500/20">
                    <p className="text-sm font-medium text-emerald-300">Token Address</p>
                    <p className="font-mono text-white text-lg">{createdToken.tokenAddress}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-lg border-emerald-500/20">
                    <p className="text-sm font-medium text-emerald-300">Transaction Signature</p>
                    <p className="font-mono text-white text-sm break-all">{createdToken.txSignature}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-4 pt-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        Bull Runs Enabled
                      </Badge>
                      {formData.enableTraderRewards && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          <Gift className="w-3 h-3 mr-1" />
                          Rewards Active
                        </Badge>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border-blue-500/20">
                    <p className="text-sm font-medium text-blue-300">Next Bull Run</p>
                    <p className="text-xs text-blue-400">
                      {formData.enableBullRuns 
                        ? `In ${formatFrequency(formData.bullRunFrequency)}`
                        : 'Disabled'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg border-blue-500/20">
                    <p className="text-xs text-blue-400">Next Reward Distribution</p>
                    <p className="text-xs text-blue-400">
                      {formData.enableTraderRewards 
                        ? `${formatBps(formData.traderRewardBps)} of fees`
                        : 'Disabled'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border-green-500/20">
                    <p className="text-sm font-medium text-green-300">Creator Fees Earned</p>
                    <p className="text-xs text-green-400">
                      {formData.enableBullRuns 
                        ? `Every ${formatFrequency(formData.bullRunFrequency)} from ${formatBps(formData.creatorFeeBps)}`
                        : 'Disabled'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    <a 
                      href={`https://pumpportal.fun/token/${createdToken.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline"
                    >
                      View on PumpPortal
                    </a>
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setCreatedToken(null)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Create Another Token
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-blue-400">
                  <Target className="w-5 h-5" />
                  <span>Bull Runs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-2">Automatic price increases</p>
                <p className="text-xs text-gray-400">
                  {formData.enableBullRuns 
                    ? `Every ${formatFrequency(formData.bullRunFrequency)}` 
                    : 'Disabled'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-orange-400">
                  <Gift className="w-5 h-5" />
                  <span>Trader Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-2">Share profits with traders</p>
                <p className="text-xs text-gray-400">
                  {formData.enableTraderRewards 
                    ? `${formatBps(formData.traderRewardBps)} of fees` 
                    : 'Disabled'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                  <span>Creator Fees</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-2">Earn from every transaction</p>
                <p className="text-xs text-gray-400">
                  {formData.enableBullRuns 
                    ? `Every ${formatFrequency(formData.bullRunFrequency)} from ${formatBps(formData.creatorFeeBps)}`
                    : 'Disabled'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl font-black">
                  <Shield className="w-6 h-6" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-2">Anti-bot and anti-rug measures</p>
                <p className="text-xs text-gray-400">Built-in protection against snipe bots</p>
                <p className="text-xs text-gray-400">Liquidity lock period</p>
                <p className="text-xs text-gray-400">Transparent transaction history</p>
                </CardContent>
            </Card>
          </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-emerald-500/20 backdrop-blur-sm bg-black/40 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400 font-mono text-xs">Powered by BullBall Protocol</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-bold tracking-wide">CREATE MODE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
