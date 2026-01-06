import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { Keypair } from '@solana/web3.js';
import { encryptionService } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required fields
    if (!orderData.customer_wallet_address || !orderData.customer_name || !orderData.billing_address || !orderData.billing_city || !orderData.billing_zip || !orderData.billing_country || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Calculate totals if not provided
    let subtotal = orderData.subtotal || 0;
    if (!subtotal && orderData.items) {
      subtotal = orderData.items.reduce((sum: number, item: any) => {
        // Handle cart item structure with product.base_price
        const itemPrice = item.product?.base_price || item.price || 0;
        return sum + (itemPrice * item.quantity);
      }, 0);
    }

    // Generate unique order number and Solana keypair for payment
    const orderNumber = `BRH-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Generate a new Solana keypair for this order's payment
    const paymentKeypair = Keypair.generate();
    const solanaAddress = paymentKeypair.publicKey.toBase58();
    const privateKeyArray = Array.from(paymentKeypair.secretKey);
    
    // Encrypt the private key before storing
    const encryptedPrivateKey = encryptionService.encryptPrivateKey(privateKeyArray);

    // Insert order using service role to bypass RLS
    const { data, error } = await supabaseService
      .from('bullrhun_orders')
      .insert({
        customer_wallet_address: orderData.customer_wallet_address, // Link order to user wallet
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone || null,
        billing_address: orderData.billing_address,
        billing_city: orderData.billing_city,
        billing_state: orderData.billing_state || null,
        billing_zip: orderData.billing_zip || null,
        billing_country: orderData.billing_country,
        shipping_address: orderData.shipping_address || orderData.billing_address,
        shipping_city: orderData.shipping_city || orderData.billing_city,
        shipping_state: orderData.shipping_state || orderData.billing_state || null,
        shipping_zip: orderData.shipping_zip || orderData.billing_zip || null,
        shipping_country: orderData.shipping_country || orderData.billing_country,
        subtotal: subtotal,
        tax_amount: orderData.tax_amount || 0,
        shipping_cost: orderData.shipping_cost || 0,
        total_amount: orderData.total_amount || subtotal,
        shipping_method: orderData.shipping_method || 'standard',
        status: 'pending',
        payment_method: orderData.payment_method || 'crypto',
        solana_payment_address: solanaAddress, // Use generated real Solana address
        solana_private_key: encryptedPrivateKey, // Store encrypted private key for payment processing
        solana_payment_signature: orderData.solana_payment_signature || null,
        payment_amount_sol: orderData.payment_amount_sol || null,
        payment_confirmed_at: orderData.payment_confirmed_at || null,
        notes: orderData.notes || null,
        internal_notes: orderData.internal_notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      );
    }

    // Create order items for each cart item
    if (data && orderData.items) {
      console.log('Creating order items for order:', data.id, 'Items:', orderData.items);
      
      for (const item of orderData.items) {
        console.log('Processing item:', item);
        
        // Handle variant_id properly - convert 'no-variant' to null
        const variantId = item.variant_id === 'no-variant' ? null : item.variant_id;
        
        // Validate required fields before insertion
        if (!item.product_id) {
          console.error('Missing product_id for item:', item);
          return NextResponse.json(
            { error: 'Product ID is required for all order items', details: 'Invalid item data' },
            { status: 400 }
          );
        }
        
        if (!item.product) {
          console.error('Missing product data for item:', item);
          return NextResponse.json(
            { error: 'Product data is required for all order items', details: 'Invalid item data' },
            { status: 400 }
          );
        }
        
        // Validate product exists in database
        const { data: productExists, error: productCheckError } = await supabaseService
          .from('bullrhun_products')
          .select('id')
          .eq('id', item.product_id)
          .single();
          
        if (productCheckError || !productExists) {
          console.error('Product not found in database:', item.product_id);
          return NextResponse.json(
            { error: 'Product not found', details: `Product ID ${item.product_id} does not exist` },
            { status: 400 }
          );
        }
        
        // If variant_id is provided, validate it exists
        if (variantId) {
          const { data: variantExists, error: variantCheckError } = await supabaseService
            .from('bullrhun_product_variants')
            .select('id')
            .eq('id', variantId)
            .single();
            
          if (variantCheckError || !variantExists) {
            console.error('Variant not found in database:', variantId);
            return NextResponse.json(
              { error: 'Product variant not found', details: `Variant ID ${variantId} does not exist` },
              { status: 400 }
            );
          }
        }
        
        const itemTotal = (item.product?.base_price || 0) * item.quantity;
        
        const insertData = {
          order_id: data.id,
          product_id: item.product_id,
          variant_id: variantId,
          vendor_id: item.product?.vendor_id || null,
          quantity: item.quantity,
          unit_price: item.product?.base_price || 0,
          total_price: itemTotal,
          unit_cost: item.product?.cost || 0,
          total_cost: (item.product?.cost || 0) * item.quantity,
          status: 'pending',
          vendor_order_id: null,
          created_at: new Date().toISOString()
        };
        
        console.log('Inserting order item with data:', insertData);
        
        const { error: itemError } = await supabaseService
          .from('bullrhun_order_items')
          .insert(insertData);

        if (itemError) {
          console.error('Error creating order item:', itemError);
          console.error('Insert data that failed:', insertData);
          return NextResponse.json(
            { error: 'Failed to create order items', details: itemError.message },
            { status: 500 }
          );
        }
      }
    } else {
      console.log('No order items to create or order data missing');
    }

    return NextResponse.json(
      { 
        message: 'Order created successfully',
        order: data
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}