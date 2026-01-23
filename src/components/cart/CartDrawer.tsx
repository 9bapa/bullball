'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useUserContext } from '@/context/userContext'

interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  name: string
  description: string | null
  price: number
  cost_price: number | null
  vendor_id: string
  image_url: string
  stock_quantity: number | null
  is_active: boolean
}

export function CartDrawer() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const { publicKey } = useUserContext()

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!publicKey) {
        setCartItems([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/cart?wallet=${publicKey}`)
        if (response.ok) {
          const data = await response.json()
          setCartItems(data.cartItems || [])
        }
      } catch (error) {
        console.error('Error fetching cart items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCartItems()
  }, [publicKey])

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + delta)
    if (newQuantity === item.quantity) return

    try {
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_item_id: id, quantity: newQuantity })
      })

      if (response.ok) {
        setCartItems((items) =>
          items.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        )
      } else {
        const error = await response.json()
        console.error('Error updating cart:', error)
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
    }
  }

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart/${id}?wallet=${publicKey}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCartItems((items) => items.filter((item) => item.id !== id))
      } else {
        const error = await response.json()
        console.error('Error removing item:', error)
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-2xl p-3.5 shadow-xl hover:-top-9 hover:scale-110 hover:shadow-2xl transition-all duration-300">
          <ShoppingBag className="h-6 w-6" />
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-mono font-bold"
            >
              {cartCount}
            </Badge>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className="rounded-t-2xl border-t border-border/50">
        {/* Handle for dragging */}
        <div className="mx-auto mt-4 h-2 w-12 bg-muted rounded-full" />

        <div className="flex flex-col h-[calc(85vh-2rem)]">
          <DrawerHeader className="px-6 pt-2 pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="font-display font-bold text-2xl">
                  Your Cart
                </DrawerTitle>
                <DrawerDescription className="text-sm font-mono mt-1">
                  {cartItems.length} items • {cartCount} total
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">
                    Add some crypto trading cards to get started
                  </p>
                </div>
              </div>
            ) : (
              cartItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Product Image */}
                    <div className="relative shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                        {item.name}
                      </h4>
                      <p className="text-lg font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-muted/50"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-mono text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-muted/50"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <DrawerFooter className="border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent space-y-4">
              {/* Subtotal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary font-medium">FREE</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-mono font-bold text-xl text-primary">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
