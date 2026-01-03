'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button as ButtonUI } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Minus, Plus, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CartButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { items, getTotalItems, getSubtotal, removeItem, updateQuantity, clearCart, openCart } = useCartStore();
  const router = useRouter();

  const itemCount = getTotalItems();
  const subtotal = getSubtotal();

  const handleCheckout = () => {
    setShowDropdown(false);
    router.push('/merch/checkout');
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <Button
        onClick={() => router.push('/merch')}
        variant="outline"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border-0"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Start Shopping
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border-0"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        View Cart ({itemCount}) - {formatPrice(subtotal)}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 z-50">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Shopping Cart</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto space-y-3">
                {items.map((item) => {
                  const unitPrice = item.product.base_price + (item.variant?.price_adjustment || 0);
                  const totalPrice = unitPrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3 p-2 bg-slate-700/50 rounded-lg">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded flex-shrink-0 flex items-center justify-center">
                        {item.product.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-gray-500 text-xs">No img</div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {item.variant?.color && `${item.variant.color} `}
                          {item.variant?.size && `Size ${item.variant.size}`}
                        </p>
                        <p className="text-purple-400 text-sm font-semibold">
                          {formatPrice(unitPrice)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-400 hover:text-white h-6 w-6 p-0"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-white h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 h-6 w-6 p-0 ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-white font-semibold text-sm">
                          {formatPrice(totalPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-slate-600" />

              {/* Cart Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Shipping</span>
                  <span className="text-white">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-purple-400">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDropdown(false)}
                  className="w-full border-slate-600 text-gray-300 hover:text-white"
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearCart();
                    setShowDropdown(false);
                  }}
                  className="w-full text-gray-400 hover:text-red-400"
                >
                  Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}