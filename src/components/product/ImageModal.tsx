'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, TrendingUp, TrendingDown, Clock, Flame, Share2, Package, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { useUserContext } from '@/context/userContext'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { useRealTimeCart } from '@/hooks/useRealTimeCart'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    description?: string
    type?: 'sticker' | 'hoodie' | 'shirt' | 'hat' | 'accessory'
    base_price: number
    cost_price?: number
    image?: string
    image_url?: string
    gallery_urls?: string[]
    weight_lbs?: number
    dimensions?: string
    sku?: string
    inventory_quantity?: number
    is_active?: boolean
    is_featured?: boolean
    tags?: string[]
    chain_id?: number
    created_at?: string
    updated_at?: string
    category?: string
    isNew?: boolean
    isSale?: boolean
    salePrice?: number
    rarity?: 'common' | 'uncommon' | 'rare' | 'legendary'
    priceChange?: number
    cryptoTag?: string
    volume?: number
    cryptoType?: number | string
    chain?: {
      id: number
      name: string
      symbol: string
      is_active: boolean
    }
    vendor?: {
      name: string
      email?: string
      commission_rate?: number
    }
  }
}

const rarityLabels: Record<string, string> = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
}

export function ImageModal({ isOpen, onClose, product }: ImageModalProps) {
  const { publicKey, connected } = useUserContext()
  const { addItem } = useCartStore()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  
  // Initialize real-time cart sync
  useRealTimeCart()
  

  
  const priceUp = product.priceChange && product.priceChange > 0
  const priceDown = product.priceChange && product.priceChange < 0

  if (!isOpen || !product) return null

  // Ensure price is always a number with proper type checking
  const safePrice = typeof product.base_price === 'number' ? product.base_price : 0
  const safeSalePrice = typeof product.salePrice === 'number' ? product.salePrice : null
  const displayPrice = (product.isSale && safeSalePrice) ? safeSalePrice : safePrice

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl md:max-w-7xl h-full md:h-[90vh] bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-background transition-colors group md:bg-muted/20"
              >
                <X className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Image Container */}
              <div className="flex-1 relative bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 flex items-center justify-center p-2 md:p-6">
                <motion.img
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={product.image_url}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain rounded-lg border-2 border-white/20"
                />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 backdrop-blur-sm shadow-lg animate-pulse">
                      NEW
                    </Badge>
                  )}
                  {product.rarity && product.rarity !== 'common' && (
                    <Badge className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 backdrop-blur-sm shadow-lg">
                      {rarityLabels[product.rarity]}
                    </Badge>
                  )}
                  {product.isSale && (
                    <Badge className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 backdrop-blur-sm shadow-lg">
                      SALE
                    </Badge>
                  )}
                </div>

                {/* Crypto tag */}
                {product.cryptoTag && (
                  <Badge
                    variant="outline"
                    className="absolute top-6 right-6 font-mono text-[10px] font-bold px-2.5 py-1 bg-background/95 backdrop-blur border-primary/40 shadow-lg"
                  >
                    {product.cryptoTag}
                  </Badge>
                )}


              </div>

              {/* Product Info Panel */}
              <div className="w-full md:w-96 p-6 md:p-8 flex flex-col border-l border-border/50 bg-muted/10 md:bg-background">
                {/* Category */}
                {product.category && (
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                      {product.category}
                    </p>
                  </div>
                )}

                {/* Product name */}
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2 leading-tight">
                  {product.name}
                </h2>

                {/* Product description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* SKU and additional info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {product.sku && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        SKU: {product.sku}
                      </span>
                    </div>
                  )}
                  {product.weight_lbs && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {product.weight_lbs} lbs
                      </span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {product.dimensions}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.type && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.type.toUpperCase()}
                    </Badge>
                  )}
                  {product.cryptoType && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {typeof product.cryptoType === 'string' ? product.cryptoType.toUpperCase() : ['ALL', 'BULLRUN', 'BTC', 'ETH', 'BNB', 'SOL', 'SUI'][product.cryptoType] || ''}
                    </Badge>
                  )}
                  {product.chain && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.chain.symbol.toUpperCase()}
                    </Badge>
                  )}
                  {product.volume && (
                    <Badge variant="outline" className="font-mono text-xs">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {product.volume >= 1000 ? `${(product.volume / 1000).toFixed(1)}K` : product.volume} vol
                    </Badge>
                  )}
                </div>

                {/* Inventory info */}
                {product.inventory_quantity !== undefined && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {product.inventory_quantity} in stock
                      </span>
                    </div>
                  </div>
                )}

                {/* Price section */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    {product.isSale && product.salePrice ? (
                      <>
                        <p className="font-mono font-bold text-4xl text-green-500">
                          ${product.salePrice.toFixed(2)}
                        </p>
                        <p className="font-mono text-xl text-muted-foreground line-through decoration-destructive/60">
                          ${product.base_price.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="font-mono font-bold text-4xl text-foreground">
                        ${displayPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Price change indicator */}
                  {product.priceChange !== undefined && (
                    <div className="flex items-center gap-2">
                      {priceUp && (
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="font-mono text-base font-semibold text-green-500">
                            +{product.priceChange.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {priceDown && (
                        <div className="flex items-center gap-1.5">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          <span className="font-mono text-base font-semibold text-red-500">
                            {product.priceChange.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">
                        24h change
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-auto space-y-3">
                  <Button
                    size="lg"
                    className="w-full font-display font-semibold h-14 shadow-lg hover:scale-[1.02] transition-transform"
                    disabled={!connected || !publicKey || isAddingToCart}
                    onClick={async () => {
                      if (!connected || !publicKey) return
                      
                      setIsAddingToCart(true)
                      try {
                        const productWithVariants = {
                          id: product.id,
                          name: product.name,
                          description: product.description,
                          type: product.type || 'accessory',
                          base_price: product.base_price,
                          cost_price: product.cost_price,
                          image_url: product.image_url,
                          gallery_urls: product.gallery_urls,
                          weight_lbs: product.weight_lbs,
                          dimensions: product.dimensions,
                          sku: product.sku,
                          inventory_quantity: product.inventory_quantity || 0,
                          is_active: product.is_active ?? true,
                          is_featured: product.is_featured ?? false,
                          tags: product.tags,
                          chain_id: product.chain_id,
                          created_at: product.created_at,
                          updated_at: product.updated_at,
                          category: product.category,
                          vendor_id: 'default',
                          track_inventory: false,
                          is_digital: false,
                          requires_shipping: true,
                          status: 'active' as const,
                          variants: []
                        }
                        
                        await addItem(productWithVariants, null, publicKey || '', 1)
                        toast({
                          title: 'Added to cart successfully!',
                          description: `${product.name} has been added to your cart.`,
                          variant: 'default'
                        })
                      } catch (error: any) {
                        console.error('Error adding to cart:', error)
                        toast({
                          title: 'Failed to add to cart',
                          description: error.message || 'Please try again.',
                          variant: 'destructive'
                        })
                      } finally {
                        setIsAddingToCart(false)
                      }
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {isAddingToCart ? 'Adding...' : connected ? 'Add to Cart' : 'Connect Wallet'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 font-mono text-sm h-12 hover:bg-muted/50"
                      disabled={!connected || !publicKey || isAddingToWishlist}
                      onClick={async () => {
                        if (!connected || !publicKey) return
                        
                        setIsAddingToWishlist(true)
                        try {
                          const response = await fetch('/api/user/wishlist?wallet=' + publicKey, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              product_id: product.id
                            })
                          })
                          
                          const data = await response.json()
                          if (data.wishlistItem) {
                            toast({
                              title: 'Added to wishlist!',
                              description: `${product.name} has been added to your wishlist.`,
                              variant: 'default'
                            })
                          } else {
                            toast({
                              title: 'Failed to add to wishlist',
                              description: 'Please try again.',
                              variant: 'destructive'
                            })
                          }
                        } catch (error: any) {
                          console.error('Error adding to wishlist:', error)
                          toast({
                            title: 'Failed to add to wishlist',
                            description: error.message || 'Please try again.',
                            variant: 'destructive'
                          })
                        } finally {
                          setIsAddingToWishlist(false)
                        }
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {isAddingToWishlist ? 'Adding...' : connected ? 'Wishlist' : 'Connect Wallet'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 font-mono text-sm h-12 hover:bg-muted/50"
                      onClick={() => {
                        navigator.share?.({
                          title: product.name,
                          url: window.location.href,
                        })
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
