"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Star, Zap, Flame, TrendingUp, Diamond, X, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"
import { useCartStore } from "@/store/cart"
import { productService, ProductWithVariants, ProductVariant } from "@/services/product.service"

export function AllProductsSection() {
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [modalImage, setModalImage] = useState<string | null>(null)
  const { addItem, getItemById } = useCartStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts()
        setProducts(data)
        
        // Set default selected variants
        const defaultVariants: Record<string, string> = {}
        data.forEach(product => {
          if (product.variants && product.variants.length > 0) {
            defaultVariants[product.id] = product.variants[0].id
          }
        })
        setSelectedVariants(defaultVariants)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleQuickBuy = async (product: ProductWithVariants) => {
    const selectedVariantId = selectedVariants[product.id]
    
    let selectedVariant: ProductVariant | null = null
    
    if (product.variants && product.variants.length > 0) {
      // Product has variants - check if one is selected
      if (!selectedVariantId) return
      selectedVariant = product.variants?.find(v => v.id === selectedVariantId) || null
      if (!selectedVariant) return
    } else {
      // Product has no variants - skip variant logic for simple products
      selectedVariant = null
    }
    
    try {
      await addItem(product, selectedVariant, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const getQuantityInCart = (productId: string, variantId: string) => {
    const cartItemId = `${productId}-${variantId}`
    const item = getItemById(cartItemId)
    return item?.quantity || 0
  }

  const getStockStatus = (product: ProductWithVariants) => {
    const selectedVariantId = selectedVariants[product.id]
    const selectedVariant = product.variants?.find(v => v.id === selectedVariantId)
    
    // Check variant stock first, then fall back to main product inventory
    let stock = 0
    if (selectedVariant) {
      stock = selectedVariant.stock_quantity || 0
    } else if (product.variants && product.variants.length > 0) {
      // If variants exist but none selected, use first variant
      stock = product.variants[0].stock_quantity || 0
    } else {
      // No variants, use main product inventory
      stock = (product.inventory_quantity !== null && product.inventory_quantity !== undefined) ? product.inventory_quantity : 999
    }
    
    if (stock === 0) return { text: '💀 Sold Out', inStock: false, emoji: '💀' }
    if (stock < 5) return { text: `🔥 Only ${stock} left!`, inStock: true, emoji: '🔥' }
    if (stock < 10) return { text: '⚡ In Stock', inStock: true, emoji: '⚡' }
    return { text: '💎 In Stock', inStock: true, emoji: '💎' }
  }

  const getMemeBadge = (productName: string) => {
    const name = productName.toLowerCase()
    if (name.includes('bull') || name.includes('rhino')) return { badge: '🐂 BULL', color: 'text-orange-400' }
    if (name.includes('ape') || name.includes('monkey')) return { badge: '🦍 APE', color: 'text-purple-400' }
    if (name.includes('pepe') || name.includes('frog')) return { badge: '🐸 PEPE', color: 'text-green-400' }
    if (name.includes('doge') || name.includes('dog')) return { badge: '🐕 DOGE', color: 'text-yellow-400' }
    if (name.includes('cat') || name.includes('kitty')) return { badge: '🐈 CAT', color: 'text-pink-400' }
    if (Math.random() > 0.7) return { badge: '🚀 MOONING', color: 'text-blue-400' }
    if (Math.random() > 0.8) return { badge: '💎 DIAMOND', color: 'text-cyan-400' }
    return { badge: '⭐ RARE', color: 'text-purple-300' }
  }

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              🚀 WAGMI MERCH DROPS 🚀
            </span>
            <div className="text-lg text-gray-300 mt-2 font-normal">
              Cop the freshest drip before it moons 🌙✨
            </div>
          </h2>
          {/* Mobile 2-column skeleton */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-meme-gray/50 backdrop-blur-sm rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-meme-gray/30 rounded-lg mb-3"></div>
                <div className="h-4 bg-meme-gray/30 rounded mb-2"></div>
                <div className="h-3 bg-meme-gray/30 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          {/* Desktop skeleton */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-meme-gray/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                <div className="aspect-square bg-meme-gray/30 rounded-xl mb-4"></div>
                <div className="h-6 bg-meme-gray/30 rounded mb-2"></div>
                <div className="h-4 bg-meme-gray/30 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">
          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            💎 DIAMOND HANDS COLLECTION 💎
          </span>
          <div className="text-lg text-gray-300 mt-2 font-normal">
            These ain't ya regular swag fr fr 🔥
          </div>
        </h2>

        {/* Mobile Layout - 2-Column Grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {products.map((product, index) => {
            const selectedVariantId = selectedVariants[product.id]
            const selectedVariant = product.variants?.find(v => v.id === selectedVariantId)
            const finalPrice = product.base_price + (selectedVariant?.price_adjustment || 0)
            const quantity = getQuantityInCart(product.id, selectedVariantId || '')
            const stockStatus = getStockStatus(product)
            const memeBadge = getMemeBadge(product.name)
            const isTrending = Math.random() > 0.6
            const isRare = Math.random() > 0.8

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: [0, 1, -1, 0],
                  transition: { duration: 0.2 }
                }}
                className={`bg-gradient-to-br from-meme-gray/60 to-meme-gray/40 backdrop-blur-md rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-meme-purple/20 transition-all duration-300 border border-meme-purple/20 ${isRare ? 'ring-2 ring-yellow-400/50' : ''}`}
              >
                {/* Product Image - Compact for mobile */}
                <div className="aspect-square bg-meme-gray/30 relative overflow-hidden group">
                  {product.image_url ? (
                    <>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                        onClick={() => setModalImage(product.image_url || null)}
                      />
                      {/* Expand Icon */}
                      <button
                        onClick={() => setModalImage(product.image_url || null)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity duration-200"
                        title="Click to enlarge image"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Click to enlarge
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-meme-purple/20 to-meme-blue/20 flex items-center justify-center">
                      <div className="text-6xl animate-bounce">🎯</div>
                    </div>
                  )}
                  
                  {/* Meme Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isTrending && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        HOT
                      </div>
                    )}
                    {isRare && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                        <Diamond className="w-3 h-3" />
                        RARE
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <div className={`bg-black/80 text-white px-2 py-1 rounded-full text-xs font-bold ${memeBadge.color}`}>
                      {memeBadge.badge}
                    </div>
                  </div>

                  {!stockStatus.inStock && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">💀</div>
                        <span className="text-white font-bold text-sm">Sold Out</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info - Mobile Optimized */}
                <div className="p-3 bg-gradient-to-b from-transparent to-meme-purple/10">
                  {/* Product Name - Truncated for mobile */}
                  <h3 className="text-sm font-bold text-white group-hover:text-meme-purple transition-colors mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Rating - Compact with Meme Flair */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" />
                      <span className="text-xs text-white/80">4.8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-bold">{stockStatus.emoji}</span>
                    </div>
                  </div>

                  {/* Variant Selector - Mobile */}
                  {product.variants && product.variants.length > 1 && (
                    <div className="mb-2">
                      <select
                        value={selectedVariantId || ''}
                        onChange={(e) => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                        className="w-full bg-meme-gray/40 text-white text-xs rounded-lg px-2 py-1 border border-meme-purple/40 focus:border-meme-purple focus:outline-none focus:ring-2 focus:ring-meme-purple/50"
                      >
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id} className="bg-gray-800">
                            {variant.color && `${variant.color} `}
                            {variant.size && `Size ${variant.size}`}
                            {!variant.color && !variant.size && 'Standard'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price - Mobile with Meme Energy */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">
                        ${finalPrice}
                      </span>
                      {isRare && (
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full font-bold">
                          💎 DIAMOND
                        </div>
                      )}
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400 animate-bounce" />
                  </div>

                  {/* Stock Status with Meme Style */}
                  <div className="mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      stockStatus.inStock ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-400/30' : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-400/30'
                    }`}>
                      {stockStatus.text}
                    </span>
                  </div>

                  {/* Action Buttons - Mobile Layout with Meme Energy */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleQuickBuy(product)}
                      disabled={!stockStatus.inStock}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 bg-gradient-to-r from-meme-purple to-meme-purple/80 text-white px-2 py-2 rounded-lg font-bold text-xs hover:from-meme-purple/90 hover:to-meme-purple/70 transition-all duration-200 transform flex items-center justify-center gap-1 shadow-lg shadow-meme-purple/30 ${
                        !stockStatus.inStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      {quantity > 0 ? ` (${quantity})` : '🚀 Buy'}
                    </motion.button>
                    <motion.button
                      onClick={() => handleQuickBuy(product)}
                      disabled={!stockStatus.inStock}
                      whileHover={{ scale: 1.05, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-r from-meme-gray/40 to-meme-gray/30 text-white p-2 rounded-lg hover:from-meme-gray/50 hover:to-meme-gray/40 transition-all duration-200 transform shadow-lg ${
                        !stockStatus.inStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop Layout - Single Column Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => {
            const selectedVariantId = selectedVariants[product.id]
            const selectedVariant = product.variants?.find(v => v.id === selectedVariantId)
            const finalPrice = product.base_price + (selectedVariant?.price_adjustment || 0)
            const quantity = getQuantityInCart(product.id, selectedVariantId || '')
            const stockStatus = getStockStatus(product)
            const memeBadge = getMemeBadge(product.name)
            const isTrending = Math.random() > 0.6
            const isRare = Math.random() > 0.8

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260
                }}
                whileHover={{ 
                  scale: 1.03,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className={`bg-gradient-to-br from-meme-gray/60 to-meme-gray/40 backdrop-blur-md rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-meme-purple/25 transition-all duration-400 border border-meme-purple/20 ${!stockStatus.inStock ? 'opacity-60 grayscale' : ''} ${isRare ? 'ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-meme-gray' : ''}`}
              >
                {/* Product Image */}
                <div className="aspect-square bg-meme-gray/30 relative overflow-hidden group">
                  {product.image_url ? (
                    <>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                        onClick={() => setModalImage(product.image_url || null)}
                      />
                      {/* Expand Icon */}
                      <button
                        onClick={() => setModalImage(product.image_url || null)}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity duration-200"
                        title="Click to enlarge image"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Click to enlarge
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-meme-purple/30 to-meme-blue/30 flex items-center justify-center">
                      <div className="text-8xl animate-bounce">🎯</div>
                    </div>
                  )}
                  
                  {/* Desktop Meme Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isTrending && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-1 shadow-lg">
                        <Flame className="w-4 h-4" />
                        🔥 HOT
                      </div>
                    )}
                    {isRare && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-1 shadow-lg">
                        <Diamond className="w-4 h-4" />
                        💎 RARE
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <div className={`bg-black/90 text-white px-3 py-1 rounded-full text-sm font-bold ${memeBadge.color} shadow-lg`}>
                      {memeBadge.badge}
                    </div>
                  </div>

                  {!stockStatus.inStock && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-3">💀</div>
                        <span className="text-white font-bold text-lg">Sold Out</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 bg-gradient-to-b from-transparent to-meme-purple/10">
                  {/* Product Name and Row Layout */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-meme-purple transition-colors flex-1 mr-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                        <span className="text-sm text-white/80 font-medium">4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400 font-bold">{stockStatus.emoji}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variant Selector */}
                  {product.variants && product.variants.length > 1 && (
                    <div className="mb-4">
                      <select
                        value={selectedVariantId || ''}
                        onChange={(e) => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                        className="w-full bg-meme-gray/40 text-white rounded-lg px-3 py-2 border border-meme-purple/40 focus:border-meme-purple focus:outline-none focus:ring-2 focus:ring-meme-purple/50"
                      >
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id} className="bg-gray-800">
                            {variant.color && `${variant.color} `}
                            {variant.size && `Size ${variant.size}`}
                            {!variant.color && !variant.size && 'Standard'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price with Meme Energy */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">
                        ${finalPrice}
                      </span>
                      {isRare && (
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm px-3 py-1 rounded-full font-bold animate-pulse">
                          💎 DIAMOND
                        </div>
                      )}
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400 animate-bounce" />
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      stockStatus.inStock ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-400/30' : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-400/30'
                    }`}>
                      {stockStatus.text}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => handleQuickBuy(product)}
                      disabled={!stockStatus.inStock}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 bg-gradient-to-r from-meme-purple to-meme-purple/80 text-white px-4 py-3 rounded-xl font-bold hover:from-meme-purple/90 hover:to-meme-purple/70 transition-all duration-200 transform flex items-center justify-center gap-2 shadow-lg shadow-meme-purple/30 ${
                        !stockStatus.inStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {quantity > 0 ? `In Cart (${quantity})` : '🚀 Quick Buy'}
                    </motion.button>
                    <motion.button
                      onClick={() => handleQuickBuy(product)}
                      disabled={!stockStatus.inStock}
                      whileHover={{ scale: 1.05, rotate: 180 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-r from-meme-gray/40 to-meme-gray/30 text-white p-3 rounded-xl hover:from-meme-gray/50 hover:to-meme-gray/40 transition-all duration-200 transform shadow-lg ${
                        !stockStatus.inStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      </section>

      {/* Image Modal */}
      {modalImage && (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-200 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <img
              src={modalImage || ''}
              alt="Product full size"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}