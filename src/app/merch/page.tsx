'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CartButton } from '@/components/merch/CartButton';
import { AllProductsSection } from '@/components/merch/AllProductsSection';
import { SharedHeader } from '@/components/layout/shared-header';
import { SharedFooter } from '@/components/layout/shared-footer';
import { TickerTape } from '@/components/ui/TickerTape';
import { MemeCategories } from '@/components/ui/MemeCategories';
import { useCartStore } from '@/store/cart';
import { useUserContext } from '@/context/userContext';
import { 
  Search,
  ShoppingCart,
  Menu,
  Package,
  TrendingUp,
  Star,
  Zap,
  Trophy,
  Target
} from 'lucide-react';
import {BottomNav} from '@/components/layout/mobile-nav'

export default function MerchPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();
  const { connected, publicKey } = useUserContext();
    const [activeTab, setActiveTab] = useState('shop')


  const quickStats = [
    { label: 'Products', value: '500+', icon: Package, color: 'text-meme-purple' },
    { label: 'Designs', value: '100+', icon: Star, color: 'text-meme-blue' },
    { label: 'Drops', value: '24/7', icon: Zap, color: 'text-meme-green' }
  ];

  return (
    <div className="min-h-screen bg-meme-dark text-white pb-20">
      {/* Shared Header - Responsive */}
      <SharedHeader 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
      />

      {/* Main Products Section */}
      <div className="container mx-auto px-4 py-8">
        <AllProductsSection />
      </div>

      {/* Shared Footer */}
      <BottomNav activeTab={activeTab} />
      <SharedFooter />
    </div>
  );
}