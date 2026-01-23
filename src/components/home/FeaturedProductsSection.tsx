"use client"

import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Flame, ShoppingCart, Star, Zap, Diamond, Maximize2, Package, RefreshCw, Search } from "lucide-react"
import { motion } from "framer-motion"
import { useCartStore } from "@/store/cart"
import { useUserContext } from '@/context/userContext'
import { productService, Product, ProductVariant } from "@/services/product.service"
import { ImageModal } from '@/components/product/ImageModal'
import { ProductFilter } from '@/app/page'

interface FeaturedProductsSectionProps {
  selectedFilter: ProductFilter
  onFilterChange: (filter: ProductFilter) => void
}

const filters: { id: ProductFilter; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'ALL', icon: '⭐', color: 'from-purple-500 to-pink-500' },
  { id: 'bullrun', label: 'BULLRUN', icon: '🚀', color: 'from-green-500 to-emerald-500' },
  { id: 'btc', label: 'BTC', icon: '₿', color: 'from-orange-500 to-yellow-500' },
  { id: 'eth', label: 'ETH', icon: 'Ξ', color: 'from-blue-500 to-cyan-500' },
  { id: 'bnb', label: 'BNB', icon: '◈', color: 'from-yellow-500 to-amber-500' },
  { id: 'solana', label: 'SOL', icon: '◎', color: 'from-purple-500 to-indigo-500' },
  { id: 'sui', label: 'SUI', icon: '💎', color: 'from-pink-500 to-rose-500' },
]

