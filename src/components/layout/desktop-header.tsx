'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export function DesktopHeader() {
  const { items } = useCartStore()
  
  return (
    <header className="fixed top-0 left-0 right-0 glass-header border-b border-white/10 z-40 hidden md:block">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-rainbow rounded-xl flex items-center justify-center hover-lift">
              <span className="text-white font-bold text-xl">🐂</span>
            </div>
            <span className="font-black text-white text-xl font-display">
              Bull<span className="italic">Rhun</span>
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-white hover:text-meme-purple transition-colors font-medium">
              Home
            </Link>
            <Link href="/token" className="text-gray-300 hover:text-meme-purple transition-colors font-medium">
              Token
            </Link>
            <Link href="/merch" className="text-gray-300 hover:text-meme-purple transition-colors font-medium">
              Shop
            </Link>
            <Link href="/submit-design" className="text-gray-300 hover:text-meme-purple transition-colors font-medium">
              Design
            </Link>
          </nav>
          
          {/* Cart */}
          <Link 
            href="/cart" 
            className="relative p-2 text-white hover:text-meme-purple transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-orange rounded-full text-xs text-white font-bold flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}