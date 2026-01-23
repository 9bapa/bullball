'use client'

import { usePathname } from 'next/navigation'
import { Home, LaughIcon, ArrowDownUp, Music, User } from 'lucide-react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import Link from 'next/link'

export function MobileBottomNav() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const navItems = [
    { icon: ArrowDownUp, label: 'Swap', href: '/swap', side: 'left' },
    { icon: LaughIcon, label: 'Memes', href: '/memes', side: 'left' },
    { icon: Music, label: 'Anthem', href: '/anthem', side: 'right' },
    { icon: User, label: 'Profile', href: '/profile', side: 'right' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="bg-background/95 backdrop-blur border-t border-border/50 pb-safe">
        <div className="flex items-center justify-between h-16 px-4 gap-2">
          {/* Left side buttons */}
          <div className="flex items-center gap-1 flex-1">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1 h-14 flex-1 group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Center action button */}
          <div className="relative w-20">
            {isHomePage ? (
              <Link
                href="/"
                className="flex flex-col items-center justify-center gap-1 h-14 w-full group"
              >
                <Home className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors duration-200" />
              </Link>
            ) : (
              <CartDrawer />
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-1 flex-1">
            {navItems.slice(2, 4).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1 h-14 flex-1 group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
