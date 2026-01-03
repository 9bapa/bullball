import { supabase } from '@/lib/supabase';

const supabaseClient = (supabase)!;

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  type: 'sticker' | 'hoodie' | 'shirt' | 'hat' | 'accessory';
  base_price: number;
  cost_price?: number;
  image_url?: string;
  gallery_urls?: string[];
  weight_lbs?: number;
  sku?: string;
  barcode?: string;
  track_inventory: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  status: 'active' | 'draft' | 'archived';
  tags?: string[];
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name?: string;
  sku?: string;
  price?: number;
  price_adjustment?: number;
  compare_price?: number;
  cost_price?: number;
  cost_adjustment?: number;
  image_url?: string;
  inventory_quantity?: number;
  stock_quantity?: number;
  min_threshold?: number;
  status: 'active' | 'draft' | 'archived';
  position?: number;
  option1?: string;
  option2?: string;
  option3?: string;
  color?: string;
  size?: string;
  weight_adjustment?: number;
  reorder_level?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
  images?: { url: string; position: number }[];
  vendor_name?: string;
  commission_rate?: number;
  inventory_quantity?: number;
  min_threshold?: number;
  category?: string;
}

export class ProductService {
  static async getAllProducts(activeOnly: boolean = true): Promise<ProductWithVariants[]> {
    try {
      
      let query = supabaseClient
        .from('bullrhun_products')
        .select(`
          *,
          vendor:bullrhun_vendors(name, email, commission_rate),
          variants:bullrhun_product_variants(
            id,
            color,
            size,
            sku,
            price_adjustment,
            cost_adjustment,
            stock_quantity,
            reorder_level,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        throw error;
      }

      // Transform data to match expected format
      const transformedData = (data || []).map(product => ({
        ...product,
        // Transform variants
        variants: product.variants || [],
        // Transform gallery_urls to images array format
        images: (product.gallery_urls || []).map((url, index) => ({ 
          url, 
          position: index + 1 
        })),
        // Add vendor name and commission rate
        vendor_name: product.vendor?.name,
        commission_rate: product.vendor?.commission_rate,
        // Calculate total inventory from variants, or use main product inventory if no variants
        inventory_quantity: product.variants && product.variants.length > 0 
          ? product.variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0)
          : product.inventory_quantity || 0,
        // Use reorder level from first variant or default
        min_threshold: product.variants?.[0]?.reorder_level || 5,
        // Map type to category
        category: product.type || 'General'
      })) as ProductWithVariants[];

      return transformedData;
    } catch (error) {
      console.error('ProductService.getAllProducts error:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<ProductWithVariants | null> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_products')
        .select(`
          *,
          vendor:bullrhun_vendors(name, email),
          variants:bullrhun_product_variants(
            id,
            name,
            sku,
            price,
            compare_price,
            inventory_quantity,
            min_threshold,
            status
          ),
          images:bullrhun_product_images(url, position)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        vendor_name: data.vendor?.name,
        images: data.images || [],
        variants: data.variants || []
      } as ProductWithVariants;
    } catch (error) {
      console.error('ProductService.getProductById error:', error);
      throw error;
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return data as Product;
    } catch (error) {
      console.error('ProductService.createProduct error:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return data as Product;
    } catch (error) {
      console.error('ProductService.updateProduct error:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      // Delete related records first
      await Promise.all([
        supabaseClient.from('bullrhun_product_images').delete().eq('product_id', id),
        supabaseClient.from('bullrhun_product_variants').delete().eq('product_id', id),
        supabaseClient.from('bullrhun_inventory').delete().eq('product_id', id)
      ]);

      // Then delete the product
      const { error } = await supabaseClient
        .from('bullrhun_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    } catch (error) {
      console.error('ProductService.deleteProduct error:', error);
      throw error;
    }
  }

  static async getProductStats(): Promise<{
    total: number;
    active: number;
    draft: number;
    archived: number;
    lowStock: number;
  }> {
    try {
      const { data: products, error } = await supabaseClient
        .from('bullrhun_products')
        .select('status, variants:bullrhun_product_variants(inventory_quantity, min_threshold)');

      if (error) {
        console.error('Error fetching product stats:', error);
        throw error;
      }

      const stats = {
        total: products?.length || 0,
        active: products?.filter(p => p.status === 'active').length || 0,
        draft: products?.filter(p => p.status === 'draft').length || 0,
        archived: products?.filter(p => p.status === 'archived').length || 0,
        lowStock: 0
      };

      // Calculate low stock
      products?.forEach(product => {
        product.variants?.forEach(variant => {
          if (
            variant.inventory_quantity && 
            variant.min_threshold && 
            variant.inventory_quantity <= variant.min_threshold
          ) {
            stats.lowStock++;
          }
        });
      });

      return stats;
    } catch (error) {
      console.error('ProductService.getProductStats error:', error);
      throw error;
    }
  }

  static async getFeaturedProducts(limit: number): Promise<ProductWithVariants[]> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_products')
        .select(`
          *,
          category,
          vendor:bullrhun_vendors(name, email),
          variants:bullrhun_product_variants(
            id,
            name,
            sku,
            price,
            compare_price,
            inventory_quantity,
            min_threshold,
            status
          ),
          images:bullrhun_product_images(url, position)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return (data || []).map(product => ({
        ...product,
        vendor_name: product.vendor?.name,
        images: product.images || [],
        variants: product.variants || []
      })) as ProductWithVariants[];
    } catch (error) {
      console.error('ProductService.getFeaturedProducts error:', error);
      throw error;
    }
  }

  static async getProductsByType(type: string): Promise<ProductWithVariants[]> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_products')
        .select(`
          *,
          category,
          vendor:bullrhun_vendors(name, email),
          variants:bullrhun_product_variants(
            id,
            name,
            sku,
            price,
            compare_price,
            inventory_quantity,
            min_threshold,
            status
          ),
          images:bullrhun_product_images(url, position)
        `)
        .eq('category', type)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by type:', error);
        throw error;
      }

      return (data || []).map(product => ({
        ...product,
        vendor_name: product.vendor?.name,
        images: product.images || [],
        variants: product.variants || []
      })) as ProductWithVariants[];
    } catch (error) {
      console.error('ProductService.getProductsByType error:', error);
      throw error;
    }
  }

  static async getVariantById(variantId: string): Promise<ProductVariant | null> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_product_variants')
        .select('*')
        .eq('id', variantId)
        .single();

      if (error) {
        console.error('Error fetching variant:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ProductService.getVariantById error:', error);
      throw error;
    }
  }

  static async checkStock(variantId: string, quantity: number): Promise<{ available: boolean; stock: number }> {
    try {
      const { data, error } = await supabaseClient
        .from('bullrhun_product_variants')
        .select('inventory_quantity')
        .eq('id', variantId)
        .single();

      if (error) {
        console.error('Error checking stock:', error);
        throw error;
      }

      const stockQuantity = data?.inventory_quantity || 0;
      return {
        available: stockQuantity >= quantity,
        stock: stockQuantity
      };
    } catch (error) {
      console.error('ProductService.checkStock error:', error);
      throw error;
    }
  }
}

// Export both class and instance for compatibility
export const productService = ProductService;