'use client'

import { ShoppingCart, TrendingUp, TrendingDown, Clock, Flame, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ProductFilter } from '@/app/page'

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface ProductCardProps {
  id: string
  name: string
  base_price: number
  image: string
  category?: string
  isNew?: boolean
  isSale?: boolean
  salePrice?: number
  rarity?: RarityLevel
  priceChange?: number  // Percentage change like crypto
  cryptoTag?: string   // Fun crypto tag like "HODL", "MOON", etc.
  volume?: number      // "Trading volume" = items sold
  cryptoType?: ProductFilter
  onImageClick?: () => void
}

const rarityLabels: Record<RarityLevel, string> = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
}

// Fun border colors based on crypto type
const getBorderStyles = (cryptoType?: ProductFilter) => {
  switch (cryptoType) {
    case 'bullrun':
      return 'border-2 border-green-400/60 hover:border-green-400 hover:shadow-green-400/20'
    case 'btc':
      return 'border-2 border-orange-400/60 hover:border-orange-400 hover:shadow-orange-400/20'
    case 'eth':
      return 'border-2 border-blue-400/60 hover:border-blue-400 hover:shadow-blue-400/20'
    case 'bnb':
      return 'border-2 border-yellow-400/60 hover:border-yellow-400 hover:shadow-yellow-400/20'
    case 'sui':
      return 'border-2 border-pink-400/60 hover:border-pink-400 hover:shadow-pink-400/20'
    default:
      return 'border-2 border-purple-400/60 hover:border-purple-400 hover:shadow-purple-400/20'
  }
}

export function ProductCard({
  name,
  base_price,
  image,
  category,
  isNew,
  isSale,
  salePrice,
  rarity = 'common',
  priceChange,
  cryptoTag,
  volume = 0,
  cryptoType,
  onImageClick,
}: ProductCardProps) {
  const displayPrice = isSale && salePrice ? salePrice : base_price
  const priceUp = priceChange && priceChange > 0
  const priceDown = priceChange && priceChange < 0
  const borderStyles = getBorderStyles(cryptoType)

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="card-hover"
    >
      <Card className={`
        overflow-hidden bg-card rounded-sm ${borderStyles}
        transition-all duration-300
      `}>
        <CardContent className="p-0">
          {/* Image Container - Full fill, no padding, no spacing */}
          <div className="relative aspect-square overflow-hidden bg-muted/20 cursor-pointer group" onClick={onImageClick}>
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />

            {/* Badges - Floating with backdrop */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {isNew && (
                <Badge className="bg-primary/95 text-primary-foreground text-[9px] font-bold px-2 py-0.5 backdrop-blur-sm animate-pulse shadow-lg">
                  NEW
                </Badge>
              )}
              {rarity !== 'common' && (
                <Badge className={`rarity-${rarity} text-white text-[9px] font-bold px-2 py-0.5 backdrop-blur-sm shadow-lg`}>
                  {rarityLabels[rarity]}
                </Badge>
              )}
              {isSale && (
                <Badge className="bg-red-500/95 text-white text-[9px] font-bold px-2 py-0.5 backdrop-blur-sm shadow-lg">
                  SALE
                </Badge>
              )}
            </div>

            {/* Crypto tag - Floating badge */}
            {cryptoTag && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 font-mono text-[9px] font-bold px-2 py-0.5 bg-background/95 backdrop-blur border-primary/40 shadow-lg"
              >
                {cryptoTag}
              </Badge>
            )}

            {/* Volume indicator */}
            {volume > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/95 backdrop-blur rounded-lg px-2 py-1 text-[9px] font-mono shadow-lg">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-muted-foreground">
                  {volume >= 1000 ? `${(volume / 1000).toFixed(1)}K` : volume} vol
                </span>
              </div>
            )}

            {/* Zoom button - shows on hover */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-2 rounded-full bg-background/95 backdrop-blur shadow-lg hover:scale-110 transition-transform">
                <ZoomIn className="h-4 w-4 text-primary" />
              </button>
            </div>

            {/* Quick Add Button - Pixar style pill */}
            <Button
              size="icon"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Info - Minimal padding */}
          <div className="p-3 bg-background/30 backdrop-blur-sm border-t border-border/30">
            {/* Category with tiny clock icon */}
            {category && (
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  {category}
                </p>
              </div>
            )}

            {/* Product name */}
            <h3 className="font-display font-semibold text-sm leading-tight mb-1.5 line-clamp-1 min-h-[1.25rem]">
              {name}
            </h3>

            {/* Price section with trading style */}
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                {isSale && salePrice ? (
                  <>
                    <p className="font-mono font-bold text-lg price-up">
                      ${salePrice.toFixed(2)}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground line-through decoration-destructive/60">
                      ${base_price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="font-mono font-bold text-lg text-foreground">
                    ${displayPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Price change indicator like crypto */}
              {priceChange !== undefined && (
                <div className="flex items-center gap-1">
                  {priceUp && (
                    <div className="flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="font-mono text-[10px] font-semibold text-green-500">
                        +{priceChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {priceDown && (
                    <div className="flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="font-mono text-[10px] font-semibold text-red-500">
                        {priceChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {!priceUp && !priceDown && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      0.0%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