export function FeaturedProductsSection({ selectedFilter, onFilterChange }: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState<any>(null)
  const { addItem, getItemById } = useCartStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data: Product[]
        if (selectedFilter === 'all') {
          data = await productService.getAllProducts(true, false)
        } else {
          data = await productService.getProductsByCategory(selectedFilter, true)
        }
        const shuffledProducts = [...data].sort(() => Math.random() - 0.5)
        setProducts(shuffledProducts)
        
        const defaultVariants: Record<string, string> = {}
        data.forEach((product: Product) => {
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
  }, [selectedFilter])

  const handleQuickBuy = async (product: Product) => {
    const { publicKey } = useUserContext()
    const selectedVariantId = selectedVariants[product.id]
    
    let selectedVariant: ProductVariant | null = null
    
    if (product.variants && product.variants.length > 0) {
      if (!selectedVariantId) return
      selectedVariant = product.variants?.find(v => v.id === selectedVariantId) || null
      if (!selectedVariant) return
    } else {
      selectedVariant = null
    }
    
    try {
      await addItem(product, selectedVariant, publicKey || '',1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const getQuantityInCart = (productId: string, variantId: string) => {
    const cartItemId = `${productId}-${variantId}`
    const item = getItemById(cartItemId)
    return item?.quantity || 0
  }

  const getStockStatus = (product: Product) => {
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

  const handleImageClick = async (imageUrl: string, productId: string) => {
    try {
      // Fetch product details from Supabase
      const response = await fetch('/api/products/' + productId)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const productData = await response.json()
      console.log(productData)
      setModalProduct(productData)
      setIsModalOpen(true)
      // if (onImageClick) {
      //   onImageClick()
      // }
    } catch (error) {
      console.error('Error fetching product details:', error)
      // Fallback to basic modal with just image
      const fallbackProduct = { 
        id: productId, 
        name: 'Product Image', 
        price: 99.99, 
        image: imageUrl,
        category: 'image'
      }
      setModalProduct(fallbackProduct)
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalProduct(null)
  }

  // Filter products based on selected filter
  const filteredProducts = selectedFilter === 'all'
    ? products
    : products.filter(p => {
        const category = p.category?.toLowerCase() || p.type?.toLowerCase() || ''
        return category === selectedFilter.toLowerCase()
      })

  if (loading) {
    return (
      <section className="py-8 md:py-12 relative">
        <div className="absolute inset-0 crypto-grid opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          {/* Filter Tabs Skeleton */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <div key={filter.id} className="h-10 w-20 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Section Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 bg-muted/50 rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
              </div>
              <div className="h-8 w-48 bg-muted/50 rounded animate-pulse mb-1" />
              <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-muted/50 rounded-lg animate-pulse" />
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-muted/50 rounded-lg mb-3"></div>
                <div className="h-4 bg-muted/50 rounded mb-2"></div>
                <div className="h-3 bg-muted/50 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <section className="py-8 md:py-12 relative">
        <div className="absolute inset-0 crypto-grid opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold
                  transition-all duration-300 whitespace-nowrap
                  ${selectedFilter === filter.id
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-lg scale-105`
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-102 border border-border/30'
                  }
                `}
              >
                <span className="text-sm">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* No Products Available - Enhanced UI Kit Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
            className="py-16"
          >
            <Card className="border-2 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-xl overflow-hidden max-w-4xl mx-auto">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.2, 1], 
                    opacity: [0.3, 0.6, 0.3] 
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                <motion.div
                  className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.3, 1], 
                    opacity: [0.2, 0.5, 0.2] 
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </div>

              <CardHeader className="relative z-10 text-center pb-8">
                {/* Animated Icon Container */}
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mx-auto mb-6"
                >
                  <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full shadow-xl border-2 border-border/30">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Package className="w-12 h-12 text-primary" />
                    </motion.div>
                    {/* Pulsing Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [1, 0, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>

                <CardTitle className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4">
                  {selectedFilter === 'all' ? 'Restocking Soon' : `${selectedFilter.toUpperCase()} Section Empty`}
                </CardTitle>

                <CardDescription className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {selectedFilter === 'all' 
                    ? "We're currently updating our inventory with fresh crypto merch drops. The latest bullrun cards, hoodies, and accessories will be available shortly!"
                    : `No ${selectedFilter.toUpperCase()} themed products available right now. We're expanding our collection with new designs coming soon!`
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                {/* Feature Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                  <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-105 transition-transform">
                    <Zap className="w-3 h-3 mr-2" />
                    New Drops Coming
                  </Badge>
                  <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transition-transform">
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Restocking Now
                  </Badge>
                  <Badge className="px-4 py-2 text-sm font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105 transition-transform">
                    <Flame className="w-3 h-3 mr-2" />
                    Hot Items Expected
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => onFilterChange('all')}
                      size="lg"
                      className="h-12 px-8 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Browse All Products
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>

                  {selectedFilter !== 'all' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 px-8 font-semibold shadow-lg hover:shadow-xl border-2 hover:border-primary/50 transition-all duration-300"
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Refresh Category
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Additional Info */}
                <motion.div 
                  className="mt-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {selectedFilter === 'all' ? 'Restocking in progress' : 'Category being updated'}
                    </span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-8 md:py-12 relative">
        <div className="absolute inset-0 crypto-grid opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold
                  transition-all duration-300 whitespace-nowrap
                  ${selectedFilter === filter.id
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-lg scale-105`
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-102 border border-border/30'
                  }
                `}
              >
                <span className="text-sm">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-wider">
                  Hot Picks
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {selectedFilter === 'all' ? 'Trending Merch' : `${selectedFilter.toUpperCase()} Merch`}
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredProducts.length} items found
              </p>
            </div>
            <Button
              variant="outline"
              className="self-start sm:self-center font-mono text-sm h-10 border-2 hover:bg-primary/5"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product, index) => {
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
                  className={`bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border border-border/20 ${isRare ? 'ring-2 ring-yellow-400/50' : ''}`}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-muted/30 relative overflow-hidden group">
                    {product.image_url ? (
                      <>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                          onClick={() => handleImageClick(product.image_url || '', product.id)}
                        />
                        {/* Expand Icon */}
                          <div
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity duration-200"
                            title="Click image to enlarge"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Click to enlarge
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
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

                  {/* Product Info */}
                  <div className="p-4 bg-gradient-to-b from-transparent to-muted/10">
                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating and Stock */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" />
                        <span className="text-xs text-muted-foreground">4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-bold">{stockStatus.emoji}</span>
                      </div>
                    </div>

                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 1 && (
                      <div className="mb-3">
                        <select
                          value={selectedVariantId || ''}
                          onChange={(e) => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                          className="w-full bg-muted/40 text-foreground text-xs rounded-lg px-2 py-1 border border-border/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {product.variants.map((variant) => (
                            <option key={variant.id} value={variant.id} className="bg-background">
                              {variant.color && `${variant.color} `}
                              {variant.size && `Size ${variant.size}`}
                              {!variant.color && !variant.size && 'Standard'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
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

                    {/* Stock Status */}
                    <div className="mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        stockStatus.inStock ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-600 border border-green-400/30' : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-600 border border-red-400/30'
                      }`}>
                        {stockStatus.text}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleQuickBuy(product)}
                        disabled={!stockStatus.inStock}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-2 rounded-lg font-bold text-xs hover:from-primary/90 hover:to-primary/70 transition-all duration-200 transform flex items-center justify-center gap-1 shadow-lg shadow-primary/30 ${
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
                        className={`bg-gradient-to-r from-muted/40 to-muted/30 text-foreground p-2 rounded-lg hover:from-muted/50 hover:to-muted/40 transition-all duration-200 transform shadow-lg ${
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

          {/* Load more button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="font-mono text-sm px-8 border-2 hover:bg-primary/5"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Load More Assets
            </Button>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {modalProduct && modalProduct.id && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={modalProduct}
        />
      )}
    </>
  )
}