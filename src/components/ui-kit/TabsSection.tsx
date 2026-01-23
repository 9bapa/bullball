'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  LayoutGrid,
  List,
  Calendar,
  Settings,
  Zap,
  Package,
  Users,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Star,
  Heart,
  Bookmark,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TabsSection() {
  const [activeTab, setActiveTab] = useState('icons')

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Enhanced Tabs</h2>
            <p className="text-muted-foreground text-sm font-mono">Dynamic tab navigation</p>
          </div>
        </div>

        {/* Tab Style Selector */}
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
          <CardContent className="relative z-10 p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'icons', label: 'With Icons', icon: LayoutGrid },
                { id: 'simple', label: 'Simple', icon: List },
                { id: 'badges', label: 'With Badges', icon: Calendar },
                { id: 'mixed', label: 'Mixed', icon: Settings },
              ].map((style) => {
                const Icon = style.icon
                const isActive = activeTab === style.id
                return (
                  <button
                    key={style.id}
                    onClick={() => setActiveTab(style.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl',
                      'transition-all duration-300 group',
                      'hover:scale-105',
                      isActive
                        ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 shadow-lg text-white'
                        : 'bg-white/50 hover:bg-white/70'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isActive ? 'text-white' : '')}>
                      {style.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Icon Tabs */}
      {activeTab === 'icons' && (
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
          <CardContent className="relative z-10 pt-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30 rounded-2xl p-1.5">
                {[
                  { id: 'overview', icon: Sparkles, label: 'Overview' },
                  { id: 'products', icon: Package, label: 'Products' },
                  { id: 'users', icon: Users, label: 'Users' },
                  { id: 'stats', icon: TrendingUp, label: 'Stats' },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative overflow-hidden group"
                    >
                      {tab.value === 'overview' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent animate-gradient-shift" />
                      )}
                      <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-medium">{tab.label}</span>
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="overview" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <Sparkles className="h-6 w-6 text-primary animate-bounce-slight" />
                    <div>
                      <h4 className="font-semibold text-foreground">Dashboard Overview</h4>
                      <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening today.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-12 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <Zap className="mr-2 h-4 w-4" />
                      Quick Actions
                    </Button>
                    <Button variant="outline" className="h-12 shadow-lg hover:scale-105 transition-all duration-300">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Products</h4>
                      <p className="text-sm text-muted-foreground">Manage your card collection</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">48</Badge>
                  </div>
                  <div className="space-y-3">
                    {['BullRun Legendary', 'Bitcoin Genesis', 'Ethereum Rare', 'BNB Limited'].map((product, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-border/20 hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <span className="font-medium text-foreground">{product}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Users</h4>
                      <p className="text-sm text-muted-foreground">Team and customer management</p>
                    </div>
                    <Button size="sm" className="shadow-md hover:scale-105 transition-all duration-300">
                      Add User
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Admin', 'Moderator', 'Viewer'].map((role, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20 hover:shadow-md hover:scale-105 transition-all duration-300">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70" />
                        <span className="text-sm font-medium">{role}</span>
                        <span className="text-xs text-muted-foreground">{12 + i * 8}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Analytics</h4>
                    <p className="text-sm text-muted-foreground">Performance metrics and insights</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Orders', value: '1,234', change: '+12%' },
                      { label: 'Revenue', value: '$45,678', change: '+8.5%' },
                      { label: 'Active Users', value: '2,847', change: '+23%' },
                      { label: 'Conversion', value: '3.2%', change: '+1.8%' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20 hover:shadow-md hover:scale-105 transition-all duration-300">
                        <p className="text-xs text-muted-foreground font-mono uppercase">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                        <p className="text-sm text-emerald-600 font-semibold">↑ {stat.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Badge Tabs */}
      {activeTab === 'badges' && (
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
          <CardContent className="relative z-10 pt-8">
            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="h-12 bg-muted/30 rounded-2xl p-1.5 flex gap-1">
                {[
                  { id: 'featured', label: 'Featured', badge: '12' },
                  { id: 'new', label: 'New Arrivals', badge: '8' },
                  { id: 'trending', label: 'Trending', badge: '24' },
                  { id: 'sale', label: 'On Sale', badge: '5' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative flex items-center gap-2 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 text-sm font-medium">{tab.label}</span>
                    <Badge
                      className={cn(
                        'relative z-10 shadow-md transition-transform group-hover:scale-110',
                        tab.badge === '5'
                          ? 'bg-emerald-500'
                          : 'bg-primary'
                      )}
                    >
                      {tab.badge}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="featured" className="mt-6 space-y-4">
                {[
                  { name: 'BullRun Legendary Card', type: 'BULLRUN', price: 249.99, change: '+15.3%' },
                  { name: 'Bitcoin Genesis Set', type: 'BTC', price: 89.99, change: '-2.4%' },
                  { name: 'Ethereum Rare Edition', type: 'ETH', price: 129.99, change: '+8.7%' },
                  { name: 'BNB Limited Drop', type: 'BNB', price: 179.99, change: '+12.1%' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-xs">{item.type}</Badge>
                          <span className="font-mono text-sm text-foreground">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      'text-sm font-semibold',
                      item.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {item.change}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="new" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="text-center space-y-4">
                  <Sparkles className="h-12 w-12 mx-auto text-primary animate-bounce-slight" />
                  <h4 className="text-xl font-semibold text-foreground">New Arrivals</h4>
                  <p className="text-sm text-muted-foreground">8 new products just dropped!</p>
                  <Button className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    Explore Collection
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Simple Tabs */}
      {activeTab === 'simple' && (
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
          <CardContent className="relative z-10 pt-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="h-12 bg-muted/30 rounded-2xl p-1.5">
                {['Details', 'Reviews', 'Specs', 'Shipping'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab.toLowerCase()}
                    className="text-sm font-medium transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10">{tab}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="details" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Product Details</h4>
                    <p className="text-sm text-muted-foreground">Authentic crypto-themed trading cards with premium quality and exclusive designs.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">Trading Card</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rarity</p>
                      <p className="font-medium text-foreground">Legendary</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Edition</p>
                      <p className="font-medium text-foreground">Limited</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">Reviews</h4>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Amazing quality! {i === 1 && '⭐⭐⭐⭐⭐'}</p>
                          <p className="text-xs text-muted-foreground">{['John D.', 'Sarah M.', 'Mike R.'][i]} • {['2 days ago', '1 week ago', '2 weeks ago'][i]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-6 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 animate-slide-up">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-foreground">Specifications</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20">
                      <p className="text-muted-foreground">Material</p>
                      <p className="font-medium text-foreground">Premium Card Stock</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20">
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium text-foreground">63mm × 88mm</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20">
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium text-foreground">300 GSM</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20">
                      <p className="text-muted-foreground">Finish</p>
                      <p className="font-medium text-foreground">Matte UV</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Mixed Tabs */}
      {activeTab === 'mixed' && (
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
          <CardContent className="relative z-10 pt-8">
            <Tabs defaultValue="library" className="w-full">
              <TabsList className="grid grid-cols-2 h-14 bg-muted/30 rounded-2xl p-1.5">
                {[
                  { id: 'library', icon: Package, label: 'Library' },
                  { id: 'favorites', icon: Star, label: 'Favorites', count: '24' },
                  { id: 'wishlist', icon: Heart, label: 'Wishlist', count: '8' },
                  { id: 'saved', icon: Bookmark, label: 'Saved', count: '12' },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative flex items-center gap-2 overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
                      <span className="relative z-10 text-sm font-medium">{tab.label}</span>
                      {tab.count && (
                        <Badge className="relative z-10 ml-auto shadow-md transition-transform group-hover:scale-110">
                          {tab.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="library" className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="h-20 w-20 mx-auto rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-center font-medium text-foreground text-sm">Card #{i}</p>
                      <p className="text-center text-xs text-muted-foreground">Type {i}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="favorites" className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent animate-slide-up">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary text-white shadow-xl animate-bounce-slight">
                    <Star className="h-10 w-10 fill-current" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground">24 Favorites</h4>
                  <p className="text-sm text-muted-foreground">Items you've marked as favorites</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
