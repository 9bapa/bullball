'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Home, Compass, User, Menu, PaintBucket } from 'lucide-react'
import { useCartStore } from '@/store/cart'

interface BottomNavProps {
  activeTab: string;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const { items } = useCartStore()
  
  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Home', 
      href: '/',
      badge: null 
    },
    { 
      id: 'token', 
      icon: Compass, 
      label: 'Token', 
      href: '/token',
      badge: null 
    },
    { 
      id: 'shop', 
      icon: ShoppingCart, 
      label: 'Shop', 
      href: '/merch',
      badge: items.length > 0 ? items.length.toString() : null 
    },
    { 
      id: 'design', 
      icon: PaintBucket, 
      label: 'Design', 
      href: '/submit-design',
      badge: null 
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-meme-dark border-t border-white/10 z-[60] mobile-safe-area md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center py-3 touch-target
                transition-all duration-200
                ${isActive 
                  ? 'text-meme-purple' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute top-2 right-4 w-5 h-5 bg-gradient-orange rounded-full text-xs text-white font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

interface MobileHeaderProps {
  onMenuToggle: () => void
  cartCount?: number
}

export function MobileHeader({ onMenuToggle, cartCount = 0 }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-meme-dark z-[60]">
      <div className="flex items-center justify-between p-4">
        {/* Hamburger Menu */}
        <button 
          onClick={onMenuToggle}
          className="touch-target p-2 text-white hover:text-meme-purple transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Logo - BullRhun */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-rainbow rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">🐂</span>
          </div>
          <span className="font-bold text-white font-display">Bull<span className="italic">Rhun</span></span>
        </Link>
        
        {/* Cart */}
        <button className="touch-target p-2 text-white relative">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-orange rounded-full text-xs text-white font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

interface SlideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function SlideMenu({ isOpen, onClose }: SlideMenuProps) {
  const menuItems = [
    { 
      title: 'Shop by Category', 
      items: ['Dog Coins', 'Pepe Ecosystem', 'Animal Memes', 'DeFi Memes', 'Culture Memes'],
      icon: '🎯',
      href: '/categories'
    },
    { 
      title: 'Trending', 
      items: ['Hot Right Now', 'Top Sellers', 'New Drops', 'Limited Edition'],
      icon: '🔥',
      href: '/trending'
    },
    { 
      title: 'Community', 
      items: ['Leaderboard', 'Achievements', 'Discord', 'Twitter'],
      icon: '👥',
      href: '/community'
    },
    { 
      title: 'Account', 
      items: ['Orders', 'Wishlist', 'Profile Settings', 'Help'],
      icon: '👤',
      href: '/account'
    }
  ]

  return (
    <div className={`
      fixed inset-y-0 left-0 w-80 bg-meme-dark z-[60] transform transition-transform duration-300 ease-out md:hidden
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 h-full overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:text-meme-purple transition-colors"
        >
          ×
        </button>
        
        {/* Menu Items */}
        <div className="space-y-6 mt-8">
          {menuItems.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-white font-display font-bold">{section.title}</h3>
              </div>
              <div className="space-y-2 ml-8">
                {section.items.map((item) => (
                  <Link
                    key={item}
                    href={section.href}
                    onClick={onClose}
                    className="block py-2 text-gray-300 hover:text-meme-purple transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}