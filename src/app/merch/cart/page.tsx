'use client'

import { useState } from 'react'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight, X, Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { items, getTotalItems, getSubtotal, removeItem, updateQuantity, clearCart } = useCartStore();
  const router = useRouter();

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error: any) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const calculateEstimatedShipping = () => {
    // Simple shipping calculation - in real app this would be more sophisticated
    const itemCount = getTotalItems();
    if (itemCount === 0) return 0;
    if (itemCount >= 3) return 0; // Free shipping for 3+ items
    return 5.99; // Standard shipping
  };

  const shipping = calculateEstimatedShipping();
  const subtotal = getSubtotal();
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
        <SharedHeader />
        <div className="flex-grow">
          <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
              <p className="text-gray-400 mb-8">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link href="/merch">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
          </div>
        </div>
        <SharedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 mb-10 md:mb-0 pb-20 md:pb-0">
      <SharedHeader />
      <div className="flex-grow mt-10">
        <div className="container mx-auto px-4 py-8 mt-10">
        <div className="max-w-6xl mx-auto mt-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 text-center md:text-left">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                🛒 Your Cart Vibes 🛒
              </span>
            </h1>
            <p className="text-lg text-gray-300 text-center md:text-left">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-400 ml-2">
                {getTotalItems() === 0 ? '🦴 Cart lookin empty fr fr...' : 
                 getTotalItems() === 1 ? '🎯 Single item ready to cop' :
                 getTotalItems() < 5 ? '🔥 Solid stack building...' :
                 getTotalItems() < 10 ? '💎 Diamond hands loading...' :
                 '🚀 BULLISH HOARD INCOMING! 🚀'}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Mobile 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {items.map((item) => {
                  const unitPrice = item.product.base_price + (item.variant?.price_adjustment || 0);
                  const totalPrice = unitPrice * item.quantity;
                  const isUpdating = updatingItems.has(item.id);
                  
                  return (
                    <Card key={item.id} className="bg-slate-800/50 border-slate-700 overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
                      <CardContent className="p-4">
                        {/* Product Image - Larger on mobile */}
                        <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center group relative mb-4">
                            {item.product.image_url ? (
                              <>
                                <img 
                                  src={item.product.image_url} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-lg border-2 border-slate-600 hover:border-purple-400 transition-colors duration-200 cursor-pointer"
                                  onClick={() => setModalImage(item.product.image_url || null)}
                                />
                                {/* Expand Icon */}
                                <button
                                  onClick={() => setModalImage(item.product.image_url || null)}
                                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  title="Click to enlarge image"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <ShoppingCart className="w-12 h-12 text-gray-500" />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="space-y-2">
                            <div>
                              <h3 className="text-white font-semibold text-base line-clamp-2">{item.product.name}</h3>
                              <p className="text-gray-400 text-xs">
                                {item.variant?.color && `${item.variant.color} `}
                                {item.variant?.size && `Size ${item.variant.size}`}
                                {!item.variant?.color && !item.variant?.size && 'Standard'}
                              </p>
                              <p className="text-gray-500 text-xs">SKU: {item.variant?.sku || 'N/A'}</p>
                            </div>

                            {/* Stock Status */}
                            {(item.variant?.stock_quantity || 0) <= 5 && (
                              <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                                Only {item.variant?.stock_quantity || 0} left
                              </Badge>
                            )}
                          </div>

                          {/* Price and Quantity Controls */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-400 text-xs line-through">
                                  {formatPrice(item.product.base_price)}
                                </p>
                                <p className="text-purple-400 font-bold text-base">
                                  {formatPrice(unitPrice)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold text-lg">
                                  {formatPrice(totalPrice)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="border-slate-600 text-gray-300 hover:text-white h-8 w-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                
                                <span className="text-white font-medium w-8 text-center text-sm">
                                  {isUpdating ? '...' : item.quantity}
                                </span>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  disabled={isUpdating}
                                  className="border-slate-600 text-gray-300 hover:text-white h-8 w-8 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="border-red-600/50 text-red-400 hover:text-red-300 hover:border-red-600 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                );
              })}
              </div>

              {/* Cart Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-700">
                <Link href="/merch">
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:text-white w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="border-red-600/50 text-red-400 hover:text-red-300 hover:border-red-600 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal ({getTotalItems()} items)</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Shipping</span>
                    <span className="text-white">
                      {shipping === 0 ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  {/* Free Shipping Notice */}
                  {shipping > 0 && subtotal < 75 && (
                    <div className="text-xs text-purple-400 bg-purple-500/10 p-2 rounded border border-purple-500/30">
                      Add {formatPrice(75 - subtotal)} more for free shipping!
                    </div>
                  )}

                  {shipping === 0 && (
                    <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/30">
                      🎉 You've qualified for free shipping!
                    </div>
                  )}

                  <Separator className="bg-slate-600" />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-purple-400">{formatPrice(total)}</span>
                  </div>

{/* Market Cap Info */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-purple-400">Market Cap Milestone</h4>
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">🚀</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">$1,000,000</p>
                      <p className="text-sm text-gray-300">Orders open at this milestone</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Live Trading</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-3">
                      When $BULL token reaches $1M market cap, exclusive merch drops and special offers will be unlocked for holders
                    </p>
                  </div>
                  {/* Checkout Button */}
                  {/* <Link href="/merch/checkout">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link> */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </div>
      <SharedFooter />

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
    </div>
  );
}