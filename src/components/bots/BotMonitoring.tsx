'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface BotMetrics {
  cpu_usage: number
  memory_usage: number
  network_latency: number
  trades_per_minute: number
  error_rate: number
  uptime_percentage: number
}

interface BotLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: any
}

interface BotMonitoringProps {
  botId: string
  botName: string
  isRunning: boolean
}

export function BotMonitoring({ botId, botName, isRunning }: BotMonitoringProps) {
  const [metrics, setMetrics] = useState<BotMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    network_latency: 0,
    trades_per_minute: 0,
    error_rate: 0,
    uptime_percentage: 0
  })

  const [logs, setLogs] = useState<BotLog[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      fetchMetrics()
      fetchLogs()
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isRunning, botId])

  const fetchMetrics = async () => {
    try {
      // Mock metrics - replace with actual API
      const mockMetrics: BotMetrics = {
        cpu_usage: Math.random() * 100,
        memory_usage: 40 + Math.random() * 40,
        network_latency: 10 + Math.random() * 50,
        trades_per_minute: Math.floor(Math.random() * 10),
        error_rate: Math.random() * 5,
        uptime_percentage: 95 + Math.random() * 5
      }
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching bot metrics:', error)
    }
  }

  const fetchLogs = async () => {
    try {
      // Mock logs - replace with actual API
      const mockLogs: BotLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Bot monitoring check completed',
          details: { cpu: metrics.cpu_usage, memory: metrics.memory_usage }
        },
        ...(Math.random() > 0.8 ? [{
          id: '2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'warning',
          message: 'High memory usage detected',
          details: { memory_usage: metrics.memory_usage }
        }] : []),
        ...(Math.random() > 0.9 ? [{
          id: '3',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'error',
          message: 'Trade execution failed',
          details: { error: 'Insufficient liquidity' }
        }] : [])
      ]
      setLogs(mockLogs.slice(0, 10)) // Keep only last 10 logs
    } catch (error) {
      console.error('Error fetching bot logs:', error)
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/20 text-red-400 border-red-400/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'success': return 'bg-green-500/20 text-green-400 border-green-400/30'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-400/30'
    }
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-3 h-3" />
      case 'warning': return <Minus className="w-3 h-3" />
      case 'success': return <TrendingUp className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const getStatusColor = (value: number, type: 'cpu' | 'memory' | 'error') => {
    if (type === 'cpu' || type === 'memory') {
      if (value > 80) return 'text-red-400'
      if (value > 60) return 'text-yellow-400'
      return 'text-green-400'
    }
    if (type === 'error') {
      if (value > 5) return 'text-red-400'
      if (value > 2) return 'text-yellow-400'
      return 'text-green-400'
    }
    return 'text-white'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-3 h-3 text-green-400" />
    if (current < previous) return <TrendingDown className="w-3 h-3 text-red-400" />
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  if (!isRunning) {
    return (
      <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <WifiOff className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-400">Bot is not running</p>
            <p className="text-sm text-gray-500">Start the bot to see monitoring data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {botName} Monitoring
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-neon-purple"
              size="sm"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
            <Button
              onClick={() => {
                fetchMetrics()
                fetchLogs()
              }}
              className="btn-neon-green"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Cpu className="w-6 h-6 text-meme-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">CPU Usage</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${getStatusColor(metrics.cpu_usage, 'cpu')}`}>
                  {metrics.cpu_usage.toFixed(1)}%
                </p>
                {getTrendIcon(metrics.cpu_usage, metrics.cpu_usage - 5)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <HardDrive className="w-6 h-6 text-meme-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Memory Usage</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${getStatusColor(metrics.memory_usage, 'memory')}`}>
                  {metrics.memory_usage.toFixed(1)}%
                </p>
                {getTrendIcon(metrics.memory_usage, metrics.memory_usage - 2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Wifi className="w-6 h-6 text-meme-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Network Latency</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${metrics.network_latency > 100 ? 'text-red-400' : 'text-green-400'}`}>
                  {metrics.network_latency.toFixed(0)}ms
                </p>
                {getTrendIcon(metrics.network_latency, metrics.network_latency - 10)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Zap className="w-6 h-6 text-meme-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Trades/Min</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-white">
                  {metrics.trades_per_minute}
                </p>
                {getTrendIcon(metrics.trades_per_minute, metrics.trades_per_minute - 1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-meme-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Error Rate</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${getStatusColor(metrics.error_rate, 'error')}`}>
                  {metrics.error_rate.toFixed(1)}%
                </p>
                {getTrendIcon(metrics.error_rate, metrics.error_rate - 0.5)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Clock className="w-6 h-6 text-meme-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Uptime</p>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${metrics.uptime_percentage > 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {metrics.uptime_percentage.toFixed(1)}%
                </p>
                {getTrendIcon(metrics.uptime_percentage, metrics.uptime_percentage - 0.5)}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-meme-purple/20 pt-6">
            <h4 className="text-md font-bold text-white mb-4">Recent Logs</h4>
            
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-400">No recent logs</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${getLogColor(log.level)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${getLogColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-white break-words">
                        {log.message}
                      </p>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                            Show Details
                          </summary>
                          <pre className="text-xs text-gray-300 mt-2 bg-black/20 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}