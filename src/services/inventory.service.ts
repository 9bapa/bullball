import { productService, ProductWithVariants, ProductVariant } from './product.service';
import { vendorService } from './vendor.service';
import { supabase } from '@/lib/supabase';

const supabaseClient = (supabase )!;

export interface InventoryLog {
  id: string;
  variant_id: string;
  change_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason?: string;
  reference_id?: string;
  created_at: string;
  variant?: ProductVariant;
  product?: ProductWithVariants;
}

export interface LowStockAlert {
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_sku: string;
  variant_color?: string;
  variant_size?: string;
  current_stock: number;
  reorder_level: number;
  vendor_name: string;
  vendor_email: string;
  suggested_reorder_quantity: number;
  estimated_cost: number;
}

export interface StockAdjustmentRequest {
  variant_id: string;
  quantity_change: number;
  reason: string;
  reference_id?: string;
}

export interface InventoryReport {
  total_products: number;
  total_variants: number;
  total_stock_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  top_selling_variants: {
    variant_id: string;
    product_name: string;
    variant_sku: string;
    total_sold: number;
    total_revenue: number;
  }[];
  low_stock_items: LowStockAlert[];
  inventory_by_type: {
    type: string;
    total_variants: number;
    total_stock: number;
    total_value: number;
  }[];
}

class InventoryService {
  async updateStock(variantId: string, quantityChange: number, reason: string, referenceId?: string): Promise<void> {
    // Get current stock
    const variant = await productService.getVariantById(variantId);
    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }

    const newStock = (variant.stock_quantity || 0) + quantityChange;
    
    if (newStock < 0) {
      throw new Error('Insufficient stock for this operation');
    }

    // Update stock quantity
    const { error } = await supabaseClient
      .from('bullrhun_product_variants')
      .update({
        stock_quantity: newStock
      })
      .eq('id', variantId);

    if (error) {
      console.error('Error updating stock:', error);
      throw new Error(`Failed to update stock: ${error.message}`);
    }

    // Log inventory change
    await this.logInventoryChange(
      variantId,
      this.getChangeType(quantityChange),
      quantityChange,
      variant.stock_quantity ?? 0,
      newStock,
      reason,
      referenceId
    );

