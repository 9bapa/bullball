import { create } from 'zustand';
import { productService, Product, ProductVariant } from '@/services/product.service';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, variant: ProductVariant | null, walletAddress: string, quantity?: number) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Getters
  getItemCount: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
  getItemById: (id: string) => CartItem | undefined;

  // Helper function to set cart items
  setItems: (items: CartItem[]) => void;
}

// Clear any existing localStorage data that might cause quota issues
if (typeof window !== 'undefined') {
  localStorage.removeItem('bullrhun-cart');
}

export const useCartStore = create<CartStore>()(
  (set, get) => ({
      items: [],
      isOpen: false,

      addItem: async (product: Product, variant: ProductVariant | null, walletAddress: string, quantity: number = 1) => {
        // Generate unique cart item ID
        const cartItemId = variant ? `${product.id}-${variant.id}` : `${product.id}-no-variant`;
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === cartItemId);

        // Check stock only if variant exists or product tracks inventory
        if (variant) {
          const stockCheck = await productService.checkStock(variant.id, quantity);
          if (!stockCheck.available) {
            throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
          }
        } else {
          // Check stock for base product if no variant
          const stockCheck = await productService.checkStock(null, quantity);
          if (!stockCheck.available) {
            throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
          }
        }

        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + quantity;
          const stockCheck = await productService.checkStock(variant ? variant.id : null, newQuantity);
          if (!stockCheck.available) {
            throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
          }

          // Update local state immediately
          set(state => ({
            items: state.items.map(item =>
              item.id === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
            )
          }));

          // Update in database via API
          try {
            const normalizedWalletAddress = walletAddress.toLowerCase();
            console.log('Adding to cart with wallet address:', normalizedWalletAddress);
            const response = await fetch(`/api/cart?wallet=${normalizedWalletAddress}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: product.id,
                variant_id: variant?.id || null,
                quantity: newQuantity
              })
            });
            
            const data = await response.json();
            if (data.success) {
              console.log('Cart updated successfully in database');
            } else {
              console.error('Failed to update cart in database:', data.error);
            }
          } catch (error) {
            console.error('Error updating cart in database:', error);
          }
        } else {
          // Add new item
          set(state => ({
            items: [...state.items, {
              id: cartItemId,
              product_id: product.id,
              variant_id: variant?.id || 'no-variant',
              quantity,
              product,
              variant
            }]
          }));

          // Add to database via API
          try {
            const normalizedWalletAddress = walletAddress.toLowerCase();
            console.log('Adding new item to cart with wallet address:', normalizedWalletAddress);
            const response = await fetch(`/api/cart?wallet=${normalizedWalletAddress}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: product.id,
                variant_id: variant?.id || null,
                quantity
              })
            });
            
            const data = await response.json();
            if (data.success) {
              console.log('Cart item added successfully to database');
            } else {
              console.error('Failed to add cart item to database:', data.error);
            }
          } catch (error) {
            console.error('Error adding cart item to database:', error);
          }
        }
      },

      removeItem: (id: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },

      updateQuantity: async (id: string, newQuantity: number) => {
        if (newQuantity <= 0) {
          get().removeItem(id);
          return;
        }

        const item = get().getItemById(id);
        if (!item) return;

        // Check stock for the total desired quantity
        const stockCheck = await productService.checkStock(item.variant?.id || null, newQuantity);
        if (!stockCheck.available) {
          throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
        }

        // Update local state immediately for responsive UI
        set(state => ({
            items: state.items.map(cartItem =>
                cartItem.id === id
                    ? { ...cartItem, quantity: newQuantity }
                    : cartItem
            )
        }));

        // Update in database via PUT API
        try {
            const response = await fetch(`/api/cart/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart_item_id: id,
                    quantity: newQuantity
                })
            });
            
            const data = await response.json();
            if (!data.success) {
                console.error('Failed to update cart in database:', data.error);
                // Revert local state if API call fails
                set(state => ({
                    items: state.items.map(cartItem =>
                        cartItem.id === id
                            ? { ...cartItem, quantity: item.quantity }
                            : cartItem
                    )
                }));
            }
        } catch (error) {
            console.error('Error updating cart in database:', error);
            // Revert local state if API call fails
            set(state => ({
                items: state.items.map(cartItem =>
                    cartItem.id === id
                        ? { ...cartItem, quantity: item.quantity }
                        : cartItem
                )
            }));
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getItemCount: () => {
        return get().items.length;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const unitPrice = item.product.base_price + (item.variant?.price_adjustment || 0);
          return total + (unitPrice * item.quantity);
        },0);
      },

      getTotalWeight: () => {
        return get().items.reduce((total, item) => {
          const productWeight = item.product.weight_lbs || 0;
          const variantWeight = item.variant?.weight_adjustment || 0;
          return total + ((productWeight + variantWeight) * item.quantity);
        },0);
      },

      getItemById: (id: string) => {
        return get().items.find(item => item.id === id);
      },

      setItems: (items: CartItem[]) => {
        set({ items })
      }
    })
);