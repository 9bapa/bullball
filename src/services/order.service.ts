import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { productService, ProductWithVariants, ProductVariant } from './product.service';
import { supabase } from '@/lib/supabase';

const supabaseClient = (supabase)!;

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  billing_address: string;
  billing_city: string;
  billing_state?: string;
  billing_zip: string;
  billing_country: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  shipping_method: 'standard' | 'rush' | 'express';
  shipping_carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_method: string;
  solana_payment_address?: string;
  solana_payment_signature?: string;
  payment_amount_sol?: number;
  payment_confirmed_at?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost?: number;
  total_cost?: number;
  status: string;
  vendor_order_id?: string;
  created_at: string;
  product?: ProductWithVariants;
  variant?: ProductVariant;
}

export interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  product: ProductWithVariants;
  variant: ProductVariant | null;
}

export interface CreateOrderRequest {
  customer_wallet_address: string; // Links to bullrhun_orders table
  customer_name: string;
  customer_phone?: string;
  billing_address: string;
  billing_city: string;
  billing_state?: string;
  billing_zip: string;
  billing_country: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  shipping_method: 'standard' | 'rush' | 'express';
  items: CartItem[];
  notes?: string;
}

export interface ShippingRate {
  id: string;
  method: 'standard' | 'rush' | 'express';
  carrier: string;
  base_cost: number;
  cost_per_lb: number;
  free_shipping_threshold?: number;
  description: string;
  estimated_days: string;
  max_weight_lbs: number;
}

class OrderService {
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Calculate totals
    let subtotal = 0;
    let totalWeight = 0;
    
    const orderItems = await Promise.all(
        request.items.map(async (item) => {
          const unitPrice = item.product.base_price + (item.variant?.price || 0);
          const totalPrice = unitPrice * item.quantity;
          subtotal += totalPrice;
          
          // Calculate weight
          const productWeight = item.product.weight_lbs || 0;
          const variantWeight = 0; // No weight adjustment available
          totalWeight += (productWeight + variantWeight) * item.quantity;
          
          return {
            product_id: item.product.id,
            variant_id: item.variant?.id,
            vendor_id: item.product.vendor_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            unit_cost: item.product.cost_price || 0,
            total_cost: (item.product.cost_price || 0) * item.quantity
          };
        })
      );

    // Get shipping rate
    const shippingRate = await this.getShippingRate(request.shipping_method);
    if (!shippingRate) {
      throw new Error(`Invalid shipping method: ${request.shipping_method}`);
    }

    let shippingCost = shippingRate.base_cost;
    if (totalWeight > 0) {
      shippingCost += totalWeight * shippingRate.cost_per_lb;
    }

    // Check for free shipping
    if (shippingRate.free_shipping_threshold && subtotal >= shippingRate.free_shipping_threshold) {
      shippingCost = 0;
    }

    // Calculate tax (simplified - you may want to implement region-based tax)
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Generate order number
    const { data: orderNumber } = await supabaseClient
      .rpc('generate_order_number');

    if (!orderNumber) {
      throw new Error('Failed to generate order number');
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('bullrhun_orders')
      .insert({
        customer_wallet_address: request.customer_wallet_address, // Link order to user wallet
        order_number: orderNumber,
        customer_name: request.customer_name,
        customer_phone: request.customer_phone,
        billing_address: request.billing_address,
        billing_city: request.billing_city,
        billing_state: request.billing_state,
        billing_zip: request.billing_zip,
        billing_country: request.billing_country,
        shipping_address: request.shipping_address || request.billing_address,
        shipping_city: request.shipping_city || request.billing_city,
        shipping_state: request.shipping_state || request.billing_state,
        shipping_zip: request.shipping_zip || request.billing_zip,
        shipping_country: request.shipping_country || request.billing_country,
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        shipping_method: request.shipping_method,
        status: 'pending',
        payment_method: 'crypto',
        notes: request.notes
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const { error: itemsError } = await supabaseClient
      .from('bullrhun_order_items')
      .insert(
        orderItems.map(item => ({
          ...item,
          order_id: order.id
        }))
      );

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Generate Solana payment address
    const paymentAddress = await this.generateSolanaPaymentAddress();
    
    // Update order with payment address
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('bullrhun_orders')
      .update({
        solana_payment_address: paymentAddress
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order with payment address:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    return this.getOrderById(updatedOrder.id);
  }

  async getOrderById(id: string): Promise<Order> {
    const query = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_order_items (
          *,
          bullrhun_products (
            *,
            bullrhun_vendors (
              name,
              business_name
            )
          ),
          bullrhun_product_variants (*)
        )
      `)
      .eq('id', id)
      .single();

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - order might not exist yet
        console.log(`Order not found or not yet created: ${id}`);
        throw new Error('Order not found or still being processed');
      }
      console.error('Error fetching order:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    if (!data) {
      throw new Error('Order not found');
    }

    return {
      ...data,
      items: data.bullrhun_order_items?.map((item: any) => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      })) || []
    };
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const query = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_order_items (
          *,
          bullrhun_products (
            *,
            bullrhun_vendors (
              name,
              business_name
            )
          ),
          bullrhun_product_variants (*)
        )
      `)
      .eq('order_number', orderNumber)
      .single();

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching order by number:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      items: data.bullrhun_order_items?.map((item: any) => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      })) || []
    };
  }

