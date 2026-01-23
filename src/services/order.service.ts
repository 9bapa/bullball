import { supabase } from '@/lib/supabase'

const supabaseClient = supabase!

export interface Order {
  id: string
  user_id: string
  vendor_id: string
  order_number: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: string
  payment_id?: string
  total_amount: number
  subtotal_amount: number
  shipping_amount: number
  tax_amount?: number
  currency: string
  shipping_address?: OrderAddress
  billing_address?: OrderAddress
  notes?: string
  created_at?: string
  updated_at?: string
  user?: {
    id: string
    wallet_address?: string
    email?: string
  }
  vendor?: {
    id: string
    name: string
  }
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_variant_id?: string
  quantity: number
  unit_price: number
  total_price: number
  product?: {
    id: string
    name: string
    image_url?: string
    type?: string
  }
  variant?: {
    id: string
    name: string
  }
}

export interface OrderAddress {
  recipient_name?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone?: string
}

export interface CreateOrderRequest {
  user_id: string
  vendor_id: string
  order_items: Array<{
    product_id: string
    product_variant_id?: string
    quantity: number
  }>
  shipping_address?: OrderAddress
  billing_address?: OrderAddress
  payment_method?: string
  notes?: string
}

export interface UpdateOrderRequest {
  status?: Order['status']
  payment_status?: Order['payment_status']
  shipping_address?: OrderAddress
  notes?: string
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  cancelled_orders: number
  refunded_orders: number
  total_revenue: number
  average_order_value: number
}

const SHIPPING_RATES = {
  standard: { cost: 9.99, days: '5-7' },
  express: { cost: 19.99, days: '2-3' },
  overnight: { cost: 39.99, days: '1' }
}

const SOL_PRICE_USD = 200

