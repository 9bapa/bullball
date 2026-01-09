'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { orderService } from '@/services/order.service'
import { formatNumber } from '@/lib/utils'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { AdminProtectedRoute } from '@/components/wallet_solana/AdminGate'

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders()
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-meme-gray via-purple-900 to-meme-gray">
        <SharedHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black font-mono text-white mb-8">📦 Orders Management</h1>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-t-2 border-meme-purple"></div>
                  <p className="text-white mt-4">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <Card className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <p className="text-white text-lg">No orders found</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="bg-meme-gray/80 border-meme-purple/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Order ID</p>
                          <p className="text-white font-mono">{order.id}</p>
                        </div>
                        <div>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                            Processing
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Customer</p>
                          <p className="text-white font-mono">{order.user_id.slice(0, 8)}...{order.user_id.slice(-8)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Amount</p>
                          <p className="text-white font-mono">{formatNumber(order.total_amount)} SOL</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Date</p>
                        <p className="text-white font-mono">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
        
        <SharedFooter />
      </div>
    </AdminProtectedRoute>
  )
}