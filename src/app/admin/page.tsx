'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { orderService, Order } from '@/services/order.service'
import { vendorService } from '@/services/vendor.service'
import { productService } from '@/services/product.service'
import { chainService } from '@/services/chain.service'
import {
  Package,
  ShoppingBag,
  Building2,
  Plus,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  TrendingUp,
  Clock,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [chains, setChains] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [ordersData, productsData, vendorsData, chainsData] = await Promise.all([
        orderService.getAllOrders(),
        productService.getAllProducts(),
        vendorService.getAllVendors(),
        chainService.getAllChains()
      ])

      setOrders(ordersData || [])
      setProducts(productsData || [])
      setVendors(vendorsData || [])
      setChains(chainsData || [])

      const newStats = [
        { label: 'Total Products', value: productsData?.length?.toLocaleString() || '0', icon: Package, trend: '+12%', color: 'from-green-500 to-emerald-500' },
        { label: 'Total Orders', value: ordersData?.length?.toLocaleString() || '0', icon: ShoppingBag, trend: '+18%', color: 'from-blue-500 to-cyan-500' },
        { label: 'Total Vendors', value: vendorsData?.length?.toLocaleString() || '0', icon: Building2, trend: '+5%', color: 'from-purple-500 to-violet-500' },
        { label: 'Total Chains', value: chainsData?.length?.toLocaleString() || '0', icon: LinkIcon, trend: '+25%', color: 'from-orange-500 to-amber-500' },
        { label: 'Revenue', value: '$89.5K', icon: DollarSign, trend: '+32%', color: 'from-pink-500 to-rose-500' },
      ]
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-600 dark:text-green-400'
      case 'shipped':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
      case 'processing':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-600 dark:text-red-400'
      case 'refunded':
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        <section className="relative py-8 lg:py-12 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container relative px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-muted-foreground">
                Manage products, orders, vendors, users, and analytics
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-primary/10 bg-gradient-to-br {stat.color}/10 hover:shadow-lg transition-all hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs font-mono">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 h-auto">
                    <TabsTrigger value="dashboard" className="gap-2 py-3">
                      <BarChart3 className="h-4 w-4" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2 py-3">
                      <Package className="h-4 w-4" />
                      Products
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2 py-3">
                      <ShoppingBag className="h-4 w-4" />
                      Orders
                    </TabsTrigger>
                    <TabsTrigger value="vendors" className="gap-2 py-3">
                      <Building2 className="h-4 w-4" />
                      Vendors
                    </TabsTrigger>
                    <TabsTrigger value="chains" className="gap-2 py-3">
                      <LinkIcon className="h-4 w-4" />
                      Chains
                    </TabsTrigger>
                  </TabsList>

                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="mt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="md:col-span-2 lg:col-span-2">
                        <Card className="border-primary/10">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                              Quick Stats
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-muted/20">
                                <Package className="h-8 w-8 text-primary" />
                                <div>
                                  <p className="text-2xl font-bold">{products.length.toLocaleString()}</p>
                                  <p className="text-sm text-muted-foreground">Products</p>
                                </div>
                              </div>
                              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <p className="text-2xl font-bold">{orders.length.toLocaleString()}</p>
                                  <p className="text-sm text-muted-foreground">Orders</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                              <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                              <div>
                                <p className="text-2xl font-bold">{vendors.length.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Vendors</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="md:col-span-2 lg:col-span-2 space-y-6">
                        <Card className="border-primary/10">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                              Chains Overview
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                              <LinkIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                              <div>
                                <p className="text-2xl font-bold">{chains.length.toLocaleString()}</p>
                                <p className="text-sm text-purple-800 dark:text-purple-200">Total Chains</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                                {chains.filter((c: any) => c.is_active).length} Active
                              </span>
                            </div>
                            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800">
                              <DollarSign className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                              <div>
                                <p className="text-2xl font-bold">$89.5K</p>
                                <p className="text-sm text-muted-foreground">revenue today</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-primary/10">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                              Recent Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {[
                              { id: '1', title: 'New Product: Bitcoin Gold Card added', time: '2 min ago' },
                              { id: '2', title: 'Order #ORD-2024-089 completed', time: '15 min ago' },
                              { id: '3', title: 'Status change: Processing → Shipped', time: '1 hour ago' },
                            ].map((activity) => (
                              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{activity.title}</p>
                                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Products Tab */}
                  <TabsContent value="products" className="mt-6">
                    <div className="mb-6 flex justify-between items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10"
                        />
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                      <Link href="/admin/products/new">
                        <Button className="gap-2 bg-primary">
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Button>
                      </Link>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : products.length === 0 ? (
                      <Card className="border-primary/10">
                        <CardContent className="p-12 text-center">
                          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                          <p className="text-sm text-muted-foreground">
                            Add your first product to get started
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                          <Card key={product.id} className="border-primary/10 hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                                    {product.image_url ? (
                                      <img 
                                        src={product.image_url} 
                                        alt={product.name} 
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-6 w-6 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{product.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {product.vendor?.name || 'Unknown Vendor'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-lg font-bold text-primary">${product.base_price.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Stock: {product.inventory_quantity}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {product.is_featured && (
                                      <Badge variant="default" className="text-xs">
                                        Featured
                                      </Badge>
                                    )}
                                    {product.is_active ? (
                                      <Badge className="bg-green-500/20 text-green-600 text-xs">
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Vendors Tab */}
                  <TabsContent value="vendors" className="mt-6">
                    <div className="mb-6 flex justify-between items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search vendors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10"
                        />
                      </div>
                      <Link href="/admin/vendors/new">
                        <Button className="gap-2 bg-primary">
                          <Plus className="h-4 w-4" />
                          Add Vendor
                        </Button>
                      </Link>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : vendors.length === 0 ? (
                      <Card className="border-primary/10">
                        <CardContent className="p-12 text-center">
                          <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Vendors Found</h3>
                          <p className="text-sm text-muted-foreground">
                            Add your first vendor to get started
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {vendors.map((vendor) => (
                          <Card key={vendor.id} className="border-primary/10 hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                                    {vendor.logo_url ? (
                                      <img 
                                        src={vendor.logo_url} 
                                        alt={vendor.name} 
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Building2 className="h-6 w-6 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{vendor.name}</h4>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {vendor.business_name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    {vendor.is_featured && (
                                      <Badge variant="default" className="text-xs">
                                        Featured
                                      </Badge>
                                    )}
                                    {vendor.is_active ? (
                                      <Badge className="bg-green-500/20 text-green-600 text-xs">
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                  <Link href={`/admin/vendors/${vendor.id}/edit`}>
                                    <Button variant="ghost" size="sm">
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="mt-6">
                    <div className="mb-6 flex justify-between items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="border-primary/20 rounded-lg px-4 py-2"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <Card className="border-primary/10">
                        <CardContent className="p-12 text-center">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
                          <p className="text-sm text-muted-foreground">
                            {statusFilter !== 'all' ? `No orders with status "${statusFilter}"` : 'No orders yet'}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="border-primary/10 hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{order.order_number}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {order.user?.wallet_address ? `${order.user.wallet_address.slice(0, 4)}...${order.user.wallet_address.slice(-4)}` : 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusBadgeColor(order.status)}>
                                    {getStatusLabel(order.status)}
                                  </Badge>
                                  <p className="text-lg font-bold mt-1">${order.total_amount.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(order.created_at || '').toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Chains Tab */}
                  <TabsContent value="chains" className="mt-6">
                    <div className="mb-6 flex justify-between items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search chains..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10"
                        />
                      </div>
                      <Link href="/admin/chains/new">
                        <Button className="gap-2 bg-primary">
                          <Plus className="h-4 w-4" />
                          Add Chain
                        </Button>
                      </Link>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : chains.length === 0 ? (
                      <Card className="border-primary/10">
                        <CardContent className="p-12 text-center">
                          <LinkIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Chains Found</h3>
                          <p className="text-sm text-muted-foreground">
                            Add your first blockchain chain to get started
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {chains.map((chain) => (
                          <Card key={chain.id} className="border-primary/10 hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <LinkIcon className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{chain.name}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {chain.symbol}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  {chain.is_active ? (
                                    <Badge className="bg-green-500/20 text-green-600 text-xs">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
    </>
  )
}
