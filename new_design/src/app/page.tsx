'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Star, TrendingUp, Flame, Zap, Crown } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  sold: number
  stock: number
  badge?: 'hot' | 'new' | 'limited'
}

interface CartItem {
  product: Product
  quantity: number
}

export default function BullRhunHome() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCartOpen, setIsCartOpen] = useState(false)

  const products: Product[] = [
    {
      id: '1',
      name: 'BullRhun Classic Tee',
      price: 29.99,
      image: '/api/placeholder/300/300',
      category: 'apparel',
      rating: 4.8,
      sold: 1247,
      stock: 53,
      badge: 'hot'
    },
    {
      id: '2',
      name: 'Golden Bull Hoodie',
      price: 59.99,
      image: '/api/placeholder/300/300',
      category: 'apparel',
      rating: 4.9,
      sold: 892,
      stock: 12,
      badge: 'limited'
    },
    {
      id: '3',
      name: 'Rhino Strike Cap',
      price: 19.99,
      image: '/api/placeholder/300/300',
      category: 'accessories',
      rating: 4.6,
      sold: 623,
      stock: 145
    },
    {
      id: '4',
      name: 'BullRun Phone Case',
      price: 14.99,
      image: '/api/placeholder/300/300',
      category: 'tech',
      rating: 4.5,
      sold: 445,
      stock: 89,
      badge: 'new'
    },
    {
      id: '5',
      name: 'Charging Bull Poster',
      price: 24.99,
      image: '/api/placeholder/300/300',
      category: 'collectibles',
      rating: 4.7,
      sold: 234,
      stock: 67
    },
    {
      id: '6',
      name: 'BullRhun Premium Tank',
      price: 34.99,
      image: '/api/placeholder/300/300',
      category: 'apparel',
      rating: 4.8,
      sold: 1567,
      stock: 23,
      badge: 'hot'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Products', icon: Flame },
    { id: 'apparel', name: 'Apparel', icon: Crown },
    { id: 'accessories', name: 'Accessories', icon: Zap },
    { id: 'tech', name: 'Tech', icon: TrendingUp },
    { id: 'collectibles', name: 'Collectibles', icon: Star }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'hot': return 'bg-red-500 text-white'
      case 'new': return 'bg-green-500 text-white'
      case 'limited': return 'bg-yellow-500 text-black'
      default: return ''
    }
  }

  const getStockColor = (stock: number) => {
    if (stock <= 10) return 'text-red-400'
    if (stock <= 50) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-red-500/20 backdrop-blur-sm bg-black/40 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-red-500/25">
                🐂
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-red-400 via-yellow-400 to-red-600 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'Orbitron, monospace' }}>
                  BullRhun
                </h1>
                <p className="text-xs text-red-400/80 font-mono font-semibold tracking-wider">MEME COIN MERCH</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                asChild
                variant="outline" 
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold"
              >
                <a href="/dashboard">📊 Dashboard</a>
              </Button>
              <Button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-black font-bold relative"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 text-center px-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <Badge className="bg-yellow-500 text-black text-sm font-bold px-4 py-2 mb-4">
              🔥 LIMITED TIME DROP
            </Badge>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-red-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent leading-tight">
            CHARGE WITH
            <br />
            <span className="text-5xl md:text-7xl lg:text-8xl">BULLRHUN</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Premium meme coin merch for the true bulls. 
            <span className="text-yellow-400 font-semibold"> Ride the wave</span>, 
            <span className="text-red-400 font-semibold"> HODL the style</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-black font-bold text-lg px-8 py-4">
              <Flame className="w-5 h-5 mr-2" />
              SHOP NOW
            </Button>
            <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 font-bold text-lg px-8 py-4">
              <TrendingUp className="w-5 h-5 mr-2" />
              VIEW RANKINGS
            </Button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`flex items-center space-x-2 whitespace-nowrap ${
                    selectedCategory === category.id 
                      ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-black font-bold' 
                      : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="container mx-auto px-4 pb-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-gradient-to-br from-red-950/20 to-yellow-950/20 border-red-500/30 backdrop-blur-sm hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 group overflow-hidden">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-red-900/20 to-yellow-900/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-6xl opacity-20">🐂</div>
                  </div>
                  {product.badge && (
                    <Badge className={`absolute top-3 left-3 ${getBadgeColor(product.badge)} text-xs font-bold`}>
                      {product.badge.toUpperCase()}
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center space-x-1 bg-black/60 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-white font-bold">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-yellow-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-yellow-400">
                        ${product.price}
                      </p>
                      <p className={`text-sm font-semibold ${getStockColor(product.stock)}`}>
                        {product.stock} left
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{product.sold} sold</span>
                    <span className="text-red-400 font-semibold">
                      {product.stock <= 10 ? '⚠️ Low Stock' : '✅ In Stock'}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-black font-bold"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? 'SOLD OUT' : 'ADD TO CART'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-sm border-l border-red-500/30 transform transition-transform duration-300 z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-red-400">Shopping Cart</h3>
            <Button 
              onClick={() => setIsCartOpen(false)}
              variant="ghost" 
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-4 p-3 bg-red-950/20 rounded-lg border border-red-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-red-900/20 to-yellow-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl opacity-50">🐂</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{item.product.name}</h4>
                  <p className="text-yellow-400 font-bold">${item.product.price}</p>
                  <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t border-red-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-white">Total:</span>
              <span className="text-2xl font-black text-yellow-400">${getTotalPrice().toFixed(2)}</span>
            </div>
            <Button className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-black font-bold">
              CHECKOUT
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-red-500/20 backdrop-blur-sm bg-black/40 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400 font-mono text-xs">
              🐂 BullRhun © 2024 | Meme Coin Merch
            </p>
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-bold tracking-wide">CHARGING THE MARKET</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}