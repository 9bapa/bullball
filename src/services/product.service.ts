import { supabase } from '@/lib/supabase'

const supabaseClient = supabase!

export interface Product {
  id: string
  vendor_id: string
  name: string
  description?: string
  base_price: number
  cost_price?: number
  inventory_quantity: number
  image_url?: string
  is_active: boolean
  is_featured: boolean
  type?: string
  category?: string
  tags?: string[]
  variants?: ProductVariant[]
  rating?: number
  total_sales?: number
  views?: number
  weight_lbs?: number
  created_at?: string
  updated_at?: string
  vendor?: {
    id: string
    name: string
    logo_url?: string
  }
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price: number
  cost_price?: number
  stock_quantity: number
  is_active: boolean
  image_url?: string
  color?: string
  size?: string
  price_adjustment?: number
  weight_adjustment?: number
  created_at?: string
  updated_at?: string
}

export interface CreateProductRequest {
  vendor_id: string
  name: string
  description?: string
  base_price: number
  cost_price?: number
  inventory_quantity: number
  image_url?: string
  is_active?: boolean
  is_featured?: boolean
  type?: string
  category?: string
  tags?: string[]
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  is_active?: boolean
  is_featured?: boolean
}

export interface CreateVariantRequest {
  product_id: string
  name: string
  sku?: string
  price: number
  cost_price?: number
  stock_quantity: number
  image_url?: string
  is_active?: boolean
}

export interface ProductStats {
  total_products: number
  active_products: number
  featured_products: number
  low_stock_products: number
  total_inventory_value: number
  average_price: number
  top_selling_products: Product[]
}

class ProductService {
  async getAllProducts(activeOnly: boolean = true, featuredOnly: boolean = false): Promise<Product[]> {
    let query = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        ),
        bullrhun_product_variants (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product by ID:', error)
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    if (!data) return null

    return {
      ...data,
      vendor: data.bullrhun_vendors,
      variants: data.bullrhun_product_variants
    }
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const { data, error } = await supabaseClient
      .from('bullrhun_products')
      .insert([product])
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw new Error(`Failed to create product: ${error.message}`)
    }

