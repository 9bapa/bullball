'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Zap, 
  TrendingUp, 
  Gift, 
  Wallet, 
  Settings, 
  ChevronRight,
  Rocket,
  Target,
  Shield,
  Coins,
  Timer,
  Users,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import Image from 'next/image'

export default function CreateTokenPage() {
  const [mounted, setMounted] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    description: '',
    twitterUrl: '',
    telegramUrl: '',
    websiteUrl: '',
    imageUrl: '',
    pumpportalWallet: '',
    pumpportalApiKey: '',
    payerPrivateKey: '',
    liquidityAmount: '0.5',
    bullRunFrequency: '2',
    traderRewardPercentage: '10',
    autoBurnEnabled: true,
    stealthMode: false
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleToggle = (field: string) => {
    setFormData({
      ...formData,
      [field]: !formData[field as keyof typeof formData]
    })
  }

  const handleCreateToken = async () => {
    setIsCreating(true)
    // Simulate token creation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsCreating(false)
    alert('Token created successfully! 🚀')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
                <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Create Token
                </h1>
                <p className="text-sm text-emerald-400/80 font-mono font-semibold tracking-wider">BullBall Method • Perpetual Bull Runs</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-purple-500/20 border-emerald-500/30 text-emerald-400">
                <Rocket className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction Card */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                Create Your BullBall Token
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Auto Bull Runs</p>
                    <p className="text-xs text-gray-400">Every 2 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-semibold text-purple-400">Trader Rewards</p>
                    <p className="text-xs text-gray-400">Share profits</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-semibold text-orange-400">Perpetual Growth</p>
                    <p className="text-xs text-gray-400">Compound gains</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Creation Form */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Token Name</label>
                  <input
                    type="text"
                    name="tokenName"
                    value={formData.tokenName}
                    onChange={handleInputChange}
                    placeholder="e.g., MoonRocket"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Token Symbol</label>
                  <input
                    type="text"
                    name="tokenSymbol"
                    value={formData.tokenSymbol}
                    onChange={handleInputChange}
                    placeholder="e.g., MOON"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-emerald-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your token's vision and mission..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Twitter URL</label>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/yourtoken"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Telegram URL</label>
                  <input
                    type="url"
                    name="telegramUrl"
                    value={formData.telegramUrl}
                    onChange={handleInputChange}
                    placeholder="https://t.me/yourtoken"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-emerald-400">Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://yourtoken.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-emerald-400">Token Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/token-image.png"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </CardContent>
          </Card>

          {/* BullBall Configuration */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">BullBall Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Initial Liquidity (SOL)</label>
                  <input
                    type="number"
                    name="liquidityAmount"
                    value={formData.liquidityAmount}
                    onChange={handleInputChange}
                    placeholder="0.5"
                    step="0.1"
                    min="0.1"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-400">Minimum 0.1 SOL required</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Bull Run Frequency (minutes)</label>
                  <input
                    type="number"
                    name="bullRunFrequency"
                    value={formData.bullRunFrequency}
                    onChange={handleInputChange}
                    placeholder="2"
                    min="1"
                    max="60"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-400">How often to trigger bull runs</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-emerald-400">Trader Reward Percentage (%)</label>
                <input
                  type="number"
                  name="traderRewardPercentage"
                  value={formData.traderRewardPercentage}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <p className="text-xs text-gray-400">Percentage of profits to share with traders</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Auto Burn LP Tokens</p>
                    <p className="text-xs text-gray-400">Automatically burn liquidity pool tokens</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('autoBurnEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${formData.autoBurnEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.autoBurnEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black text-white">Advanced Settings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-gray-400 hover:text-white"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">PumpPortal Wallet</label>
                  <input
                    type="text"
                    name="pumpportalWallet"
                    value={formData.pumpportalWallet}
                    onChange={handleInputChange}
                    placeholder="Your PumpPortal wallet public key"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">PumpPortal API Key</label>
                  <input
                    type="password"
                    name="pumpportalApiKey"
                    value={formData.pumpportalApiKey}
                    onChange={handleInputChange}
                    placeholder="Your PumpPortal API key"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-emerald-400">Payer Private Key</label>
                  <div className="relative">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      name="payerPrivateKey"
                      value={formData.payerPrivateKey}
                      onChange={handleInputChange}
                      placeholder="Base58 encoded private key for 0.035 SOL fee"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Required for token creation fee (0.035 SOL)</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Stealth Mode</p>
                      <p className="text-xs text-gray-400">Hide token from public listings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('stealthMode')}
                    className={`w-12 h-6 rounded-full transition-colors ${formData.stealthMode ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.stealthMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                  </button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Fee Breakdown */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-sm text-gray-400">Token Creation</span>
                  <span className="text-sm font-semibold text-emerald-400">0.035 SOL</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-sm text-gray-400">Initial Liquidity</span>
                  <span className="text-sm font-semibold text-emerald-400">{formData.liquidityAmount} SOL</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-sm text-gray-400">Platform Fee</span>
                  <span className="text-sm font-semibold text-emerald-400">1% (0.001 SOL)</span>
                </div>
                <div className="border-t border-slate-600/30 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-white">Total Required</span>
                    <span className="text-lg font-black text-emerald-400">{(parseFloat(formData.liquidityAmount) + 0.036).toFixed(3)} SOL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCreateToken}
              disabled={isCreating || !formData.tokenName || !formData.tokenSymbol}
              className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Token...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Create BullBall Token
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-emerald-500/20 backdrop-blur-sm bg-black/40 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400 font-mono text-xs">Powered by BullBall Method</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-bold tracking-wide">CREATE MODE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}