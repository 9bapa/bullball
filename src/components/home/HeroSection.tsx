import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, TrendingUp, Zap } from 'lucide-react'

export function HeroSection() {
  // Crypto ticker data
  const tickerData = [
    { symbol: 'BTC', price: '$67,432.18', change: '+2.34%', up: true },
    { symbol: 'ETH', price: '$3,521.45', change: '+1.87%', up: true },
    { symbol: 'SOL', price: '$178.23', change: '+5.42%', up: true },
    { symbol: 'DOGE', price: '$0.1874', change: '-1.23%', up: false },
    { symbol: 'BULL', price: '$999.99', change: '+999.99%', up: true },
    { symbol: 'HODL', price: '$∞', change: '+∞%', up: true },
    { symbol: 'MOON', price: '$TO THE', change: '+∞%', up: true },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle trading pattern overlay */}
      <div className="absolute inset-0 trading-pattern opacity-50" />

      <div className="container px-4 relative z-10">
        {/* Crypto Ticker Strip */}
        <div className="overflow-hidden border-y border-border/50 bg-muted/30 backdrop-blur-sm mb-8">
          <div className="crypto-ticker flex gap-8 py-3 whitespace-nowrap">
            {[...tickerData, ...tickerData].map((item, index) => (
              <div
                key={`${item.symbol}-${index}`}
                className="flex items-center gap-2 font-mono text-xs"
              >
                <span className="font-bold text-foreground/80">{item.symbol}</span>
                <span className="text-muted-foreground">{item.price}</span>
                <span className={`font-semibold ${item.up ? 'price-up' : 'price-down'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto py-12">
          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-primary rounded-full pulse-subtle" />
            </div>
            <span className="text-xs font-mono font-semibold text-primary">LIVE MARKET</span>
          </motion.div>

          {/* Brand Name with tech corner accents */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative px-12 py-4"
          >
            <h1 className="font-brand text-6xl md:text-8xl font-bold tracking-wide relative z-10">
              BullRhun
            </h1>
          </motion.div>

          {/* Tagline with crypto personality */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-xl md:text-3xl text-foreground/90 font-medium tracking-tight"
          >
            Trading merch.{' '}
            <span className="text-primary font-bold">Degen culture.</span>
          </motion.p>

          {/* Description with personality */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed"
          >
            Smart. Playful. Confident. Premium swag for traders who refuse to sell.
            From hoodies to hats, express your bull market energy.
          </motion.p>

          {/* CTA Buttons with trading theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              size="lg"
              className="font-display font-semibold text-base px-8 h-12 bg-primary hover:bg-primary/90 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                Start Trading
                <ShoppingBag className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-display font-semibold text-base px-8 h-12 border-2 hover:bg-muted/50"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Trending Now
            </Button>
          </motion.div>

          {/* Stats with crypto theme */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 md:gap-12 pt-12"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-3xl md:text-4xl font-bold text-primary">500+</p>
              </div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Merch Items
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-secondary" />
                <p className="font-mono text-3xl md:text-4xl font-bold text-primary">10K+</p>
              </div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Diamond Hands
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-crypto-up" />
                <p className="font-mono text-3xl md:text-4xl font-bold text-crypto-up">4.9★</p>
              </div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Community Rating
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
