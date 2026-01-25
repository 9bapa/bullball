'use client'

import { useEffect } from 'react'
import { X, Home, Search, User, Tag, Layers, ShoppingCart, Layout, Wallet, LogOut, ArrowDownUp, Wallet as WalletIcon, Music, LaughIcon, Book } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/components/auth/useAuthStore'
import { useSolanaWallet } from '@/components/solana/useSolanaWalletUI'
import { WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'

interface SlideOutMenuProps {
  isOpen: boolean
  onClose: () => void
  cartCount?: number
}

export function SlideOutMenu({ isOpen, onClose, cartCount = 0 }: SlideOutMenuProps) {
  const { connect: authConnect, disconnect: authDisconnect, isConnected } = useAuthStore()
  const { wallet, isLoading, error, connect: walletConnect, disconnect: walletDisconnect, getShortAddress } = useSolanaWallet()

  const menuItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: ArrowDownUp, label: 'Swap', href: '/swap' },
    { icon: LaughIcon, label: 'Memes', href: '/memes' },
    { icon: Music, label: 'Anthem', href: '/anthem' },
    { icon: Book, label: 'About', href: '/about' },
  ]

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Slide out menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isOpen ? '0%' : '100%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border shadow-2xl z-50"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <h2 className="font-display font-bold text-xl text-foreground">
                  Menu
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Navigate to sections
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-primary/10 group transition-all duration-200"
                  >
                    <div className="p-2.5 rounded-lg bg-muted/30 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <span className="font-display font-semibold text-base text-foreground">
                        {item.label}
                      </span>
                    </div>
                  </a>
                )
              })}
            </nav>

            {/* Disconnect Button */}
            <div className="p-4 border-t border-border/50">
              <WalletDisconnectButton className="w-full flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold transition-colors">
                <LogOut className="h-4 w-4" />
                Disconnect Wallet
              </WalletDisconnectButton>
            </div>

            {/* Menu Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                BullRhun • Crypto & Trading Merch
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