    // Check if we need to create a reorder alert
    if (newStock <= (variant.reorder_level ?? 0)) {
      await this.createReorderAlert(variantId);
    }
  }

  async adjustStock(request: StockAdjustmentRequest): Promise<void> {
    await this.updateStock(request.variant_id, request.quantity_change, request.reason, request.reference_id);
  }

  async getInventoryHistory(variantId?: string, limit: number = 100): Promise<InventoryLog[]> {
    let query = supabaseClient
      .from('bullrhun_inventory_log')
      .select(`
        *,
        bullrhun_product_variants!inner (
          *,
          bullrhun_products!inner (*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching inventory history:', error);
      throw new Error(`Failed to fetch inventory history: ${error.message}`);
    }

    return data?.map(log => ({
      ...log,
      variant: log.bullrhun_product_variants,
      product: log.bullrhun_product_variants.bullrhun_products
    })) || [];
  }

  async getLowStockItems(threshold?: number): Promise<LowStockAlert[]> {
    const query = supabaseClient
      .from('bullrhun_product_variants')
      .select(`
        *,
        bullrhun_products!inner (
          *,
          bullrhun_vendors!inner (*)
        )
      `)
      .lte('stock_quantity', threshold || 10)
      .eq('is_active', true)
      .eq('bullrhun_products.is_active', true);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching low stock items:', error);
      throw new Error(`Failed to fetch low stock items: ${error.message}`);
    }

    return data?.map(item => {
      const variant = item as any;
      const product = variant.bullrhun_products;
      const vendor = product.bullrhun_vendors;
      
      const suggestedReorderQuantity = Math.max(variant.reorder_level * 2, 20);
      const estimatedCost = (product.cost_price || 0) * suggestedReorderQuantity;

      return {
        variant_id: variant.id,
        product_id: product.id,
        product_name: product.name,
        variant_sku: variant.sku,
        variant_color: variant.color,
        variant_size: variant.size,
        current_stock: variant.stock_quantity,
        reorder_level: variant.reorder_level,
        vendor_name: vendor.name,
        vendor_email: vendor.email,
        suggested_reorder_quantity: suggestedReorderQuantity,
        estimated_cost: estimatedCost
      };
    }) || [];
  }

  async getOutOfStockItems(): Promise<LowStockAlert[]> {
    return this.getLowStockItems(0);
  }

  async getInventoryReport(): Promise<InventoryReport> {
    // Get all active variants with products
    const { data: variants, error } = await supabaseClient
      .from('bullrhun_product_variants')
      .select(`
        *,
        bullrhun_products!inner (
          *,
          bullrhun_vendors (
            name,
            email
          )
        )
      `)
      .eq('is_active', true)
      .eq('bullrhun_products.is_active', true);

    if (error) {
      console.error('Error generating inventory report:', error);
      throw new Error(`Failed to generate inventory report: ${error.message}`);
    }

    if (!variants || variants.length === 0) {
      return {
        total_products: 0,
        total_variants: 0,
        total_stock_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        top_selling_variants: [],
        low_stock_items: [],
        inventory_by_type: []
      };
    }

    // Get sales data for top selling variants
    const variantIds = variants.map(v => v.id);
    const { data: salesData } = await supabaseClient
      .from('bullrhun_order_items')
      .select('variant_id, quantity, total_price')
      .in('variant_id', variantIds);

    // Calculate sales metrics
    const salesMap = new Map<string, { totalSold: number; totalRevenue: number }>();
    salesData?.forEach(sale => {
      const current = salesMap.get(sale.variant_id) || { totalSold: 0, totalRevenue: 0 };
      salesMap.set(sale.variant_id, {
        totalSold: current.totalSold + sale.quantity,
        totalRevenue: current.totalRevenue + Number(sale.total_price)
      });
    });

    // Calculate metrics
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    const inventoryByType = new Map<string, { totalVariants: number; totalStock: number; totalValue: number }>();

    variants.forEach(variant => {
      const product = (variant as any).bullrhun_products;
      const costPrice = product.cost_price || 0;
      const stockValue = variant.stock_quantity * costPrice;
      totalStockValue += stockValue;

      if (variant.stock_quantity <= variant.reorder_level) {
        lowStockCount++;
      }
      if (variant.stock_quantity === 0) {
        outOfStockCount++;
      }

      // Group by product type
      const current = inventoryByType.get(product.type) || { totalVariants: 0, totalStock: 0, totalValue: 0 };
      inventoryByType.set(product.type, {
        totalVariants: current.totalVariants + 1,
        totalStock: current.totalStock + variant.stock_quantity,
        totalValue: current.totalValue + stockValue
      });
    });

    // Get top selling variants
    const topSellingVariants = Array.from(salesMap.entries())
      .map(([variantId, sales]) => {
        const variant = variants.find(v => v.id === variantId);
        const product = variant ? (variant as any).bullrhun_products : null;
        return {
          variant_id: variantId,
          product_name: product?.name || 'Unknown',
          variant_sku: variant?.sku || 'Unknown',
          total_sold: sales.totalSold,
          total_revenue: sales.totalRevenue
        };
      })
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10);

    // Get low stock items
    const lowStockItems = await this.getLowStockItems();

    return {
      total_products: new Set(variants.map(v => (v as any).bullrhun_products.id)).size,
      total_variants: variants.length,
      total_stock_value: totalStockValue,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      top_selling_variants: topSellingVariants,
      low_stock_items: lowStockItems,
      inventory_by_type: Array.from(inventoryByType.entries()).map(([type, data]) => ({
        type,
        total_variants: data.totalVariants,
        total_stock: data.totalStock,
        total_value: data.totalValue
      }))
    };
  }

  async createReorderAlert(variantId: string): Promise<void> {
    // Get variant details
    const variant = await productService.getVariantById(variantId);
    if (!variant) return;

    const product = await productService.getProductById(variant.product_id);
    if (!product) return;

    // In a real implementation, you would:
    // 1. Send email notification to admin
    // 2. Create a task in project management system
    // 3. Send notification to vendor if configured
    // 4. Create a draft vendor order
    
    console.log(`🚨 Low stock alert for ${product.name} - ${variant.sku}: ${variant.stock_quantity} units remaining (Reorder level: ${variant.reorder_level})`);
  }

  async bulkUpdateStock(updates: { variantId: string; quantityChange: number; reason: string }[]): Promise<void> {
    for (const update of updates) {
      try {
        await this.updateStock(update.variantId, update.quantityChange, update.reason);
      } catch (error) {
        console.error(`Failed to update stock for variant ${update.variantId}:`, error);
        // Continue with other updates even if one fails
      }
    }
  }

  async getStockValueByVendor(): Promise<{
    vendor_id: string;
    vendor_name: string;
    total_products: number;
    total_variants: number;
    total_stock_value: number;
    low_stock_count: number;
  }[]> {
    const { data: variants, error } = await supabaseClient
      .from('bullrhun_product_variants')
      .select(`
        *,
        bullrhun_products!inner (
          *,
          bullrhun_vendors!inner (*)
        )
      `)
      .eq('is_active', true)
      .eq('bullrhun_products.is_active', true);

    if (error) {
      console.error('Error getting stock value by vendor:', error);
      throw new Error(`Failed to get stock value by vendor: ${error.message}`);
    }

    const vendorMap = new Map<string, any>();

    variants?.forEach(variant => {
      const vendor = (variant as any).bullrhun_products.bullrhun_vendors;
      const product = (variant as any).bullrhun_products;
      
      if (!vendorMap.has(vendor.id)) {
        vendorMap.set(vendor.id, {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          total_products: new Set(),
          total_variants: 0,
          total_stock_value: 0,
          low_stock_count: 0
        });
      }

      const vendorData = vendorMap.get(vendor.id);
      vendorData.total_products.add(product.id);
      vendorData.total_variants += 1;
      vendorData.total_stock_value += variant.stock_quantity * (product.cost_price || 0);
      
      if (variant.stock_quantity <= variant.reorder_level) {
        vendorData.low_stock_count += 1;
      }
    });

    return Array.from(vendorMap.values()).map(vendor => ({
      ...vendor,
      total_products: vendor.total_products.size
    }));
  }

  private async logInventoryChange(
    variantId: string,
    changeType: 'sale' | 'purchase' | 'adjustment' | 'return',
    quantityChange: number,
    quantityBefore: number,
    quantityAfter: number,
    reason: string,
    referenceId?: string
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('bullrhun_inventory_log')
      .insert({
        variant_id: variantId,
        change_type: changeType,
        quantity_change: quantityChange,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        reason,
        reference_id: referenceId
      });

    if (error) {
      console.error('Error logging inventory change:', error);
      // Don't throw error here as it's not critical for the main operation
    }
  }

  private getChangeType(quantityChange: number): 'sale' | 'purchase' | 'adjustment' | 'return' {
    if (quantityChange < 0) {
      return 'sale';
    } else if (quantityChange > 0) {
      return 'purchase';
    } else {
      return 'adjustment';
    }
  }

  async getInventoryAnalytics(dateRange: { start: Date; end: Date }): Promise<{
    totalSales: number;
    totalPurchases: number;
    netInventoryChange: number;
    topSellingProducts: Array<{
      product_name: string;
      totalSold: number;
      totalRevenue: number;
    }>;
    inventoryTurnover: number;
  }> {
    // Get inventory changes within date range
    const { data: changes } = await supabaseClient
      .from('bullrhun_inventory_log')
      .select(`
        *,
        bullrhun_product_variants!inner (
          bullrhun_products!inner (*)
        )
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    const productMap = new Map<string, { name: string; totalSold: number; totalRevenue: number }>();

    let totalSales = 0;
    let totalPurchases = 0;

    changes?.forEach(change => {
      const product = (change as any).bullrhun_product_variants.bullrhun_products;
      
      if (change.change_type === 'sale') {
        totalSales += Math.abs(change.quantity_change);
        
        const current = productMap.get(product.id) || { name: product.name, totalSold: 0, totalRevenue: 0 };
        productMap.set(product.id, {
          ...current,
          totalSold: current.totalSold + Math.abs(change.quantity_change)
        });
      } else if (change.change_type === 'purchase') {
        totalPurchases += change.quantity_change;
      }
    });

    const topSellingProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    const netInventoryChange = totalPurchases - totalSales;
    const inventoryTurnover = totalPurchases > 0 ? totalSales / totalPurchases : 0;

    return {
      totalSales,
      totalPurchases,
      netInventoryChange,
      topSellingProducts: topSellingProducts.map(p => ({
        product_name: p.name,
        totalSold: p.totalSold,
        totalRevenue: p.totalRevenue
      })),
      inventoryTurnover
    };
  }
}

export const inventoryService = new InventoryService();