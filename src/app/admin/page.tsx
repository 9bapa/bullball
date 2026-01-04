'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'
import { AdminProtectedRoute } from '@/components/wallet_solana/AdminGate'

// State interfaces
interface Vendor {
  id: string
  name: string
  email: string
  status: 'active' | 'pending'
  products?: number
}

interface Product {
  id: string
  name: string
  vendor_id: string
  vendor_name?: string
  price: number
  status: 'active' | 'draft'
  inventory: number
  description?: string
  image_url?: string
}

interface Order {
  id: string
  customer_wallet: string
  items: number
  total: number
  status: 'processing' | 'shipped' | 'delivered'
  tracking_number?: string
  created_at: string
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  

  // Fetch data from API
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [vendorsRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/vendors'),
        fetch('/api/admin/products'),
        fetch('/api/admin/orders')
      ])

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        setVendors(vendorsData.vendors || [])
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div 
          className="h-full w-full" 
          style={{ 
            backgroundImage: `linear-gradient(to right, rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.02) 1px, transparent 1px)`,
            backgroundSize: '50px 50px' 
          }} 
        />
      </div>

      <SharedHeader />
      
      <div className="relative mt-10">
        <div className="container mx-auto px-4 py-8 md:py-12 mt-10">
          {/* Header */}
          <div className="text-center mb-12 mt-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent leading-none mb-6">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
              Manage vendors, products, and orders with ease
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-400">Total Vendors</CardTitle>
                <Users className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{vendors.length}</div>
                <p className="text-xs text-emerald-300">Active vendors</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Products</CardTitle>
                <Package className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{products.length}</div>
                <p className="text-xs text-blue-300">In catalog</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{orders.length}</div>
                <p className="text-xs text-purple-300">Total orders</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </div>
                <p className="text-xs text-orange-300">Total sales</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-meme-purple/20 data-[state=active]:text-meme-purple">
                Overview
              </TabsTrigger>
              <TabsTrigger value="vendors" className="data-[state=active]:bg-meme-blue/20 data-[state=active]:text-meme-blue">
                Vendors
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-meme-green/20 data-[state=active]:text-meme-green">
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-meme-orange/20 data-[state=active]:text-meme-orange">
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Activity className="h-5 w-5 text-meme-purple" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{order.id}</p>
                          <p className="text-sm text-gray-400">{order.customer_wallet.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">${order.total}</p>
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link href="/admin/orders">
                      <Button variant="outline" className="w-full mt-2 text-meme-purple border-meme-purple/30 hover:bg-meme-purple/10">
                        View All Orders
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="h-5 w-5 text-meme-orange" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/admin/vendors/new">
                      <Button className="w-full h-12 justify-start text-meme-blue hover:bg-meme-blue/10 hover:text-meme-blue transition-all duration-200 group">
                        <Plus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Add Vendor</span>
                      </Button>
                    </Link>
                    <Link href="/admin/products/new">
                      <Button className="w-full h-12 justify-start text-meme-green hover:bg-meme-green/10 hover:text-meme-green transition-all duration-200 group">
                        <Plus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Add Product</span>
                      </Button>
                    </Link>
                    <Link href="/admin/orders">
                      <Button className="w-full h-12 justify-start text-meme-purple hover:bg-meme-purple/10 hover:text-meme-purple transition-all duration-200 group">
                        <Eye className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">View Orders</span>
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full h-12 justify-start text-meme-orange border-meme-orange/30 hover:bg-meme-orange/10 hover:text-meme-orange hover:border-meme-orange/50 transition-all duration-200 group">
                      <Download className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Export Reports</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Vendors Tab */}
            <TabsContent value="vendors" className="mt-6">
              <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Users className="h-5 w-5 text-meme-blue" />
                      Vendor Management
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search vendors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      <Link href="/admin/vendors/new">
                        <Button className="bg-meme-blue hover:bg-meme-blue/90">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Email</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.filter(vendor => 
                        vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(vendor => (
                        <TableRow key={vendor.id} className="border-white/10">
                          <TableCell className="text-white">{vendor.name}</TableCell>
                          <TableCell className="text-gray-400">{vendor.email}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(vendor.status)}`}>
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/admin/vendors/${vendor.id}/edit`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-meme-blue hover:bg-meme-blue/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6">
              <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Package className="h-5 w-5 text-meme-green" />
                      Product Management
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search products..."
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <Link href="/admin/products/new">
                        <Button className="bg-meme-green hover:bg-meme-green/90">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Product Name</TableHead>
                        <TableHead className="text-white">Vendor</TableHead>
                        <TableHead className="text-white">Price</TableHead>
                        <TableHead className="text-white">Inventory</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.filter(product => 
                        (statusFilter === 'all' || product.status === statusFilter) &&
                        product.name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(product => (
                        <TableRow key={product.id} className="border-white/10">
                          <TableCell className="text-white">{product.name}</TableCell>
                          <TableCell className="text-gray-400">
                            {vendors.find(v => v.id === product.vendor_id)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-white">${product.price}</TableCell>
                          <TableCell className="text-white">{product.inventory}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-meme-green hover:bg-meme-green/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShoppingCart className="h-5 w-5 text-meme-orange" />
                    Order Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Order ID</TableHead>
                        <TableHead className="text-white">Customer</TableHead>
                        <TableHead className="text-white">Items</TableHead>
                        <TableHead className="text-white">Total</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Tracking</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(order => (
                        <TableRow key={order.id} className="border-white/10">
                          <TableCell className="text-white">{order.id}</TableCell>
                          <TableCell className="text-gray-400">{order.customer_wallet.slice(0, 8)}...</TableCell>
                          <TableCell className="text-white">{order.items}</TableCell>
                          <TableCell className="text-white">${order.total}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-mono text-xs">
                            {order.tracking_number || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-meme-orange hover:bg-meme-orange/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>





      <SharedFooter />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  )
}