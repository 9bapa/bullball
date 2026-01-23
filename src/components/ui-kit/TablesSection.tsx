'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  TrendingDown,
  Download,
  Eye,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  icon?: any
  count?: number
  badge?: string
}

interface Order {
  id: string
  product: string
  type: string
  price: number
  status: 'completed' | 'processing' | 'pending' | 'cancelled'
  date: string
  volume: string
  change: number
}

export default function TablesSection() {
  const [activeTab, setActiveTab] = useState('orders')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const tabs: TabItem[] = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '12' },
    { id: 'products', label: 'Products', icon: Package, count: 48 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ]

  const orders: Order[] = [
    { id: '1', product: 'BullRun Legendary Card', type: 'BULLRUN', price: 249.99, status: 'completed', date: '2024-01-20', volume: '2,450', change: 15.3 },
    { id: '2', product: 'Bitcoin Genesis Set', type: 'BTC', price: 89.99, status: 'processing', date: '2024-01-19', volume: '5,230', change: -2.4 },
    { id: '3', product: 'Ethereum Rare Edition', type: 'ETH', price: 129.99, status: 'completed', date: '2024-01-18', volume: '3,100', change: 8.7 },
    { id: '4', product: 'BNB Limited Drop', type: 'BNB', price: 179.99, status: 'pending', date: '2024-01-17', volume: '1,890', change: 12.1 },
    { id: '5', product: 'SUI Exclusive Card', type: 'SUI', price: 199.99, status: 'cancelled', date: '2024-01-16', volume: '980', change: -5.2 },
  ]

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'bg-emerald-500',
          text: 'text-emerald-600',
          bg: 'bg-emerald-500/10',
          label: 'Completed'
        }
      case 'processing':
        return {
          icon: Clock,
          color: 'bg-blue-500',
          text: 'text-blue-600',
          bg: 'bg-blue-500/10',
          label: 'Processing'
        }
      case 'pending':
        return {
          icon: AlertTriangle,
          color: 'bg-amber-500',
          text: 'text-amber-600',
          bg: 'bg-amber-500/10',
          label: 'Pending'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'bg-red-500',
          text: 'text-red-600',
          bg: 'bg-red-500/10',
          label: 'Cancelled'
        }
    }
  }

  const handleSort = (column: string) => {
    setSortColumn(sortColumn === column ? null : column)
  }

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedRows(selectedRows.length === orders.length ? [] : orders.map(o => o.id))
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BULLRUN: 'border-emerald-500',
      BTC: 'border-amber-500',
      ETH: 'border-indigo-500',
      BNB: 'border-yellow-500',
      SUI: 'border-pink-500',
    }
    return colors[type] || 'border-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-2 border-border/30 rounded-2xl p-1.5 bg-gradient-to-br from-background to-primary/5 backdrop-blur-md">
        <div className="flex gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center gap-2 px-4 py-3 rounded-xl',
                  'transition-all duration-300 relative overflow-hidden',
                  'group hover:scale-[1.02]',
                  isActive
                    ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 shadow-lg'
                    : 'hover:bg-white/50'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                )}
                {Icon && (
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary')} />
                )}
                <span className={cn('font-medium text-sm whitespace-nowrap', isActive ? 'text-white' : '')}>
                  {tab.label}
                </span>
                {tab.badge && (
                  <Badge
                    className={cn(
                      'ml-auto',
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-primary/10 text-primary border-primary/30'
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}
                {tab.count && (
                  <span className={cn(
                    'ml-auto text-xs font-mono',
                    isActive ? 'text-white/80' : 'text-muted-foreground'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-2 shadow-2xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="font-display font-bold text-2xl flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                Orders Table
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage and track all your trading card orders
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shadow-md hover:scale-105 transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Table Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 h-10 border-2 focus:border-primary/50 shadow-md transition-all duration-300"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shadow-md hover:scale-105 transition-all duration-300"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 border border-border/40">
                <Checkbox
                  checked={selectedRows.length === orders.length && orders.length > 0}
                  onCheckedChange={toggleAll}
                  className="h-4 w-4"
                />
                <Label className="text-sm font-medium cursor-pointer">
                  Select All ({orders.length})
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/20 border-b-2 border-border/30">
                <TableHead className="h-14">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedRows.length === orders.length && orders.length > 0}
                      onCheckedChange={toggleAll}
                      className="h-4 w-4"
                    />
                  </div>
                </TableHead>
                <TableHead className="h-14 cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => handleSort('product')}>
                  <div className="flex items-center gap-2">
                    Product
                    <ArrowUpDown className={cn(
                      'h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity',
                      sortColumn === 'product' ? 'opacity-100 text-primary' : ''
                    )} />
                  </div>
                </TableHead>
                <TableHead className="h-14 cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-2">
                    Type
                    <ArrowUpDown className={cn(
                      'h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity',
                      sortColumn === 'type' ? 'opacity-100 text-primary' : ''
                    )} />
                  </div>
                </TableHead>
                <TableHead className="h-14 cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">
                    Price
                    <ArrowUpDown className={cn(
                      'h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity',
                      sortColumn === 'price' ? 'opacity-100 text-primary' : ''
                    )} />
                  </div>
                </TableHead>
                <TableHead className="h-14">Status</TableHead>
                <TableHead className="h-14 cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-2">
                    Date
                    <ArrowUpDown className={cn(
                      'h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity',
                      sortColumn === 'date' ? 'opacity-100 text-primary' : ''
                    )} />
                  </div>
                </TableHead>
                <TableHead className="h-14 cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => handleSort('volume')}>
                  <div className="flex items-center gap-2">
                    Volume
                    <ArrowUpDown className={cn(
                      'h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity',
                      sortColumn === 'volume' ? 'opacity-100 text-primary' : ''
                    )} />
                  </div>
                </TableHead>
                <TableHead className="h-14 cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => handleSort('change')}>
                  <div className="flex items-center gap-2">
                    24h
                    <ArrowUpDown className={cn(
                      'h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity',
                      sortColumn === 'change' ? 'opacity-100 text-primary' : ''
                    )} />
                  </div>
                </TableHead>
                <TableHead className="h-14 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                const isSelected = selectedRows.includes(order.id)

                return (
                  <TableRow
                    key={order.id}
                    className={cn(
                      'group hover:bg-primary/5 transition-all duration-300 border-b border-border/20',
                      'hover:shadow-md hover:-translate-y-0.5',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <TableCell className="py-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(order.id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {order.product}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={cn(
                          'text-xs font-semibold shadow-md',
                          getTypeColor(order.type)
                        )}
                      >
                        {order.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="font-mono font-semibold text-foreground">
                        ${order.price.toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
                        'shadow-md transition-all duration-300',
                        statusConfig.bg
                      )}>
                        <StatusIcon className={cn('h-4 w-4', statusConfig.text)} />
                        <span className={cn('text-xs font-semibold', statusConfig.text)}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm text-muted-foreground font-mono">
                        {order.date}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {order.volume}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className={cn(
                        'inline-flex items-center gap-1',
                        order.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {order.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-mono text-sm font-semibold">
                          {Math.abs(order.change).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-10 hover:text-red-600 hover:scale-110 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-border/30 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {orders.length} of {orders.length} orders
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="shadow-md hover:scale-105 transition-all duration-300">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="shadow-md hover:scale-105 transition-all duration-300">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
