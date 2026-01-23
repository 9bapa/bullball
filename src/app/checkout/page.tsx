'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart'
import { useUserContext } from '@/context/userContext'
import { useRealTimeCart } from '@/hooks/useRealTimeCart'
import { useSolanaPrice } from '@/hooks/useSolanaPrice'
import { useToast } from '@/hooks/use-toast'
import { AddressSelector } from '@/components/address/AddressSelector'
import { PaymentAddress } from '@/components/payment/PaymentAddress'
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Package,
  Shield,
  ShoppingCart,
  Truck,
  Wallet
} from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

interface Address {
  id: string
  user_wallet_address: string
  type: 'shipping' | 'billing'
  is_default: boolean
  first_name: string
  last_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state?: string
  zip_code: string
  country: string
  phone?: string
  created_at: string
}

export default function CheckoutPage() {
  const { connected, publicKey } = useUserContext()
  const { items, getSubtotal, getTotalItems } = useCartStore()
  const { toast } = useToast()
  
  useRealTimeCart()
  const { solPrice, loading: solPriceLoading } = useSolanaPrice()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'confirmed' | 'failed'>('pending')

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal + shipping

  const handleCheckout = async () => {
    if (!connected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to continue',
        variant: 'destructive',
      })
      return
    }

    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a shipping address',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const orderData = {
        customer_wallet_address: publicKey,
        customer_name: `${selectedAddress.first_name} ${selectedAddress.last_name}`,
        customer_phone: selectedAddress.phone,
        billing_address: `${selectedAddress.address_line_1}${selectedAddress.address_line_2 ? ', ' + selectedAddress.address_line_2 : ''}`,
        billing_city: selectedAddress.city,
        billing_state: selectedAddress.state,
        billing_zip: selectedAddress.zip_code,
        billing_country: selectedAddress.country,
        shipping_address: `${selectedAddress.address_line_1}${selectedAddress.address_line_2 ? ', ' + selectedAddress.address_line_2 : ''}`,
        shipping_city: selectedAddress.city,
        shipping_state: selectedAddress.state,
        shipping_zip: selectedAddress.zip_code,
        shipping_country: selectedAddress.country,
        subtotal,
        shipping_cost: shipping,
        total_amount: total,
        items: items.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id === 'no-variant' || item.variant_id === 'default' ? null : item.variant_id,
          quantity: item.quantity,
          product: item.product
        })),
        payment_amount_sol: parseFloat((total / (solPrice || 128.17)).toFixed(3))
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (response.ok && result.order) {
        setCreatedOrder(result)
        setShowPaymentStep(true)
      } else {
        toast({
          title: 'Order Failed',
          description: result.error || 'Failed to create order',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: 'Checkout Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }} />
        </div>
        
        <Header />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <Card className="w-full max-w-md border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
            <CardContent className="relative z-10 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">Connect Wallet</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Please connect your Solana wallet to proceed with checkout
              </p>
              <Button className="w-full h-12 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80" onClick={() => {
                toast({
                  title: 'Wallet Connection',
                  description: 'Wallet connection functionality would be implemented here',
                })
              }}>
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }} />
        </div>
        
        <Header />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <Card className="w-full max-w-md border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
            <CardContent className="relative z-10 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Add some items to your cart before checking out
              </p>
              <Button className="w-full h-12 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80" asChild>
                <a href="/">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continue Shopping
                </a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        <section className="relative py-12 lg:py-16">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
                <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                    check out
                  </span>
                </h1>
                  <p className="text-lg text-muted-foreground font-mono mt-2">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} • {getTotalItems() > 0 && showPaymentStep ? 'Payment Pending' : 'Ready to purchase'}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="mb-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-primary/50 border-2 border-transparent" 
                asChild
              >
                {showPaymentStep ? (
                  <a href="/cart">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Cart
                  </a>
                ) : (
                  <a href="/cart">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Cart
                  </a>
                )}
              </Button>
            </div>

            <div className="flex justify-center">
              {showPaymentStep ? (
                /* Payment Step */
                <div className="w-full max-w-2xl">
                  <PaymentAddress
                    address={createdOrder?.payment_address}
                    amount={createdOrder?.payment_amount_sol}
                    status={paymentStatus}
                    orderId={createdOrder?.id}
                    onStatusChange={setPaymentStatus}
                  />
                </div>
              ) : (
                <>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Shipping Information */}
                    <div className="space-y-6">
                      <AddressSelector
                        walletAddress={publicKey}
                        selectedAddress={selectedAddress}
                        onAddressSelect={setSelectedAddress}
                        onEditAddress={() => {}}
                        onAddressSaved={() => {}}
                        onNewAddress={() => setShowPaymentStep(false)}
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                    <Card className="lg:sticky lg:top-24 border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-30" />
                      <CardHeader className="relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/20 shadow-lg">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="font-display font-bold text-xl">Order Summary</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10 space-y-6">
                        {/* Items */}
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                              <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                                <img 
                                  src={item.product.image_url} 
                                  alt={item.product.name}
                                  className="w-full h-full object-contain rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.png'
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{item.product.name}</p>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                                    Qty: {item.quantity}
                                  </span>
                                  {item.variant && (
                                    <span className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-secondary/60 rounded-full"></div>
                                      {item.variant.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-foreground text-lg">
                                  ${((item.product.base_price + (item.variant?.price_adjustment || 0)) * item.quantity).toFixed(2)}
                                </p>
                                {solPrice && !solPriceLoading && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    ≈ {(((item.product.base_price + (item.variant?.price_adjustment || 0)) * item.quantity) / solPrice).toFixed(4)} SOL
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator className="bg-border/50" />

                        {/* Pricing */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40">
                            <span className="text-muted-foreground font-medium">Subtotal</span>
                            <div className="text-right">
                              <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                              {solPrice && !solPriceLoading && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  ≈ {(subtotal / solPrice).toFixed(4)} SOL
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40">
                            <span className="text-muted-foreground font-medium">Shipping</span>
                            <div className="text-right">
                              {shipping === 0 ? (
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-green-500" />
                                  <span className="font-bold text-green-600">FREE</span>
                                </div>
                              ) : (
                                <span className="font-bold text-lg">${shipping.toFixed(2)}</span>
                              )}
                            </div>
                          </div>

                          <Separator className="bg-border/50" />

                          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                            <span className="font-bold text-lg">Total</span>
                            <div className="text-right">
                              <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                              {solPrice && !solPriceLoading && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  ≈ {(total / solPrice).toFixed(4)} SOL
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* Wallet Info */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/20 shadow-lg">
                                <Wallet className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-semibold text-foreground">Connected Wallet</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                              <span className="text-xs font-semibold text-green-600">Active</span>
                            </div>
                          </div>
                          <p className="font-mono text-sm text-muted-foreground bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/40">
                            {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                          </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-semibold text-foreground">Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-muted-foreground">256-bit SSL</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Truck className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-semibold text-foreground">Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-muted-foreground">2-3 Days</span>
                            </div>
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                          className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-2 border-primary/50"
                          onClick={handleCheckout}
                          disabled={isProcessing || !selectedAddress || !selectedAddress.first_name || !selectedAddress.address_line_1 || !selectedAddress.city}
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            <>
                              <CreditCard className="mr-3 h-6 w-6" />
                              Proceed to Payment
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
            <MobileBottomNav />
      
    </div>
  )
}