    return {
      ...data,
      vendor: data.bullrhun_vendors
    }
  }

  async updateProduct(id: string, product: UpdateProductRequest): Promise<Product> {
    const { data, error } = await supabaseClient
      .from('bullrhun_products')
      .update(product)
      .eq('id', id)
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw new Error(`Failed to update product: ${error.message}`)
    }

    return {
      ...data,
      vendor: data.bullrhun_vendors
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('bullrhun_products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      throw new Error(`Failed to delete product: ${error.message}`)
    }
  }

  async getProductStats(): Promise<ProductStats> {
    try {
      const { count: totalProducts, error: totalError } = await supabaseClient
        .from('bullrhun_products')
        .select('*', { count: 'exact' })

      const { count: activeProducts, error: activeError } = await supabaseClient
        .from('bullrhun_products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      const { count: featuredProducts, error: featuredError } = await supabaseClient
        .from('bullrhun_products')
        .select('*', { count: 'exact' })
        .eq('is_featured', true)

      const { count: lowStockProducts, error: lowStockError } = await supabaseClient
        .from('bullrhun_products')
        .select('*', { count: 'exact' })
        .lt('inventory_quantity', 10)

      const { data: products, error: productsError } = await supabaseClient
        .from('bullrhun_products')
        .select('base_price, inventory_quantity')
        .eq('is_active', true)

      if (totalError || activeError || featuredError || lowStockError || productsError) {
        console.error('Error fetching product stats:', { totalError, activeError, featuredError, lowStockError, productsError })
        throw new Error('Failed to fetch product statistics')
      }

      const totalValue = products?.reduce((sum, p) => sum + (p.base_price * p.inventory_quantity), 0) || 0
      const avgPrice = products?.length > 0 ? totalValue / products.length : 0

      return {
        total_products: totalProducts || 0,
        active_products: activeProducts || 0,
        featured_products: featuredProducts || 0,
        low_stock_products: lowStockProducts || 0,
        total_inventory_value: totalValue,
        average_price: avgPrice,
        top_selling_products: []
      }
    } catch (error) {
      console.error('ProductService.getProductStats error:', error)
      throw error
    }
  }

  async searchProducts(query: string, activeOnly: boolean = true): Promise<Product[]> {
    const searchQuery = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      searchQuery.eq('is_active', true)
    }

    const { data, error } = await searchQuery

    if (error) {
      console.error('Error searching products:', error)
      throw new Error(`Failed to search products: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async getProductsByVendor(vendorId: string, activeOnly: boolean = true): Promise<Product[]> {
    const query = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products by vendor:', error)
      throw new Error(`Failed to fetch products by vendor: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured products:', error)
      throw new Error(`Failed to fetch featured products: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async getProductsByCategory(category: any, activeOnly: boolean = true): Promise<Product[]> {
    console.log(category)
    let query:any;
    if(category ==0){
      query = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })
    }else{

    query = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .eq('chain_id', category)
      .order('created_at', { ascending: false })

    }


    if (activeOnly) {
      query.eq('is_active', true)
    }

    const { data, error } = await query
    console.log(data)

    if (error) {
      console.error('Error fetching products by category:', error)
      throw new Error(`Failed to fetch products by category: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async getLowStockProducts(threshold: number = 10, activeOnly: boolean = true): Promise<Product[]> {
    const query = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .lt('inventory_quantity', threshold)
      .order('inventory_quantity', { ascending: true })

    if (activeOnly) {
      query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching low stock products:', error)
      throw new Error(`Failed to fetch low stock products: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async updateProductStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<Product> {
    const product = await this.getProductById(id)
    if (!product) throw new Error('Product not found')

    let newQuantity = quantity
    if (operation === 'add') {
      newQuantity = product.inventory_quantity + quantity
    } else if (operation === 'subtract') {
      newQuantity = Math.max(0, product.inventory_quantity - quantity)
    }

    return this.updateProduct(id, { inventory_quantity: newQuantity })
  }

  async toggleFeatured(id: string, is_featured: boolean): Promise<Product> {
    return this.updateProduct(id, { is_featured })
  }

  async updateProductRating(id: string, rating: number): Promise<Product> {
    const { data, error } = await supabaseClient
      .from('bullrhun_products')
      .update({ rating })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product rating:', error)
      throw new Error(`Failed to update product rating: ${error.message}`)
    }

    return data
  }

  async incrementProductViews(id: string): Promise<void> {
    const { error } = await supabaseClient
      .rpc('increment_product_views', { product_id: id })

    if (error) {
      console.error('Error incrementing product views:', error)
      throw new Error(`Failed to increment product views: ${error.message}`)
    }
  }

  async getProductVariants(productId: string, activeOnly: boolean = true): Promise<ProductVariant[]> {
    const query = supabaseClient
      .from('bullrhun_product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('name', { ascending: true })

    if (activeOnly) {
      query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching product variants:', error)
      throw new Error(`Failed to fetch product variants: ${error.message}`)
    }

    return data || []
  }

  async createVariant(variant: CreateVariantRequest): Promise<ProductVariant> {
    const { data, error } = await supabaseClient
      .from('bullrhun_product_variants')
      .insert([variant])
      .select()
      .single()

    if (error) {
      console.error('Error creating product variant:', error)
      throw new Error(`Failed to create product variant: ${error.message}`)
    }

    return data
  }

  async updateVariant(id: string, variant: Partial<CreateVariantRequest>): Promise<ProductVariant> {
    const { data, error } = await supabaseClient
      .from('bullrhun_product_variants')
      .update(variant)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product variant:', error)
      throw new Error(`Failed to update product variant: ${error.message}`)
    }

    return data
  }

  async deleteVariant(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('bullrhun_product_variants')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product variant:', error)
      throw new Error(`Failed to delete product variant: ${error.message}`)
    }
  }

  async updateVariantStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<ProductVariant> {
    const { data: variant } = await supabaseClient
      .from('bullrhun_product_variants')
      .select('*')
      .eq('id', id)
      .single()

    if (!variant) throw new Error('Variant not found')

    let newQuantity = quantity
    if (operation === 'add') {
      newQuantity = variant.stock_quantity + quantity
    } else if (operation === 'subtract') {
      newQuantity = Math.max(0, variant.stock_quantity - quantity)
    }

    return this.updateVariant(id, { stock_quantity: newQuantity })
  }

  async getProductsByTag(tag: string, activeOnly: boolean = true): Promise<Product[]> {
    const query = supabaseClient
      .from('bullrhun_products')
      .select(`
        *,
        bullrhun_vendors (
          id,
          name,
          logo_url
        )
      `)
      .contains('tags', [tag])
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products by tag:', error)
      throw new Error(`Failed to fetch products by tag: ${error.message}`)
    }

    return data?.map(p => ({
      ...p,
      vendor: p.bullrhun_vendors
    })) || []
  }

  async getAllTags(): Promise<string[]> {
    const { data, error } = await supabaseClient
      .from('bullrhun_products')
      .select('tags')

    if (error) {
      console.error('Error fetching tags:', error)
      throw new Error(`Failed to fetch tags: ${error.message}`)
    }

    const tags = new Set<string>()
    data?.forEach(p => p.tags?.forEach(t => tags.add(t)))
    return Array.from(tags)
  }

  async checkStock(variantId: string | null, quantity: number): Promise<{ available: boolean; stock: number }> {
    if (variantId) {
      const { data: variant } = await supabaseClient
        .from('bullrhun_product_variants')
        .select('stock_quantity')
        .eq('id', variantId)
        .single()

      if (!variant) {
        return { available: false, stock: 0 }
      }

      const available = variant.stock_quantity >= quantity
      return { available, stock: variant.stock_quantity }
    } else {
      const { data: product } = await supabaseClient
        .from('bullrhun_products')
        .select('inventory_quantity')
        .eq('is_active', true)
        .single()

      if (!product) {
        return { available: false, stock: 0 }
      }

      const available = product.inventory_quantity >= quantity
      return { available, stock: product.inventory_quantity }
    }
  }

  async getProducts(activeOnly: boolean = true, featuredOnly: boolean = false): Promise<Product[]> {
    return this.getAllProducts(activeOnly, featuredOnly)
  }
}

export { ProductService }
export const productService = new ProductService()
