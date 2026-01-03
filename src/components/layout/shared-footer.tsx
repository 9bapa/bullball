'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Zap, Star, Twitter, MessageCircle, Send } from 'lucide-react'

export function SharedFooter() {
  return (
    <footer className="bg-gradient-to-br from-meme-darker via-meme-dark to-meme-darker border-t border-white/10 mt-16">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-meme-purple to-meme-blue rounded-xl flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="BullRhun" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h3 className="text-2xl font-display font-bold text-meme-gradient">
                Bull<span className="italic">Rhun</span>
              </h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              The ultimate destination for meme coin enthusiasts and crypto swag collectors worldwide.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              <a 
                href="https://x.com/BullRhun" 
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors group"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-1 bg-meme-purple rounded-full"></div>
              Shop
            </h4>
            <div className="space-y-3">
              <Link 
                href="/products" 
                className="text-gray-300 hover:text-meme-purple transition-colors flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                All Products
              </Link>
              <Link 
                href="/designs" 
                className="text-gray-300 hover:text-meme-purple transition-colors flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                Submit Design
              </Link>
              <Link 
                href="/become-vendor" 
                className="text-gray-300 hover:text-meme-purple transition-colors flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                Become Vendor
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-1 bg-meme-blue rounded-full"></div>
              Resources
            </h4>
            <div className="space-y-3">
              <Link 
                href="/token" 
                className="text-gray-300 hover:text-meme-purple transition-colors flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                BullRhun Tokens
              </Link>
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-meme-purple transition-colors flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                About Us
              </Link>
              <Link 
                href="https://x.com/bullrhun" 
                className="text-gray-300 hover:text-meme-purple transition-colors flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                Support
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-1 bg-meme-green rounded-full"></div>
              Stay Connected
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              Follow us for the latest drops and exclusive content.
            </p>
            <div className="flex gap-2">
              <a 
                href="https://x.com/bullrhun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-meme-purple to-meme-blue rounded-lg hover:from-meme-purple-dark hover:to-meme-blue-dark transition-all text-white flex items-center gap-2"
              >
                <span className="text-sm font-medium">@bullrhun</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <span>Premium Quality</span>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 text-sm justify-end">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                Shipping Info
              </Link>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2024 BullRhun. All rights reserved. | Built for the crypto community ❤️</p>
          </div>
        </div>
      </div>
    </footer>
  )
}