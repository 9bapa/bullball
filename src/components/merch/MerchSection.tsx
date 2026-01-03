'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { productService, ProductWithVariants, ProductVariant } from '@/services/product.service';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface MerchSectionProps {
  title: string;
  productType: string;
  accentColor: 'purple' | 'orange' | 'emerald' | 'blue';
}

const colorClasses = {
  purple: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-purple-700/30 hover:border-purple-500/50',
  orange: 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-orange-700/30 hover:border-orange-500/50',
  emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-emerald-700/30 hover:border-emerald-500/50',
  blue: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-blue-700/30 hover:border-blue-500/50'
};

const badgeColorClasses = {
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

export function MerchSection({ title, productType, accentColor }: MerchSectionProps) {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, [productType]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductsByType(productType);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: ProductWithVariants, variantId: string) => {
    try {
      const variant = product.variants?.find(v => v.id === variantId);
      if (!variant) {
        toast.error('Please select a variant');
        return;
      }

      await addItem(product, variant, 1);
      toast.success('Added to cart!');
      
      // Clear selection for this product
      setSelectedVariants(prev => {
        const newSelection = { ...prev };
        delete newSelection[product.id];
        return newSelection;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleVariantSelect = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (stock <= 5) return { text: `Only ${stock} left`, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { text: 'In Stock', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h4 className={`text-xl font-semibold text-${accentColor}-400 flex items-center gap-2`}>
          {title}
        </h4>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 bg-slate-800/50 rounded-lg p-4 border border-gray-700 animate-pulse hover:scale-105 transition-transform">
              <div className="w-full h-32 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <h4 className={`text-xl font-semibold text-${accentColor}-400 flex items-center gap-2`}>
          {title}
        </h4>
        <div className="text-center py-8 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No products available in this category yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className={`text-xl font-semibold text-${accentColor}-400 flex items-center gap-2`}>
          {title}
        </h4>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <ChevronLeft className="w-4 h-4" />
          <span>Scroll</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {products.map((product) => {
          const selectedVariantId = selectedVariants[product.id];
          const selectedVariant = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
          const stockStatus = getStockStatus(selectedVariant?.stock_quantity || 0);
          
          return (
            <Card 
              key={product.id} 
              className={`flex-shrink-0 w-48 bg-slate-800/50 rounded-lg p-4 border transition-all duration-300 hover:scale-105 hover:shadow-lg ${colorClasses[accentColor]}`}
            >
              {/* Product Image */}
              <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-500" />
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h5 className="font-semibold text-white text-sm leading-tight">
                  {product.name}
                </h5>
                
                {/* Variant Selector */}
                {product.variants && product.variants.length > 1 && (
                  <Select
                    value={selectedVariantId || product.variants[0].id}
                    onValueChange={(value) => handleVariantSelect(product.id, value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-slate-700 border-gray-600">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id} className="text-xs">
                          {variant.color && `${variant.color} `}
                          {variant.size && `Size ${variant.size}`}
                          {!variant.color && !variant.size && 'Standard'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Stock Status */}
                <Badge className={`text-xs ${stockStatus.color}`}>
                  {stockStatus.text}
                </Badge>

                {/* Price */}
                <div className={`font-bold text-${accentColor}-400 text-lg`}>
                  {formatPrice(product.base_price + (selectedVariant?.price_adjustment || 0))}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product, selectedVariant?.id || product.variants?.[0].id || '')}
                  disabled={!selectedVariant || (selectedVariant?.stock_quantity || 0) === 0}
                  className={`w-full bg-gradient-to-r ${colorClasses[accentColor]} text-white text-sm transition-all duration-300 transform hover:scale-105`}
                >
                  {(selectedVariant?.stock_quantity || 0) === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}