'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Sliders,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface BotConfig {
  id: string
  name: string
  type: 'trader' | 'monitor' | 'analyzer'
  config: {
    trade_amount: number
    max_trades: number
    interval: number
    min_price: number
    max_price: number
    strategy: 'aggressive' | 'conservative' | 'balanced'
  }
  enabled: boolean
  alerts: {
    price_change: boolean
    volume_spike: boolean
    error_threshold: number
  }
}

interface BotConfigModalProps {
  bot: BotConfig | null
  isOpen: boolean
  onClose: () => void
  onSave: (config: BotConfig) => void
}

export function BotConfigModal({ bot, isOpen, onClose, onSave }: BotConfigModalProps) {
  const [config, setConfig] = useState<BotConfig | null>(bot || {
    id: `bot-${Date.now()}`,
    name: '',
    type: 'trader',
    config: {
      trade_amount: 0.1,
      max_trades: 10,
      interval: 5000,
      min_price: 0,
      max_price: 0,
      strategy: 'balanced'
    },
    enabled: true,
    alerts: {
      price_change: true,
      volume_spike: true,
      error_threshold: 5
    }
  })

  if (!isOpen) return null

  const handleSave = () => {
    if (config) {
      onSave(config)
      onClose()
    }
  }

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'aggressive': return 'bg-red-500/20 text-red-400 border-red-400/30'
      case 'conservative': return 'bg-blue-500/20 text-blue-400 border-blue-400/30'
      case 'balanced': return 'bg-green-500/20 text-green-400 border-green-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-meme-gray/90 border-meme-purple/30 backdrop-blur-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader className="flex justify-between items-center border-b border-meme-purple/20">
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {bot ? 'Edit Bot Configuration' : 'Create New Bot'}
          </CardTitle>
          <Button
            onClick={onClose}
            className="btn-neon-red"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {config && (
            <>
              {/* Basic Settings */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Basic Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bot Name
                    </label>
                    <Input
                      value={config.name}
                      onChange={(e) => setConfig({
                        ...config,
                        name: e.target.value
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                      placeholder="Enter bot name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bot Type
                    </label>
                    <select
                      value={config.type}
                      onChange={(e) => setConfig({
                        ...config,
                        type: e.target.value as 'trader' | 'monitor' | 'analyzer'
                      })}
                      className="w-full bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple px-3 py-2 rounded-lg"
                    >
                      <option value="trader">Trader Bot</option>
                      <option value="monitor">Price Monitor</option>
                      <option value="analyzer">Market Analyzer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Trading Strategy */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trading Strategy
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Strategy Type
                    </label>
                    <select
                      value={config.config.strategy}
                      onChange={(e) => setConfig({
                        ...config,
                        config: {
                          ...config.config,
                          strategy: e.target.value as 'aggressive' | 'conservative' | 'balanced'
                        }
                      })}
                      className="w-full bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple px-3 py-2 rounded-lg"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="balanced">Balanced</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                    <Badge className={`mt-2 ${getStrategyColor(config.config.strategy)}`}>
                      {config.config.strategy}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Trade Amount (SOL)
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={config.config.trade_amount}
                      onChange={(e) => setConfig({
                        ...config,
                        config: {
                          ...config.config,
                          trade_amount: parseFloat(e.target.value)
                        }
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Daily Trades
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={config.config.max_trades}
                      onChange={(e) => setConfig({
                        ...config,
                        config: {
                          ...config.config,
                          max_trades: parseInt(e.target.value)
                        }
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Min Price (SOL)
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={config.config.min_price}
                      onChange={(e) => setConfig({
                        ...config,
                        config: {
                          ...config.config,
                          min_price: parseFloat(e.target.value)
                        }
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Price (SOL)
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={config.config.max_price}
                      onChange={(e) => setConfig({
                        ...config,
                        config: {
                          ...config.config,
                          max_price: parseFloat(e.target.value)
                        }
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Check Interval (ms)
                    </label>
                    <Input
                      type="number"
                      min="1000"
                      max="60000"
                      step="100"
                      value={config.config.interval}
                      onChange={(e) => setConfig({
                        ...config,
                        config: {
                          ...config.config,
                          interval: parseInt(e.target.value)
                        }
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                    />
                  </div>
                </div>
              </div>

              {/* Alerts Configuration */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alerts Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400">
                      Price Change Alerts
                    </label>
                    <Button
                      onClick={() => setConfig({
                        ...config,
                        alerts: {
                          ...config.alerts,
                          price_change: !config.alerts.price_change
                        }
                      })}
                      className={config.alerts.price_change ? 'btn-neon-green' : 'btn-neon-gray'}
                      size="sm"
                    >
                      {config.alerts.price_change ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400">
                      Volume Spike Alerts
                    </label>
                    <Button
                      onClick={() => setConfig({
                        ...config,
                        alerts: {
                          ...config.alerts,
                          volume_spike: !config.alerts.volume_spike
                        }
                      })}
                      className={config.alerts.volume_spike ? 'btn-neon-green' : 'btn-neon-gray'}
                      size="sm"
                    >
                      {config.alerts.volume_spike ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Error Threshold (consecutive errors)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={config.alerts.error_threshold}
                      onChange={(e) => setConfig({
                        ...config,
                        alerts: {
                          ...config.alerts,
                          error_threshold: parseInt(e.target.value)
                        }
                      })}
                      className="bg-meme-gray/70 text-white border-meme-purple/30 focus:border-meme-purple"
                    />
                  </div>
                </div>
              </div>

              {/* Bot Status */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Bot Status</h3>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-400">
                    Enable Bot
                  </label>
                  <Button
                    onClick={() => setConfig({
                      ...config,
                      enabled: !config.enabled
                    })}
                    className={config.enabled ? 'btn-neon-green' : 'btn-neon-red'}
                    size="sm"
                  >
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t border-meme-purple/20">
            <Button
              onClick={onClose}
              className="btn-neon-gray"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="btn-neon-purple"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface BotStatsProps {
  bot: BotConfig
}

export function BotStats({ bot }: BotStatsProps) {
  const [stats, setStats] = useState({
    total_trades: 0,
    success_rate: 0,
    profit_loss: 0,
    average_execution_time: 0,
    last_trade: null as Date | null,
    uptime: '0d 0h 0m'
  })

  return (
    <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {bot.name} Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Trades</p>
            <p className="text-xl font-bold text-white">{stats.total_trades}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Success Rate</p>
            <p className="text-xl font-bold text-green-400">{stats.success_rate}%</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">P&L (SOL)</p>
            <p className={`text-xl font-bold ${stats.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.profit_loss >= 0 ? '+' : ''}{stats.profit_loss.toFixed(4)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Avg Execution</p>
            <p className="text-xl font-bold text-white">{stats.average_execution_time}ms</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Last Trade</p>
            <p className="text-sm text-white">
              {stats.last_trade ? stats.last_trade.toLocaleString() : 'Never'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Uptime</p>
            <p className="text-xl font-bold text-white">{stats.uptime}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}