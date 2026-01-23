'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/components/auth/useAuthStore'
import { useSolanaWallet } from '@/components/solana/useSolanaWalletUI'
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  Package,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Edit3,
  Save,
  Shield,
  Lock,
  Globe,
  Bell,
  ChevronRight,
  CreditCard as CreditCardIcon,
  LayoutGrid,
  Wallet,
  Gift,
  TrendingUp,
  Trophy,
  LogOut,
  Plus,
  Trash2,
  Upload,
  Camera,
  Home,
  Award,
  History,
  Eye,
  DollarSign,
  Sparkle,
  Copy
} from 'lucide-react'
import { useUserContext } from '@/context/userContext'
import { cryptoService } from '@/services/crypto.service'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
interface Address {
  id: string
  label: string
  name: string
  street: string
  city: string
  state: string
  zip: string
  isDefault: boolean
  type: 'shipping' | 'billing'
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  image_url: string
  mint: string
  stock_quantity: number
  created_at: string
}

interface Order {
  id: string
  order_number: string
  customer_wallet_address: string
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product: Product
}

interface Notification {
  id: string
  type: 'order' | 'product' | 'account' | 'promotion'
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
}



export default function ProfilePage() {
const { connected, publicKey, user } = useUserContext()

  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0)
  const [solBalance, setSolBalance] = useState<number>(0)

  // Fetch SOL balance when wallet connects
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        const balance = await cryptoService.getSOLBalance(publicKey)
        setSolBalance(balance)
      } else {
        setSolBalance(0)
      }
    }
    fetchBalance()
  }, [connected, publicKey])

  // Fetch user data when wallet connects
  useEffect(() => {
    const fetchUserData = async () => {
      if (!connected || !publicKey) return

      setLoading(prev => ({ ...prev, 
        addresses: true, orders: true, wishlist: true, notifications: true 
      }))

      try {
        // Fetch addresses
        const addressesRes = await fetch(`/api/user/addresses?wallet=${publicKey}`)
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json()
          setAddresses(addressesData.addresses || [])
        }

        // Fetch orders
        const ordersRes = await fetch(`/api/user/orders?wallet=${publicKey}`)
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setOrders(ordersData.orders || [])
        }

        // Fetch wishlist
        const wishlistRes = await fetch(`/api/user/wishlist?wallet=${publicKey}`)
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json()
          setWishlist(wishlistData.products || [])
        }

        // Fetch notifications
        const notifRes = await fetch(`/api/user/notifications?wallet=${publicKey}`)
        if (notifRes.ok) {
          const notifData = await notifRes.json()
          setNotifications(notifData.notifications || [])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(prev => ({ ...prev, 
          addresses: false, orders: false, wishlist: false, notifications: false 
        }))
      }
    }

    fetchUserData()
  }, [connected, publicKey])

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.display_name?.split(' ')[0] || '',
    lastName: user?.display_name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || 'Crypto enthusiast and collector'
  })

  // Get real user points and redemptions
  const userPoints = user?.points || 0
  const userRedemptions = user?.redemptions || 0

  // Real data states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState({
    profile: false,
    addresses: false,
    orders: false,
    wishlist: false,
    notifications: false
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    marketingEmails: true
  })

  // Avatar presets
  const avatarPresets = [
    { id: 0, emoji: '👨', name: 'Default', color: 'bg-blue-500' },
    { id: 1, emoji: '👨‍💼', name: 'Business', color: 'bg-purple-500' },
    { id: 2, emoji: '👨‍🎨', name: 'Creative', color: 'bg-pink-500' },
    { id: 3, emoji: '🧔', name: 'Casual', color: 'bg-green-500' },
    { id: 4, emoji: '🦊', name: 'Animal', color: 'bg-orange-500' },
    { id: 5, emoji: '🌟', name: 'Space', color: 'bg-cyan-500' },
    { id: 6, emoji: '🎭', name: 'Artistic', color: 'bg-indigo-500' },
  ]

  

  const handleSaveProfile = async () => {
    if (!connected || !publicKey) return
    
    try {
      const response = await fetch('/api/user/profile?wallet=' + publicKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profile.firstName + ' ' + profile.lastName,
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio
        })
      })
      
      if (response.ok) {
        setIsEditing(false)
        // Refresh user data
        window.location.reload()
      } else {
        console.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleSavePreferences = () => {
    console.log('Saving preferences:', preferences)
  }

  const handleAddAddress = () => {
    // Create a new address form
    const newAddress = {
      type: 'shipping' as const,
      isDefault: addresses.length === 0,
      firstName: profile.firstName || user?.display_name?.split(' ')[0] || '',
      lastName: profile.lastName || user?.display_name?.split(' ')[1] || '',
      company: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: profile.phone || user?.phone || ''
    }
    
    // Add address via API
    fetch('/api/user/addresses?wallet=' + publicKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddress)
    })
      .then(response => response.json())
      .then(data => {
        if (data.address) {
          // Refresh addresses
          window.location.reload()
        }
      })
      .catch(error => console.error('Error adding address:', error))
  }

  const handleSetDefaultAddress = (id: string) => {
    console.log('Set default address:', id)
  }

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        <section className="relative py-8 lg:py-12 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
              <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
            </div>

          {!connected ? (
            <div className="max-w-xl mx-auto">
              <Card className="border-primary/10">
                <CardContent className="p-12 text-center">
                  <User className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
                  <h2 className="text-3xl font-bold mb-4">Sign In Required</h2>
                  <p className="text-muted-foreground mb-6">
                    Connect your Solana wallet to access your profile
                  </p>
                  <Button className="w-full py-6 text-lg font-bold">
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="container px-4">
              {/* Profile Header */}
              <div className="max-w-3xl mx-auto">
                <Card className="border-primary/20 mb-8 overflow-hidden bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-900/20">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                      {/* Profile Picture Section */}
                      <div className="flex flex-col items-center gap-6 lg:items-start">
                        <div className="relative group">
                          <div className="w-28 h-28 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-5xl shadow-xl ring-4 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-300">
                            {avatarPresets[selectedAvatar].emoji}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 shadow-lg group-hover:scale-110 transition-all duration-300"
                          >
                            <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </Button>
                        </div>

                        {/* Avatar Presets */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                          {avatarPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => setSelectedAvatar(preset.id)}
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-md ${
                                selectedAvatar === preset.id
                                  ? 'ring-4 ring-purple-500 scale-110 shadow-purple-500/25'
                                  : 'hover:scale-110 hover:shadow-lg'
                              } ${preset.color}`}
                            >
                              {preset.emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* User Info Section */}
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-purple-600 bg-clip-text text-transparent">
                            {profile.firstName} {profile.lastName}
                          </h1>
                          <p className="text-muted-foreground text-lg mb-4 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {profile.email}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mb-6">
                            <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 px-3 py-1.5 text-sm font-medium">
                              <Award className="w-4 h-4 mr-1.5" />
                              {userPoints >= 3000 ? 'Platinum' : userPoints >= 1500 ? 'Gold' : userPoints >= 500 ? 'Silver' : 'Bronze'} Member
                            </Badge>
                            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full">
                              <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm font-mono font-medium">
                                {`${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() => setIsEditing(!isEditing)}
                            variant={isEditing ? 'default' : 'outline'}
                            size="lg"
                            className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                          >
                            {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                            {isEditing ? 'Save Profile' : 'Edit Profile'}
                          </Button>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                              <ShoppingBag className="h-4 w-4" />
                              <span className="text-xs font-medium">Orders</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">24</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                              <Heart className="h-4 w-4" />
                              <span className="text-xs font-medium">Wishlist</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">12</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                              <Trophy className="h-4 w-4" />
                              <span className="text-xs font-medium">Points</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{userPoints.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Tabs */}
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-2 h-auto justify-center">
                  <TabsTrigger value="profile" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <MapPin className="h-4 w-4" />
                    Addresses
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <Settings className="h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="loyalty" className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm">
                    <Trophy className="h-4 w-4" />
                    Loyalty
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                              value={profile.firstName}
                              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                              value={profile.lastName}
                              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Bio</Label>
                          <Input
                            placeholder="Tell us about yourself..."
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        {isEditing && (
                          <div className="flex gap-4 md:col-span-2 pt-4">
                            <Button onClick={handleSaveProfile} className="flex-1">
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-primary" />
                          Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                            <div>
                              <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">Password</p>
                              <p className="text-xs text-purple-800 dark:text-purple-200">Last changed 30 days ago</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Change
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-green-600 dark:text-green-500" />
                            <div>
                              <p className="font-semibold text-sm text-green-900 dark:text-green-100">Two-Factor Auth</p>
                              <p className="text-xs text-green-800 dark:text-green-200">Enabled</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          Connected Devices
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-6">
                  <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Order History
                        <Badge variant="outline" className="ml-2">{orders.length} orders</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading.orders ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : orders.length > 0 ? (
                        <div className="space-y-3">
                          {orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-6 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-lg">{order.id}</span>
                                  {order.status === 'delivered' && (
                                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Delivered
                                    </Badge>
                                  )}
                                  {order.status === 'shipped' && (
                                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                                      <Package className="w-3 h-3 mr-1" />
                                      Shipped
                                    </Badge>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Processing
                                    </Badge>
                                  )}
                                  {order.status === 'pending' && (
                                    <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                  {order.status === 'paid' && (
                                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Paid
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} items
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ${order.total_amount.toFixed(2)}
                                </p>
                                <div className="flex gap-2 justify-end mt-2">
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Details
                                  </Button>
                                  {order.status === 'delivered' && (
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Star className="h-4 w-4" />
                                      Review
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No orders yet</p>
                          <p className="text-sm text-muted-foreground">Start shopping to see your order history</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Wishlist Tab */}
                <TabsContent value="wishlist" className="mt-6">
                  <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Wishlist ({wishlist.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading.wishlist ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : wishlist.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {wishlist.map((product) => (
                          <Card key={product.id} className="border-primary/10 hover:border-primary/20 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center shrink-0">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <span className="text-4xl">📦</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold mb-1 truncate">{product.name}</h4>
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="text-lg font-bold text-primary">
                                      ${product.price.toFixed(2)}
                                    </p>
                                  </div>
                                  {product.stock_quantity > 0 ? (
                                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                      In Stock ({product.stock_quantity})
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                      Out of Stock
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 gap-2"
                                  onClick={() => {
                                    // Add to cart functionality
                                    fetch('/api/cart', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        wallet_address: publicKey,
                                        product_id: product.id,
                                        quantity: 1
                                      })
                                    })
                                  }}
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                  Add to Cart
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => {
                                    // Remove from wishlist functionality
                                    fetch(`/api/user/wishlist/${product.id}?wallet=${publicKey}`, { method: 'DELETE' })
                                      .then(() => {
                                        setWishlist(prev => prev.filter(p => p.id !== product.id))
                                      })
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Your wishlist is empty</p>
                          <p className="text-sm text-muted-foreground">Add items to your wishlist to keep track of products you love</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Wallet Tab */}
                <TabsContent value="wallet" className="mt-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="border-purple-20 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          Solana Wallet
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {publicKey ? (
                          <>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                                <Wallet className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-purple-900 dark:text-purple-100">
                                  Connected
                                </p>
                                <p className="text-xs text-purple-800 dark:text-purple-200">
                                  {`${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`}
                                </p>
                              </div>
                              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-background border border-purple-200 dark:border-purple-800">
                                <Label className="text-xs mb-2">Connected Wallet</Label>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                                  {solBalance.toFixed(4)} SOL
                                </p>
                              </div>
                              <div className="p-4 rounded-xl bg-background border border-purple-200 dark:border-purple-800">
                                <Label className="text-xs mb-2">Wallet Address</Label>
                                <p className="text-2xl font-bold">
                                  ${(publicKey ? 150 : 0).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <Button className="flex-1 gap-2" variant="outline">
                                <Eye className="h-4 w-4" />
                                View on Solscan
                              </Button>
                              <Button className="flex-1 gap-2" variant="outline">
                                <Copy className="h-4 w-4" />
                                Copy Address
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-semibold mb-2">No Wallet Connected</p>
                            <p className="text-sm text-muted-foreground mb-6">
                              Connect your Solana wallet to see your balance and transaction history
                            </p>
                            <Button className="mx-auto gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                              <Wallet className="h-5 w-5" />
                              Connect Phantom
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Recent Transactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { type: 'receive', amount: 150, date: '2 hours ago', sol: 1.0, hash: '5xX...8f' },
                            { type: 'send', amount: 50, date: '1 day ago', sol: 0.33, hash: '3xX...2c' },
                            { type: 'swap', from: 'BTC', to: 'ETH', amount: 2, date: '3 days ago', sol: 1.5, hash: '7xX...9a' },
                          ].map((tx, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  tx.type === 'receive' ? 'bg-green-100 dark:bg-green-900/30' :
                                  tx.type === 'send' ? 'bg-red-100 dark:bg-red-900/30' :
                                  'bg-purple-100 dark:bg-purple-900/30'
                                }`}>
                                  <Badge className={tx.type === 'receive' ? 'text-green-700 dark:text-green-400' : tx.type === 'send' ? 'text-red-700 dark:text-red-400' : 'text-purple-700 dark:text-purple-400'}>
                                    {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : '⇄'}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {tx.type === 'receive' ? 'Received' : tx.type === 'send' ? 'Sent' : 'Swapped'} {tx.amount} SOL
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {tx.date}
                                  </p>
                                  <p className="text-xs font-mono text-purple-600 dark:text-purple-400">
                                    {tx.hash}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Confirmed
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses" className="mt-6">
                  <Card className="border-primary/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Address Book
                        </CardTitle>
                        <Button size="sm" onClick={handleAddAddress} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Address
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <Card key={address.id} className={`border ${address.isDefault ? 'border-purple-200 dark:border-purple-800' : 'border-primary/10'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-lg ${address.type === 'shipping' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                    {address.type === 'shipping' ? <MapPin className="h-4 w-4 text-purple-700 dark:text-purple-400" /> : <CreditCardIcon className="h-4 w-4 text-green-700 dark:text-green-400" />}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">{address.label}</p>
                                    <p className="text-xs text-muted-foreground">{address.name}</p>
                                  </div>
                                </div>
                                {address.isDefault && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-1 mb-3">
                                <p className="text-sm">{address.street}</p>
                                <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                              </div>

                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                {!address.isDefault && (
                                  <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address.id)} className="flex-1">
                                    <Home className="h-4 w-4 mr-1" />
                                    Set Default
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="mt-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          General Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <select
                            className="w-full p-3 border border-primary/20 rounded-lg"
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Español</option>
                            <option value="French">Français</option>
                            <option value="German">Deutsch</option>
                            <option value="Chinese">中文</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <select
                            className="w-full p-3 border border-primary/20 rounded-lg"
                            value={preferences.currency}
                            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="SOL">SOL - Solana</option>
                            <option value="GBP">GBP - British Pound</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <select
                            className="w-full p-3 border border-primary/20 rounded-lg"
                            value={preferences.timezone}
                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                          >
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="UTC">Coordinated Universal Time (UTC)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id="marketingEmails"
                            checked={preferences.marketingEmails}
                            onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                            className="w-5 h-5 rounded"
                          />
                          <Label htmlFor="marketingEmails" className="text-sm">
                            Receive marketing emails
                          </Label>
                        </div>

                        <Button onClick={handleSavePreferences} className="w-full">
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-primary" />
                          Recent Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {loading.notifications ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 rounded-xl border ${
                                notif.is_read ? 'border-muted' : 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${!notif.is_read ? 'bg-purple-500' : 'bg-muted'}`}></div>
                                    <p className="font-semibold text-sm">{notif.title}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      notif.type === 'order' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                      notif.type === 'product' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                      notif.type === 'account' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    }`}>
                                      {notif.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-1">{notif.message}</p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400">
                                    {new Date(notif.created_at).toLocaleDateString()} • {new Date(notif.created_at).toLocaleTimeString()}
                                  </p>
                                </div>
                                {!notif.is_read && (
                                  <button
                                    onClick={() => {
                                      // Mark as read API call
                                      fetch(`/api/user/notifications/${notif.id}/read?wallet=${publicKey}`, { method: 'PUT' })
                                        .then(() => {
                                          setNotifications(prev => prev.map(n => 
                                            n.id === notif.id ? { ...n, is_read: true } : n
                                          ))
                                        })
                                    }}
                                    className="ml-4 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No notifications yet</p>
                            <p className="text-sm text-muted-foreground">We'll notify you about important updates</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="mt-6">
                  <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Notification Center
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-200 dark:border-purple-800 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <Gift className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-purple-900 dark:text-purple-100">Special Offer!</p>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              Get 20% off your next purchase with code SOL20
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-white text-purple-700">New</Badge>
                      </div>

                      {[
                        { title: 'Order Shipped', message: 'Your order #ORD-2024-001 has been shipped and is on its way!', date: '2 hours ago' },
                        { title: 'Price Drop', message: 'Sui Limited Edition is now $169.99 (was $199.99)!', date: '5 hours ago' },
                        { title: 'Wishlist Update', message: 'Bitcoin Gold Card is back in stock!', date: '1 day ago' },
                        { title: 'Loyalty Points', message: 'You earned 50 points from your recent purchase!', date: '2 days ago' },
                        { title: 'Welcome Gift', message: 'You received a 10% discount coupon for being a loyal customer!', date: '3 days ago' },
                      ].map((notif, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mb-2">{notif.message}</p>
                            <p className="text-xs text-muted-foreground">{notif.date}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                

                {/* Loyalty Tab */}
                <TabsContent value="loyalty" className="mt-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-primary" />
                          Loyalty Program
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 to-purple-700 mb-6">
                          <Trophy className="h-16 w-16 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2 text-purple-600 dark:text-purple-400">
                          {userPoints.toLocaleString()} BULL Tokens
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Current Tier: {userPoints >= 3000 ? 'Platinum' : userPoints >= 1500 ? 'Gold' : userPoints >= 500 ? 'Silver' : 'Bronze'}</p>
                        <div className="max-w-md mx-auto mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Progress to {userPoints >= 3000 ? 'Max Level' : userPoints >= 1500 ? 'Platinum' : userPoints >= 500 ? 'Gold' : 'Silver'}</span>
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{userPoints >= 3000 ? 0 : userPoints >= 1500 ? 3000 - userPoints : userPoints >= 500 ? 1500 - userPoints : 500 - userPoints} points</span>
                          </div>
                          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-600 to-amber-700" style={{ width: `${Math.min((userPoints / 3000) * 100, 100)}%` }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center">
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{userPoints.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center">
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${(userPoints * 0.25).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Value</p>
                          </div>
                          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center">
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{userRedemptions.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Redemptions</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary" />
                          Rewards
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center py-8">
                          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 to-purple-700 mb-6">
                            <Trophy className="h-16 w-16 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">Coming Soon!</h3>
                          <p className="text-sm text-muted-foreground mb-6">Our rewards program is under development. Check back soon for exclusive benefits and special offers.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 text-center">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                                </div>
                                <div>
                                  <p className="font-semibold text-purple-900 dark:text-purple-100">Earn Tokens</p>
                                  <p className="text-xs text-purple-800 dark:text-purple-200">On every purchase</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 text-center">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                  <Sparkle className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                                </div>
                                <div>
                                  <p className="font-semibold text-purple-900 dark:text-purple-100">Member Benefits</p>
                                  <p className="text-xs text-purple-800 dark:text-purple-200">Exclusive access & perks</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

        </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />

      </div>
  </>
      
  )
}
