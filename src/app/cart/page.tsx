'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart'
import { useUserContext } from '@/context/userContext'
import { useSolanaPrice } from '@/hooks/useSolanaPrice'
import { useRealTimeCart } from '@/hooks/useRealTimeCart'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Package,
  Truck,
  Shield
} from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function CartPage() {
  const { connected } = useUserContext()
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTotalItems } = useCartStore()
  
  // Initialize real-time cart synchronization
  useRealTimeCart()
  const { solPrice, loading: solPriceLoading } = useSolanaPrice()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'BULLRHUN20') {
      setPromoApplied(true)
    }
  }

  const subtotal = getSubtotal()
  const discount = promoApplied ? subtotal * 0.2 : 0
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal - discount + shipping

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        <section className="relative py-12 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                    Shopping Cart
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>

              {!connected && (
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <ShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Sign In to Continue
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Connect your wallet to manage your cart and checkout
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <Card className="border-primary/10">
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">
                      Looks like you haven't added any items yet
                    </p>
                    <Button className="gap-2" asChild>
                      <a href="/">
                        <Package className="h-4 w-4" />
                        Continue Shopping
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                      <Card key={item.id} className="border-primary/10 hover:border-primary/20 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Product Image */}
                            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center shrink-0">
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.png'
                                }}
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold mb-1 truncate">{item.product.name}</h3>
                                  {item.variant && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.variant.color} {item.variant.size}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex items-end justify-between">
                                {/* Quantity */}
                                <div className="flex items-center gap-2 bg-muted/30 rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="h-8 w-8"
                                    disabled={!connected}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                    className="w-16 h-8 text-center border-0 bg-transparent font-semibold"
                                    disabled={!connected}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="h-8 w-8"
                                    disabled={!connected}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary">
                                    ${((item.product.base_price + (item.variant?.price_adjustment || 0)) * item.quantity).toFixed(2)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    ${(item.product.base_price + (item.variant?.price_adjustment || 0)).toFixed(2)} each
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Cart Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="gap-2"
                        disabled={!connected || items.length === 0}
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear Cart
                      </Button>
                      <Button variant="outline" className="gap-2" asChild>
                        <a href="/">
                          <Package className="h-4 w-4" />
                          Continue Shopping
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <Card className="border-primary/20 sticky top-24">
                      <CardHeader>
                        <CardTitle className="text-xl">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <div className="text-right">
                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            {solPrice && !solPriceLoading && (
                              <p className="text-sm text-muted-foreground">
                                ≈ {(subtotal / solPrice).toFixed(4)} SOL
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Shipping */}
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-semibold">
                            {shipping === 0 ? (
                              <span className="text-green-600">FREE</span>
                            ) : (
                              `$${shipping.toFixed(2)}`
                            )}
                          </span>
                        </div>

                        {shipping === 0 && (
                          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Free shipping on orders over $100</span>
                          </div>
                        )}

                        {/* Discount */}
                        {promoApplied && (
                          <div className="flex items-center justify-between text-green-600">
                            <span className="font-medium">Discount (20%)</span>
                            <span className="font-semibold">-${discount.toFixed(2)}</span>
                          </div>
                        )}

                        <Separator />

                        {/* Total */}
                        <div className="flex items-center justify-between text-lg">
                          <span className="font-bold">Total</span>
                          <div className="text-right">
                            <span className="font-bold text-primary">${total.toFixed(2)}</span>
                            {solPrice && !solPriceLoading && (
                              <p className="text-sm text-muted-foreground">
                                ≈ {(total / solPrice).toFixed(4)} SOL
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Promo Code */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Promo Code</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              className="flex-1"
                              disabled={promoApplied || !connected}
                            />
                            <Button
                              onClick={handleApplyPromo}
                              disabled={!promoCode || promoApplied || !connected}
                              variant={promoApplied ? 'default' : 'outline'}
                            >
                              {promoApplied ? 'Applied' : 'Apply'}
                            </Button>
                          </div>
                          {promoCode && !promoApplied && promoCode.toUpperCase() !== 'BULLRHUN20' && (
                            <p className="text-xs text-destructive">
                              Invalid code. Try: BULLRHUN20
                            </p>
                          )}
                          {promoApplied && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              20% discount applied!
                            </p>
                          )}
                        </div>

                        <Separator />

                        {/* Trust Badges */}
                        <div className="space-y-3 pt-4">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-muted-foreground">Secure Payment</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Truck className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-muted-foreground">Fast Delivery</span>
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                          asChild
                        >
                          <a href="/checkout">
                            Proceed to Checkout
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
          </div>
        </section>
      </main>

      <Footer />
            <MobileBottomNav />
      
    </div>
  )
}
