'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  Store,
  Package,
  Heart,
  HelpCircle,
  Wallet,
  Menu,
  X
} from 'lucide-react'
import { useUserContext } from '@/context/userContext'
import { WalletIcon } from '@/components/wallet_solana/WalletIcon'
import { useCartStore } from '@/store/cart'

interface User {
  id: string
  wallet_address: string
  role?: 'user' | 'admin' | 'super_admin'
  name?: string
}

interface SharedHeaderProps {
  onMenuToggle?: () => void
}

export function SharedHeader({ onMenuToggle }: SharedHeaderProps) {
  const { connected, publicKey, user } = useUserContext()
  const { items } = useCartStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  // Set loading state when user changes
  useEffect(() => {
    setLoading(false)
  }, [user])

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Don't hide if scrolling at the top
      if (currentScrollY <= 0) {
        setIsVisible(true)
        setLastScrollY(currentScrollY)
        return
      }
      
      // Determine scroll direction
      const isScrollingDown = currentScrollY > lastScrollY
      
      // Hide header when scrolling down, show when scrolling up
      setIsVisible(!isScrollingDown)
      setLastScrollY(currentScrollY)
    }

    // Add scroll listener with throttling
    let timeoutId: NodeJS.Timeout
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(handleScroll, 10) // Throttle to 10ms
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [lastScrollY])

  // User data is now provided by useDynamicWallet hook

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
    }
  }

  const viewOnExplorer = () => {
    if (publicKey) {
      window.open(`https://solscan.io/account/${publicKey}`, '_blank')
    }
  }

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 glass-header z-50 border-b border-white/10 transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - Only on mobile */}
          <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden touch-target p-2 text-white hover:text-meme-purple transition-colors">
                <div className="w-6 h-6 flex flex-col justify-center gap-1">
                  <div className="w-6 h-0.5 bg-white"></div>
                  <div className="w-6 h-0.5 bg-white"></div>
                  <div className="w-6 h-0.5 bg-white"></div>
                </div>
              </button>
            </SheetTrigger>
            <SheetContent side="left" title="Navigation Menu" className="w-80 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/10 backdrop-blur-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-meme-purple to-meme-blue flex items-center justify-center">
                      <Menu className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">Menu</h3>
                      <p className="text-sm text-gray-400">Navigate through BullRhun</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsSideMenuOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    <Link 
                      href="/" 
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-purple"
                      onClick={() => setIsSideMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold">🏠</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white font-display">Home</h4>
                        <p className="text-xs text-gray-400">Main dashboard</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/token" 
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-blue"
                      onClick={() => setIsSideMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-blue/20 to-meme-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold">🪙</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white font-display">Token</h4>
                        <p className="text-xs text-gray-400">BULLRHUN token info</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/merch" 
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-green"
                      onClick={() => setIsSideMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-green/20 to-meme-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold">🛍️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white font-display">Shop</h4>
                        <p className="text-xs text-gray-400">Merchandise store</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/submit-design" 
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-orange"
                      onClick={() => setIsSideMenuOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-orange/20 to-meme-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold">🎨</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white font-display flex items-center gap-2">
                          Design
                          <span className="w-2 h-2 bg-meme-orange rounded-full animate-pulse"></span>
                        </h4>
                        <p className="text-xs text-gray-400">Submit your designs</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h4>
                    <div className="space-y-2">
                      <Link 
                        href="/cart"
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                        onClick={() => setIsSideMenuOpen(false)}
                      >
                        <ShoppingCart className="w-5 h-5 text-meme-purple" />
                        <span className="text-white">Cart {items.length > 0 && `(${items.length})`}</span>
                      </Link>
                      
                      {connected && (
                        <Link 
                          href="/orders"
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                          onClick={() => setIsSideMenuOpen(false)}
                        >
                          <Package className="w-5 h-5 text-meme-blue" />
                          <span className="text-white">My Orders</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      BullRhun © 2024
                    </div>
                    <Link 
                      href="https://x.com/bullrhun" 
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                      onClick={() => setIsSideMenuOpen(false)}
                    >
                      Support
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Logo - All screens */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="flex flex-col items-center justify-center">
              <span className="font-bold text-meme-gradient text-2xl md:text-xl lg:text-2xl font-display tracking-tight leading-tight">
                Bull<span className="italic ">Rhun</span>
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation - Desktop and Tablet */}
          <nav className="hidden md:flex items-center justify-center gap-1">

            {/* Desktop Navigation - Tablet only */}
            <div className="lg:hidden flex items-center gap-2">
              <Link 
                href="/" 
                className="px-3 py-1.5 rounded-lg text-xs font-medium font-display text-white bg-meme-purple/20 border border-meme-purple/30 hover:bg-meme-purple/30 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/token" 
                className="px-3 py-1.5 rounded-lg text-xs font-medium font-display text-gray-300 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                Token
              </Link>
              <Link 
                href="/merch" 
                className="px-3 py-1.5 rounded-lg text-xs font-medium font-display text-gray-300 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                Shop
              </Link>
              <Link 
                href="/submit-design" 
                className="px-3 py-1.5 rounded-lg text-xs font-medium font-display text-meme-orange bg-meme-orange/20 border border-meme-orange/30 hover:bg-meme-orange/30 transition-colors flex items-center gap-1"
              >
                Design
                <span className="w-1.5 h-1.5 bg-meme-orange rounded-full animate-pulse"></span>
              </Link>
            </div>
          </nav>
          
          {/* Right Section - All screens */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart - Only show when connected */}
            {connected && (
              <Link 
                href="/cart" 
                className="relative p-2 text-white hover:text-meme-purple transition-colors group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-orange rounded-full text-xs text-white font-bold flex items-center justify-center animate-pulse">
                    {items.length}
                  </span>
                )}
              </Link>
            )}

            {/* Wallet Connection / Profile - Desktop and Mobile */}
            {!connected ? (
              <div className="hidden md:block">
                <WalletIcon />
              </div>
            ) : (
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-2 hover:bg-white/10">
                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Wallet Badge - Only on desktop */}
                      <div className="hidden md:block">
                        <Badge variant="secondary" className="bg-meme-purple/20 text-meme-purple border-meme-purple/30 text-xs font-medium px-2 py-1">
                          <Shield className="w-3 h-3 mr-1" />
                          {publicKey ? formatAddress(publicKey) : 'Connected'}
                        </Badge>
                      </div>
                      
                      {/* Profile Avatar - All screens */}
                      <Avatar className="w-8 h-8 ring-2 ring-meme-purple/50">
                        <AvatarImage src="" alt="Profile" />
                        <AvatarFallback className="bg-gradient-rainbow text-white font-bold text-sm">
                          {publicKey ? publicKey.slice(0, 2).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Chevron - Only on desktop */}
                      <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 bg-meme-dark/95 border-white/20 backdrop-blur-lg shadow-xl forceMount">
                  {/* Wallet Info */}
                  <div className="px-2 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" alt="Profile" />
                        <AvatarFallback className="bg-gradient-rainbow text-white font-bold">
                          {publicKey ? publicKey.toString().slice(0, 2).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white font-display">
                          {loading ? 'Loading...' : user?.username || 'Wallet Connected'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {publicKey ? formatAddress(publicKey) : 'Unknown'}
                        </p>
                        {user?.role && (
                          <p className="text-xs text-meme-purple capitalize">
                            {user?.role.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuItem 
                    onClick={copyAddress}
                    className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Copy Address
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={viewOnExplorer}
                    className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    View on Solscan
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  
                  {/* <DropdownMenuItem asChild>
                    <Link href="/profile" className="text-gray-300 hover:text-white hover:bg-white/10 w-full">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="text-gray-300 hover:text-white hover:bg-white/10 w-full">
                      <Package className="w-4 h-4 mr-2" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="text-gray-300 hover:text-white hover:bg-white/10 w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem> */}
                  
                  {/* <DropdownMenuItem asChild>
                    <Link href="/settings" className="text-gray-300 hover:text-white hover:bg-white/10 w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem> */}
                  
                  <DropdownMenuItem asChild>
                    <Link href="https://x.com/bullrhun" className="text-gray-300 hover:text-white hover:bg-white/10 w-full">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin Links - Only show for admin roles */}
                  {connected && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10 my-1" />
                      
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="text-meme-purple hover:text-meme-purple hover:bg-meme-purple/10 w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.reload()}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Desktop Hamburger Menu - Large screens only */}
            <div className="hidden lg:block">
              <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 text-white hover:text-meme-purple hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" title="Navigation Menu" className="w-80 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/10 backdrop-blur-xl">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-meme-purple to-meme-blue flex items-center justify-center">
                          <Menu className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-display">Menu</h3>
                          <p className="text-sm text-gray-400">Navigate through BullRhun</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsSideMenuOpen(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-2">
                        <Link 
                          href="/" 
                          className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-purple"
                          onClick={() => setIsSideMenuOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold">🏠</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white font-display">Home</h4>
                            <p className="text-xs text-gray-400">Main dashboard</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/token" 
                          className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-blue"
                          onClick={() => setIsSideMenuOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-blue/20 to-meme-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold">🪙</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white font-display">Token</h4>
                            <p className="text-xs text-gray-400">BULLRHUN token info</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/merch" 
                          className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-green"
                          onClick={() => setIsSideMenuOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-green/20 to-meme-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold">🛍️</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white font-display">Shop</h4>
                            <p className="text-xs text-gray-400">Merchandise store</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/submit-design" 
                          className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white hover:text-meme-orange"
                          onClick={() => setIsSideMenuOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-meme-orange/20 to-meme-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold">🎨</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white font-display flex items-center gap-2">
                              Design
                              <span className="w-2 h-2 bg-meme-orange rounded-full animate-pulse"></span>
                            </h4>
                            <p className="text-xs text-gray-400">Submit your designs</p>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h4>
                        <div className="space-y-2">
                          <Link 
                            href="/cart"
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                            onClick={() => setIsSideMenuOpen(false)}
                          >
                            <ShoppingCart className="w-5 h-5 text-meme-purple" />
                            <span className="text-white">Cart {items.length > 0 && `(${items.length})`}</span>
                          </Link>
                          
                          {connected && (
                            <Link 
                              href="/orders"
                              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                              onClick={() => setIsSideMenuOpen(false)}
                            >
                              <Package className="w-5 h-5 text-meme-blue" />
                              <span className="text-white">My Orders</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-6 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          BullRhun © 2024
                        </div>
                        <Link 
                          href="https://x.com/bullrhun" 
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                          onClick={() => setIsSideMenuOpen(false)}
                        >
                          Support
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile Wallet Connect Button - Only on mobile */}
            {!connected && (
              <div className="md:hidden">
                <WalletIcon />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    <div className="h-20"></div>
    </>
  )
}