class OrderService {
  async getAllOrders(status?: Order['status']): Promise<Order[]> {
    let query = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_users (
          id,
          wallet_address,
          email
        ),
        bullrhun_vendors (
          id,
          name
        ),
        bullrhun_order_items (
          *,
          bullrhun_products (
            id,
            name,
            image_url,
            type
          ),
          bullrhun_product_variants (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    return data?.map(order => ({
      ...order,
      user: order.bullrhun_users,
      vendor: order.bullrhun_vendors,
      order_items: order.bullrhun_order_items?.map(item => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      }))
    })) || []
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_users (
          id,
          wallet_address,
          email
        ),
        bullrhun_vendors (
          id,
          name
        ),
        bullrhun_order_items (
          *,
          bullrhun_products (
            id,
            name,
            image_url,
            type
          ),
          bullrhun_product_variants (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order by ID:', error)
      throw new Error(`Failed to fetch order: ${error.message}`)
    }

    if (!data) return null

    return {
      ...data,
      user: data.bullrhun_users,
      vendor: data.bullrhun_vendors,
      order_items: data.bullrhun_order_items?.map(item => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      }))
    }
  }

  async getOrdersByUser(userId: string, status?: Order['status']): Promise<Order[]> {
    let query = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_users (
          id,
          wallet_address,
          email
        ),
        bullrhun_vendors (
          id,
          name
        ),
        bullrhun_order_items (
          *,
          bullrhun_products (
            id,
            name,
            image_url,
            type
          ),
          bullrhun_product_variants (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching orders by user:', error)
      throw new Error(`Failed to fetch orders by user: ${error.message}`)
    }

    return data?.map(order => ({
      ...order,
      user: order.bullrhun_users,
      vendor: order.bullrhun_vendors,
      order_items: order.bullrhun_order_items?.map(item => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      }))
    })) || []
  }

  async getOrdersByVendor(vendorId: string, status?: Order['status']): Promise<Order[]> {
    let query = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_users (
          id,
          wallet_address,
          email
        ),
        bullrhun_vendors (
          id,
          name
        ),
        bullrhun_order_items (
          *,
          bullrhun_products (
            id,
            name,
            image_url,
            type
          ),
          bullrhun_product_variants (
            id,
            name
          )
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching orders by vendor:', error)
      throw new Error(`Failed to fetch orders by vendor: ${error.message}`)
    }

    return data?.map(order => ({
      ...order,
      user: order.bullrhun_users,
      vendor: order.bullrhun_vendors,
      order_items: order.bullrhun_order_items?.map(item => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      }))
    })) || []
  }

  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const { data: products, error: productsError } = await supabaseClient
      .from('bullrhun_products')
      .select('id, base_price, inventory_quantity, is_active')
      .in('id', order.order_items.map(item => item.product_id))

    if (productsError || !products) {
      throw new Error('Failed to fetch product details')
    }

    const productMap = new Map(products.map(p => [p.id, p]))

    const orderItems = order.order_items.map(item => {
      const product = productMap.get(item.product_id)
      if (!product || !product.is_active) {
        throw new Error(`Product ${item.product_id} is not available`)
      }
      if (product.inventory_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`)
      }

      return {
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        unit_price: product.base_price,
        total_price: product.base_price * item.quantity
      }
    })

    const subtotalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0)
    const shippingAmount = SHIPPING_RATES.standard.cost

    const { data: orderData, error: orderError } = await supabaseClient
      .from('bullrhun_orders')
      .insert([{
        user_id: order.user_id,
        vendor_id: order.vendor_id,
        order_number: this.generateOrderNumber(),
        status: 'pending',
        payment_status: 'pending',
        total_amount: subtotalAmount + shippingAmount,
        subtotal_amount: subtotalAmount,
        shipping_amount: shippingAmount,
        currency: 'USD',
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        payment_method: order.payment_method,
        notes: order.notes
      }])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderData.id
    }))

    const { error: itemsError } = await supabaseClient
      .from('bullrhun_order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      await supabaseClient.from('bullrhun_orders').delete().eq('id', orderData.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    const { error: stockError } = await Promise.all(
      order.order_items.map(item =>
        supabaseClient.rpc('decrement_product_stock', {
          product_id: item.product_id,
          quantity: item.quantity
        })
      )
    )

    if (stockError) {
      console.error('Error updating stock:', stockError)
    }

    return this.getOrderById(orderData.id) as Promise<Order>
  }

  async updateOrder(id: string, order: UpdateOrderRequest): Promise<Order> {
    const { data, error } = await supabaseClient
      .from('bullrhun_orders')
      .update(order)
      .eq('id', id)
      .select(`
        *,
        bullrhun_users (
          id,
          wallet_address,
          email
        ),
        bullrhun_vendors (
          id,
          name
        ),
        bullrhun_order_items (
          *,
          bullrhun_products (
            id,
            name,
            image_url,
            type
          ),
          bullrhun_product_variants (
            id,
            name
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error updating order:', error)
      throw new Error(`Failed to update order: ${error.message}`)
    }

    return {
      ...data,
      user: data.bullrhun_users,
      vendor: data.bullrhun_vendors,
      order_items: data.bullrhun_order_items?.map(item => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      }))
    }
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return this.updateOrder(id, { status })
  }

  async updatePaymentStatus(id: string, paymentStatus: Order['payment_status'], paymentId?: string): Promise<Order> {
    return this.updateOrder(id, {
      payment_status: paymentStatus,
      payment_id: paymentId
    })
  }

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('bullrhun_orders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting order:', error)
      throw new Error(`Failed to delete order: ${error.message}`)
    }
  }

  async getOrderStats(): Promise<OrderStats> {
    try {
      const { count: totalOrders, error: totalError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })

      const { count: pendingOrders, error: pendingError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')

      const { count: processingOrders, error: processingError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'processing')

      const { count: shippedOrders, error: shippedError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'shipped')

      const { count: deliveredOrders, error: deliveredError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'delivered')

      const { count: cancelledOrders, error: cancelledError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'cancelled')

      const { count: refundedOrders, error: refundedError } = await supabaseClient
        .from('bullrhun_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'refunded')

      const { data: orders, error: revenueError } = await supabaseClient
        .from('bullrhun_orders')
        .select('total_amount')
        .eq('payment_status', 'completed')

      if (totalError || pendingError || processingError || shippedError || deliveredError || cancelledError || refundedError || revenueError) {
        console.error('Error fetching order stats:', {
          totalError, pendingError, processingError, shippedError, deliveredError, cancelledError, refundedError, revenueError
        })
        throw new Error('Failed to fetch order statistics')
      }

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0

      return {
        total_orders: totalOrders || 0,
        pending_orders: pendingOrders || 0,
        processing_orders: processingOrders || 0,
        shipped_orders: shippedOrders || 0,
        delivered_orders: deliveredOrders || 0,
        cancelled_orders: cancelledOrders || 0,
        refunded_orders: refundedOrders || 0,
        total_revenue: totalRevenue,
        average_order_value: avgOrderValue
      }
    } catch (error) {
      console.error('OrderService.getOrderStats error:', error)
      throw error
    }
  }

  async searchOrders(query: string, status?: Order['status']): Promise<Order[]> {
    const searchQuery = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_users (
          id,
          wallet_address,
          email
        ),
        bullrhun_vendors (
          id,
          name
        ),
        bullrhun_order_items (
          *,
          bullrhun_products (
            id,
            name,
            image_url,
            type
          ),
          bullrhun_product_variants (
            id,
            name
          )
        )
      `)
      .or(`order_number.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (status) {
      searchQuery.eq('status', status)
    }

    const { data, error } = await searchQuery

    if (error) {
      console.error('Error searching orders:', error)
      throw new Error(`Failed to search orders: ${error.message}`)
    }

    return data?.map(order => ({
      ...order,
      user: order.bullrhun_users,
      vendor: order.bullrhun_vendors,
      order_items: order.bullrhun_order_items?.map(item => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      }))
    })) || []
  }

  async getShippingRates(): Promise<typeof SHIPPING_RATES> {
    return SHIPPING_RATES
  }

  async convertSolToUsd(solAmount: number): Promise<number> {
    return solAmount * SOL_PRICE_USD
  }

  async convertUsdToSol(usdAmount: number): Promise<number> {
    return usdAmount / SOL_PRICE_USD
  }

  async getUserOrderCount(userId: string): Promise<number> {
    const { count, error } = await supabaseClient
      .from('bullrhun_orders')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user order count:', error)
      throw new Error(`Failed to fetch user order count: ${error.message}`)
    }

    return count || 0
  }

  async getVendorOrderCount(vendorId: string): Promise<number> {
    const { count, error } = await supabaseClient
      .from('bullrhun_orders')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)

    if (error) {
      console.error('Error fetching vendor order count:', error)
      throw new Error(`Failed to fetch vendor order count: ${error.message}`)
    }

    return count || 0
  }

  private generateOrderNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ORD-${year}-${month}-${random}`
  }

  async getOrders(status?: Order['status']): Promise<Order[]> {
    return this.getAllOrders(status)
  }
}

export { OrderService }
export const orderService = new OrderService()
