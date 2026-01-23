'use client'

import { useState, useEffect } from 'react'

export function useSolanaPrice() {
  const [solPrice, setSolPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        // Using our own API to avoid CORS and rate limiting
        const response = await fetch('/api/sol-price')
        const data = await response.json()
        setSolPrice(data.solana?.usd || 128.17) // fallback price
      } catch (error) {
        console.error('Error fetching SOL price:', error)
        setSolPrice(128.17) // fallback price
      } finally {
        setLoading(false)
      }
    }

    fetchSolPrice()
    
    // Update price every 2 minutes to avoid rate limiting
    const interval = setInterval(fetchSolPrice, 120000)
    
    return () => clearInterval(interval)
  }, [])

  return { solPrice, loading }
}