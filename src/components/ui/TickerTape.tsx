'use client'

import { useState, useEffect } from 'react'

interface BullRhunToken {
  symbol: string
  name: string
  price: string
  change: number
  volume: string
  marketCap: string
  address: string
  pumpFunLink: string
  memeMessage: string
}

interface TickerProps {
  className?: string
}

const memeMessages = [
  "🚀 To the moon!",
  "💎 Diamond hands", 
  "🦍 Bull run incoming",
  "🌕 Lambo's soon",
  "🏕 Trench life over",
  "💰 Get rich or die trenching",
  "🎯 We're all gonna make it",
  "🔥 WAGMI - We're All Gonna Make It",
  "🌊 Wave surfing the charts",
  "💫 To infinity and beyond",
  "🎪 BullRhun circus in town",
  "🎯 Paper hands sold early lol",
  "🍕 Diamond hands eat pizza",
  "🏖️ Lambo beach incoming",
  "🎭 When Lambo?"
];

export function TickerTape({ className = '' }: TickerProps) {
  const [bullrhunToken, setBullrhunToken] = useState<BullRhunToken | null>(null)

  const [isPaused, setIsPaused] = useState(false)

  // Fetch real token data from API
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch('/api/tokens/2XioaBY8RkPnocb2ym7dSuGsDZbxbrYsoTcUHf8X')
        if (response.ok) {
          const data = await response.json()
          if (data.token) {
            const token = data.token
            setBullrhunToken({
              symbol: 'BULLRHUN',
              name: 'BullRhun', 
              price: token.price ? token.price.toString() : '0.00000000',
              change: 0, // Will calculate from previous price
              volume: token.volume_24h ? `$${(token.volume_24h / 1000000).toFixed(1)}M` : '$0M',
              marketCap: token.market_cap ? `$${(token.market_cap / 1000000).toFixed(1)}M` : '$0M',
              address: token.mint,
              pumpFunLink: `https://pump.fun/coin/${token.mint}`,
              memeMessage: memeMessages[0]
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch token data:', error)
      }
    }

    fetchTokenData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTokenData, 30000)
    
    return () => clearInterval(interval)
  }, [isPaused])

  // Create multiple instances for seamless scroll
  const tickerItems = bullrhunToken ? Array(6).fill(bullrhunToken) : []

  const handlePumpFunClick = () => {
    if (bullrhunToken?.pumpFunLink) {
      window.open(bullrhunToken.pumpFunLink, '_blank')
    }
  }

  return (
    <div 
      className={`ticker-container ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`ticker-content ${isPaused ? 'paused' : ''}`}>
        {tickerItems.map((token, index) => (
          <div 
            key={`${token.symbol}-${index}`} 
            className="flex items-center gap-4 px-6 py-3 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={handlePumpFunClick}
          >
            {/* Change Indicator */}
            <div className={`
              flex items-center gap-1 font-bold font-mono
              ${token.change > 0 ? 'text-meme-green' : 'text-meme-red'}
            `}>
              {token.change > 0 ? '▲' : '▼'}
              {Math.abs(token.change).toFixed(1)}%
            </div>
            
            {/* Token Info */}
            <div className="flex items-center gap-2">
              <span className="text-white font-bold font-mono">${token.symbol}</span>
              <span className="text-gray-400 text-sm hidden sm:inline">{token.name}</span>
            </div>
            
            {/* Price */}
            <span className="text-white font-mono">${token.price}</span>
            
            {/* Meme Message */}
            <span className="text-meme-green font-medium hidden md:inline text-sm">
              {token.memeMessage}
            </span>
            
            {/* Market Cap */}
            <span className="text-gray-400 text-sm hidden lg:inline">MC: {token.marketCap}</span>
            
            {/* Volume */}
            <span className="text-gray-400 text-sm hidden xl:inline">Vol: {token.volume}</span>
            
            {/* Trending Indicators */}
            <div className="flex items-center gap-2">
              {Math.abs(token.change) > 15 && (
                <span className="badge-trending text-xs">🔥 HOT</span>
              )}
              {Math.abs(token.change) > 25 && (
                <span className="badge-trending text-xs">🚀 MOONING</span>
              )}
              {token.change > 20 && (
                <span className="badge-trending text-xs">🦍 BULL MODE</span>
              )}
              <span className="badge-trending text-xs group-hover:text-meme-purple">
                🌊 pump.fun
              </span>
            </div>
            
            {/* External Link Indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg 
                className="w-4 h-4 text-meme-purple" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}