import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productService, ProductWithVariants, ProductVariant } from '@/services/product.service';

export interface CartItem {
  id: string; // product_id + variant_id
  product_id: string;
  variant_id: string;
  quantity: number;
  product: ProductWithVariants;
  variant: ProductVariant | null;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (product: ProductWithVariants, variant: ProductVariant | null, quantity?: number) => Promise<void>;
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
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: async (product: ProductWithVariants, variant: ProductVariant | null, quantity = 1) => {
        const cartItemId = variant ? `${product.id}-${variant.id}` : `${product.id}-no-variant`;
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === cartItemId);

        // Check stock only if variant exists
        if (variant) {
          const stockCheck = await productService.checkStock(variant.id, quantity);
          if (!stockCheck.available) {
            throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
          }
        } else {
          // Check stock for base product if no variant
          const stockCheck = await productService.checkStock(product.id, quantity);
          if (!stockCheck.available) {
            throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
          }
        }

        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + quantity;
          const stockCheck = await productService.checkStock(variant ? variant.id : product.id, newQuantity);
          if (!stockCheck.available) {
            throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
          }

          set(state => ({
            items: state.items.map(item =>
              item.id === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
            )
          }));
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
        }
      },

      removeItem: (id: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },

      updateQuantity: async (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const item = get().getItemById(id);
        if (!item) return;

        // Check stock
        const stockCheck = await productService.checkStock(item.variant?.id || item.product_id, quantity);
        if (!stockCheck.available) {
          throw new Error(`Insufficient stock. Only ${stockCheck.stock} items available.`);
        }

        set(state => ({
            items: state.items.map(cartItem =>
            cartItem.id === id
              ? { ...cartItem, quantity }
              : cartItem
          )
        }));
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
        }, 0);
      },

      getTotalWeight: () => {
        return get().items.reduce((total, item) => {
          const productWeight = item.product.weight_lbs || 0;
          const variantWeight = item.variant?.weight_adjustment || 0;
          return total + ((productWeight + variantWeight) * item.quantity);
        }, 0);
      },

      getItemById: (id: string) => {
        return get().items.find(item => item.id === id);
      }
    }),
    {
      name: 'bullrhun-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
);