  async getCustomerOrders(customerEmail: string): Promise<Order[]> {
    const query = supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_order_items (
          *,
          bullrhun_products (
            *,
            bullrhun_vendors (
              name,
              business_name
            )
          ),
          bullrhun_product_variants (*)
        )
      `)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customer orders:', error);
      throw new Error(`Failed to fetch customer orders: ${error.message}`);
    }

    return data?.map(order => ({
      ...order,
      items: order.bullrhun_order_items?.map((item: any) => ({
        ...item,
        product: item.bullrhun_products,
        variant: item.bullrhun_product_variants
      })) || []
    })) || [];
  }

  async updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string, trackingUrl?: string): Promise<Order> {
    const updateData: any = { status };
    
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }
    
    if (trackingUrl) {
      updateData.tracking_url = trackingUrl;
    }

    // Set estimated delivery for shipped orders
    if (status === 'shipped') {
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // Estimate 5 days for delivery
      updateData.estimated_delivery = estimatedDelivery.toISOString();
    }

    const { data, error } = await supabaseClient
      .from('bullrhun_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return this.getOrderById(data.id);
  }

  async confirmPayment(orderId: string, signature: string, amountSol: number): Promise<Order> {
    const { data, error } = await supabaseClient
      .from('bullrhun_orders')
      .update({
        status: 'paid',
        solana_payment_signature: signature,
        payment_amount_sol: amountSol,
        payment_confirmed_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error confirming payment:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }

    return this.getOrderById(data.id);
  }

  async getShippingRate(method: 'standard' | 'rush' | 'express'): Promise<ShippingRate | null> {
    const { data, error } = await supabaseClient
      .from('bullrhun_shipping_rates')
      .select('*')
      .eq('method', method)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - return default fallback shipping rate
        console.log(`No shipping rate found for method: ${method}, using fallback`);
        return this.getDefaultShippingRate(method);
      }
      console.error('Error fetching shipping rate:', error);
      return this.getDefaultShippingRate(method);
    }

    return data;
  }

  // Fallback shipping rates when database is empty
  private getDefaultShippingRate(method: 'standard' | 'rush' | 'express'): ShippingRate {
    const rates = {
      standard: {
        id: 'fallback-standard',
        method: 'standard' as const,
        carrier: 'Standard Shipping',
        base_cost: 5.99,
        cost_per_lb: 0.50,
        free_shipping_threshold: 50,
        description: 'Standard delivery within 5-7 business days',
        estimated_days: '5-7 days',
        max_weight_lbs: 50
      },
      rush: {
        id: 'fallback-rush',
        method: 'rush' as const,
        carrier: 'Rush Shipping',
        base_cost: 12.99,
        cost_per_lb: 1.00,
        free_shipping_threshold: 75,
        description: 'Rush delivery within 2-3 business days',
        estimated_days: '2-3 days',
        max_weight_lbs: 50
      },
      express: {
        id: 'fallback-express',
        method: 'express' as const,
        carrier: 'Express Shipping',
        base_cost: 24.99,
        cost_per_lb: 2.00,
        free_shipping_threshold: 100,
        description: 'Express delivery within 1-2 business days',
        estimated_days: '1-2 days',
        max_weight_lbs: 50
      }
    };

    return rates[method];
  }

  async getAllShippingRates(): Promise<ShippingRate[]> {
    const { data, error } = await supabaseClient
      .from('bullrhun_shipping_rates')
      .select('*')
      .eq('is_active', true)
      .order('base_cost', { ascending: true });

    if (error) {
      console.error('Error fetching shipping rates:', error);
      throw new Error(`Failed to fetch shipping rates: ${error.message}`);
    }

    return data || [];
  }

  private async generateSolanaPaymentAddress(): Promise<string> {
    // Generate a unique keypair for this order
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    
    // In a real implementation, you would:
    // 1. Store this keypair securely
    // 2. Set up a monitoring service to watch for payments
    // 3. Transfer funds to your main wallet when payment is received
    
    // For now, we'll return the public key as the payment address
    return publicKey;
  }

  async calculateShippingCost(method: 'standard' | 'rush' | 'express', weight: number, subtotal: number): Promise<number> {
    const shippingRate = await this.getShippingRate(method);
    if (!shippingRate) {
      throw new Error(`Invalid shipping method: ${method}`);
    }

    let cost = shippingRate.base_cost;
    
    if (weight > 0) {
      cost += weight * shippingRate.cost_per_lb;
    }

    // Check for free shipping
    if (shippingRate.free_shipping_threshold && subtotal >= shippingRate.free_shipping_threshold) {
      cost = 0;
    }

    return cost;
  }

  async convertUSDToSOL(usdAmount: number): Promise<number> {
    try {
      // Get current SOL price from CoinGecko
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      
      if (!data.solana?.usd) {
        throw new Error('Could not fetch SOL price');
      }
      
      const solPrice = data.solana.usd;
      return usdAmount / solPrice;
    } catch (error) {
      console.error('Error converting USD to SOL:', error);
      // Fallback rate if API fails
      const fallbackRate = 150; // $150 per SOL
      return usdAmount / fallbackRate;
    }
  }
}

export const orderService = new OrderService();