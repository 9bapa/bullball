'use client'

import { useState } from 'react'
import { ShoppingCart, Search, User, Menu as MenuIcon, X, Wallet, LogOut, Wallet as WalletIcon, Link } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlideOutMenu } from './SlideOutMenu'

import { useCartStore } from '@/store/cart'
import { WalletMultiButton, WalletDisconnectButton, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui'
import { useUserContext, getShortAddress } from '@/context/userContext'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartCount = useCartStore(state => state.getTotalItems())
  const { setVisible } = useWalletModal()
const { connected, publicKey, user } = useUserContext()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
            <div className="flex items-center relative">
              <span className="font-brand text-2xl font-bold tracking-tight text-primary">
                BullRhun
              </span>
              <div className="absolute -right-3 -top-1 w-2 h-2 bg-green-500 rounded-full pulse-subtle"></div>
            </div>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-8">

            <a
              href="/swap"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group"
            >
              Swap
              <span className="absolute -bottom-5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </a>
            <a
              href="/memes"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group"
            >
              Memes
              <span className="absolute -bottom-5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </a>
            <a
              href="/anthem"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group"
            >
              Anthem
              <span className="absolute -bottom-5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </a>
            <a
              href="/about"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group"
            >
              About
              <span className="absolute -bottom-5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-primary/5">
              <Search className="h-5 w-5" />
            </Button>
            {!connected? (
              <div className="hidden md:block">
                    <WalletModalButton className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                      <Wallet className="h-6 w-6" />
                    </WalletModalButton>
              </div>
            ) : (
              <p className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group">
                {`${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`}
              </p>
            )}
          
            {/* <WalletMultiButton
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              startIcon={<WalletIcon className="h-4 w-4" />}
            >
              Connect Wallet
            </WalletMultiButton> */}
                
              <>
                {/* Show wallet info when connected */}
                {/* <div className="hidden md:flex items-center gap-3 mr-2">
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10" title="Connected Wallet">
                    <WalletIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </Button>
                </div> */}

                {/* Show profile button when connected */}
              {connected && (
                  <>
                <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-primary/5" asChild>
                  <a href="/profile">
                    <User className="h-5 w-5" />
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/5"
                  asChild
                >
                  <a href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-mono font-bold"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </a>
                </Button>
                </>
                )}


                {/* Show disconnect button when connected */}
                {/* <WalletDisconnectButton className="hidden md:flex hover:bg-destructive/10 hover:text-destructive" /> */}

                {/* Mobile menu button always shows */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-primary/5"
                  onClick={() => setIsMenuOpen(true)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                </Button>
                </>
            </div>
        </div>
      </header>

      <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} cartCount={cartCount} />
    </>
  )
}
