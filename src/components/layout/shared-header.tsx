'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDynamicWallet } from '@/components/wallet/DynamicWalletProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut, 
  Wallet as WalletIcon, 
  ChevronDown,
  Shield,
  Store,
  Package,
  Heart,
  HelpCircle
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { WalletConnectButton } from '@/components/wallet/WalletConnectModal'

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
  const { connected, publicKey, user } = useDynamicWallet()
  const { items } = useCartStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Set loading state when user changes
  useEffect(() => {
    setLoading(false)
  }, [user])

  // User data is now provided by useDynamicWallet hook

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
    }
  }

  const viewOnExplorer = () => {
    if (publicKey) {
      window.open(`https://solscan.io/account/${publicKey.toString()}`, '_blank')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 glass-header z-50 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - Only on mobile */}
          <button 
            onClick={onMenuToggle}
            className="md:hidden touch-target p-2 text-white hover:text-meme-purple transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </div>
          </button>
          
          {/* Logo - All screens */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="flex flex-col items-center justify-center">
              <span className="font-bold text-meme-gradient text-lg md:text-xl lg:text-2xl font-display tracking-tight leading-tight">
                Bull<span className="italic ">Rhun</span>
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wider hidden md:block">24/7 Bull<em>Rhun</em></span>
            </div>
          </Link>
          
          {/* Desktop Navigation - Desktop and Tablet */}
          <nav className="hidden md:flex items-center justify-center gap-1">
            {/* Desktop Navigation - Full featured */}
            <div className="hidden lg:flex items-center bg-black/20 rounded-xl p-1 backdrop-blur-sm border border-white/10">
              <Link 
                href="/" 
                className="relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all duration-300 group"
              >
                <span className="relative z-10 text-white group-hover:text-meme-purple">Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-meme-purple/20 to-meme-blue/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              
              <Link 
                href="/token" 
                className="relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all duration-300 group"
              >
                <span className="relative z-10 text-gray-300 group-hover:text-meme-blue">Token</span>
                <div className="absolute inset-0 bg-gradient-to-r from-meme-blue/20 to-meme-green/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              
              <Link 
                href="/merch" 
                className="relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all duration-300 group"
              >
                <span className="relative z-10 text-gray-300 group-hover:text-meme-green">Shop</span>
                <div className="absolute inset-0 bg-gradient-to-r from-meme-green/20 to-meme-orange/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              
              <Link 
                href="/submit-design" 
                className="relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all duration-300 group"
              >
                <span className="relative z-10 text-gray-300 group-hover:text-meme-orange flex items-center gap-1">
                  Design
                  <span className="w-2 h-2 bg-meme-orange rounded-full animate-pulse"></span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-meme-orange/20 to-meme-pink/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Tablet Navigation - Simplified */}
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
                TOken
              </Link>
              <Link 
                href="/sho" 
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
                <WalletConnectButton />
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
                          {publicKey ? publicKey.toString().slice(0, 2).toUpperCase() : 'U'}
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
                    <WalletIcon className="w-4 h-4 mr-2" />
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

            {/* Mobile Wallet Connect Button - Only on mobile */}
            {!connected && (
              <div className="md:hidden">
                <WalletConnectButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}