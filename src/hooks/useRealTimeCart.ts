import { useEffect } from 'react'
import { useUserContext } from '@/context/userContext'
import { useCartStore } from '@/store/cart'
import { createClient } from '@supabase/supabase-js'

export function useRealTimeCart() {
  const { publicKey } = useUserContext()
  const { setItems, clearCart } = useCartStore()

  useEffect(() => {
    if (!publicKey) {
      clearCart()
      return
    }

    // Initialize Supabase client for client-side use
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase client not initialized. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Initial fetch from database
    const fetchCart = async () => {
      try {
        const response = await fetch(`/api/cart?wallet=${publicKey?.toLowerCase()}`)
        const data = await response.json()
        
        if (data.cartItems) {
          const storeItems = data.cartItems.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            quantity: item.quantity,
            product: {
              id: item.product_id,
              name: item.name,
              description: item.description,
              base_price: item.price,
              cost_price: item.cost_price || 0,
              image_url: item.image_url,
              inventory_quantity: item.stock_quantity,
              is_active: item.is_active,
              vendor_id: item.vendor_id || null,
              track_inventory: false,
              is_digital: false,
              requires_shipping: true,
              status: 'active' as const,
              variants: []
            },
            variant: null
          }))
          
          // Update cart store
          setItems(storeItems)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    }

    // Set up Supabase real-time subscription
    const channel = supabaseClient
      .channel('cart_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bullrhun_cart' },
        (payload) => {
          console.log('Real-time cart change detected:', payload)
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refetch cart when items change for any user
            fetchCart()
          } else if (payload.eventType === 'DELETE') {
            // Refetch cart when items are deleted for any user
            fetchCart()
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time cart changes')
          fetchCart() // Initial fetch when subscription is ready
        }
      })

    // Initial fetch
    fetchCart()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [publicKey, setItems])

  // This hook doesn't return anything, it just manages cart state
}