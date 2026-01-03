import { supabase, supabaseService } from '@/lib/supabase';

const supabaseClient = (supabase)!;
const supabaseAdminClient = (supabaseService)!;

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  social_links?: Record<string, string>;
  commission_rate?: number;
  payment_info?: Record<string, any>;
  shipping_info?: Record<string, any>;
  is_active: boolean;
  is_featured: boolean;
  rating?: number;
  total_sales?: number;
  wallet_address?: string;
  notes?: string;
  categories?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateVendorRequest {
  user_id?: string; // Optional - will be derived from wallet_address
  wallet_address?: string; // Primary identifier
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  social_links?: Record<string, string>;
  commission_rate?: number;
  payment_info?: Record<string, any>;
  shipping_info?: Record<string, any>;
  is_active?: boolean;
  is_featured?: boolean;
  categories?: string[];
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  is_active?: boolean;
  is_featured?: boolean;
}

export interface VendorStats {
  total_vendors: number;
  active_vendors: number;
  featured_vendors: number;
  pending_vendors: number;
  total_sales: number;
  average_rating: number;
}

class VendorService {
  async getAllVendors(activeOnly: boolean = true): Promise<Vendor[]> {
    const query = supabaseClient
      .from('bullrhun_vendors')
      .select('*')
      .eq('is_active', activeOnly)
      .order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      throw new Error(`Failed to fetch vendors: ${error.message}`);
    }

    return data || [];
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const query = supabaseClient
      .from('bullrhun_vendors')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor by ID:', error);
      throw new Error(`Failed to fetch vendor: ${error.message}`);
    }

    return data;
  }

  async createVendor(vendor: CreateVendorRequest): Promise<Vendor> {
    // Map interface field names to database column names
    const { zip, user_id, wallet_address, ...vendorWithoutZipAndUser } = vendor;
    
    // Find user by wallet address to get user_id
    let userId = user_id;
    if (!userId && wallet_address) {
      try {
        const { data: userData, error } = await supabaseAdminClient
          .from('bullrhun_users')
          .select('id')
          .eq('wallet_address', wallet_address)
          .single();
        
        if (error) {
          console.warn('User not found for wallet address:', wallet_address, error);
          userId = undefined; // User not found, proceed without user_id
        } else {
          userId = userData?.id;
        }
      } catch (err) {
        console.error('Error fetching user by wallet address:', err);
        userId = undefined; // Error occurred, proceed without user_id
      }
    }
    
    const dbVendor = {
      ...vendorWithoutZipAndUser,
      zip_code: zip, // Map zip to zip_code
      wallet_address: userId ? wallet_address?.toLowerCase() : null, // Only set wallet_address if we have a valid user (lowercase for consistency)
      user_id: userId // Use user_id when found
    };

    const { data, error } = await supabaseClient
      .from('bullrhun_vendors')
      .insert([dbVendor])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw new Error(`Failed to create vendor: ${error.message}`);
    }

    return data;
  }

  async updateVendor(id: string, vendor: UpdateVendorRequest): Promise<Vendor> {
    const { zip, user_id, wallet_address, ...vendorWithoutZipAndUser } = vendor;
    
    // Find user by wallet address to get user_id
    let userId = user_id;
    if (!userId && wallet_address && supabaseAdminClient) {
      try {
        const { data: userData, error } = await supabaseAdminClient
          .from('bullrhun_users')
          .select('id')
          .eq('wallet_address', wallet_address.toLowerCase())
          .single();
        
        if (error) {
          console.warn('User not found for wallet address:', wallet_address, error);
          userId = undefined; // User not found, proceed without user_id
        } else {
          userId = userData?.id;
        }
      } catch (err) {
        console.error('Error fetching user by wallet address:', err);
        userId = undefined; // Error occurred, proceed without user_id
      }
    }

    const dbVendor = {
      ...vendorWithoutZipAndUser,
      zip_code: zip, // Map zip to zip_code
      wallet_address: userId ? wallet_address?.toLowerCase() : null, // Only set wallet_address if we have a valid user (lowercase for consistency)
      user_id: userId // Use user_id when found
    };

    const { data, error } = await supabaseClient
      .from('bullrhun_vendors')
      .update(dbVendor)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      throw new Error(`Failed to update vendor: ${error.message}`);
    }

    return data;
  }

  async deleteVendor(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('bullrhun_vendors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor:', error);
      throw new Error(`Failed to delete vendor: ${error.message}`);
    }
  }

  async getVendorStats(): Promise<VendorStats> {
    try {
      // Get total vendors
      const { count: totalVendors, error: totalError } = await supabaseClient
        .from('bullrhun_vendors')
        .select('*', { count: 'exact' });

      // Get active vendors
      const { count: activeVendors, error: activeError } = await supabaseClient
        .from('bullrhun_vendors')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Get featured vendors
      const { count: featuredVendors, error: featuredError } = await supabaseClient
        .from('bullrhun_vendors')
        .select('*', { count: 'exact' })
        .eq('is_featured', true);

      // Get pending vendors (inactive but not deleted)
      const { count: pendingVendors, error: pendingError } = await supabaseClient
        .from('bullrhun_vendors')
        .select('*', { count: 'exact' })
        .eq('is_active', false);

      if (totalError || activeError || featuredError || pendingError) {
        console.error('Error fetching vendor stats:', { totalError, activeError, featuredError, pendingError });
        throw new Error('Failed to fetch vendor statistics');
      }

      // For now, return placeholder values for sales and rating
      return {
        total_vendors: totalVendors || 0,
        active_vendors: activeVendors || 0,
        featured_vendors: featuredVendors || 0,
        pending_vendors: pendingVendors || 0,
        total_sales: 0,
        average_rating: 0
      };
    } catch (error) {
      console.error('VendorService.getVendorStats error:', error);
      throw error;
    }
  }

  async searchVendors(query: string, activeOnly: boolean = true): Promise<Vendor[]> {
    const searchQuery = supabaseClient
      .from('bullrhun_vendors')
      .select('*')
      .or(`name.ilike.%${query}%,business_name.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (activeOnly) {
      searchQuery.eq('is_active', true);
    }

    const { data, error } = await searchQuery;

    if (error) {
      console.error('Error searching vendors:', error);
      throw new Error(`Failed to search vendors: ${error.message}`);
    }

    return data || [];
  }

  async getFeaturedVendors(limit: number = 10): Promise<Vendor[]> {
    const { data, error } = await supabaseClient
      .from('bullrhun_vendors')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured vendors:', error);
      throw new Error(`Failed to fetch featured vendors: ${error.message}`);
    }

    return data || [];
  }

  async getVendorsByCategory(category: string, activeOnly: boolean = true): Promise<Vendor[]> {
    const query = supabaseClient
      .from('bullrhun_vendors')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (activeOnly) {
      query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendors by category:', error);
      throw new Error(`Failed to fetch vendors by category: ${error.message}`);
    }

    return data || [];
  }

  async approveVendor(id: string): Promise<Vendor> {
    return this.updateVendor(id, { is_active: true });
  }

  async rejectVendor(id: string): Promise<Vendor> {
    return this.updateVendor(id, { is_active: false });
  }

  async toggleFeatured(id: string, is_featured: boolean): Promise<Vendor> {
    return this.updateVendor(id, { is_featured });
  }

  async updateVendorRating(id: string, rating: number): Promise<Vendor> {
    const { data, error } = await supabaseClient
      .from('bullrhun_vendors')
      .update({ rating })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor rating:', error);
      throw new Error(`Failed to update vendor rating: ${error.message}`);
    }

    return data;
  }

  async getVendorProducts(vendorId: string, activeOnly: boolean = true): Promise<any[]> {
    const query = supabaseClient
      .from('bullrhun_products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor products:', error);
      throw new Error(`Failed to fetch vendor products: ${error.message}`);
    }

    return data || [];
  }

  async getVendorOrders(vendorId: string): Promise<any[]> {
    const { data, error } = await supabaseClient
      .from('bullrhun_orders')
      .select(`
        *,
        bullrhun_order_items (
          bullrhun_products (*)
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendor orders:', error);
      throw new Error(`Failed to fetch vendor orders: ${error.message}`);
    }

    return data || [];
  }

  async getVendorRevenue(vendorId: string, startDate?: string, endDate?: string): Promise<number> {
    let query = supabaseClient
      .from('bullrhun_orders')
      .select('total_amount')
      .eq('vendor_id', vendorId)
      .eq('status', 'delivered');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor revenue:', error);
      throw new Error(`Failed to fetch vendor revenue: ${error.message}`);
    }

    return data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  }

  // Alias for backward compatibility
  async getVendors(activeOnly: boolean = true): Promise<Vendor[]> {
    return this.getAllVendors(activeOnly);
  }

  // Static admin methods using service role client (bypasses RLS)
  static async createVendorAdmin(vendor: CreateVendorRequest): Promise<Vendor> {
    if (!supabaseAdminClient) {
      throw new Error('Service role client not initialized. Check SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }

    // Map interface field names to database column names
    const { zip, user_id, wallet_address, ...vendorWithoutZipAndUser } = vendor;
    
    // Find user by wallet address to get user_id
    let userId = user_id;
    if (!userId && wallet_address) {
      const { data: userData } = await supabaseAdminClient
        .from('bullrhun_users')
        .select('id')
        .eq('wallet_address', wallet_address.toLowerCase())
        .single();
      userId = userData?.id;
    }
    
    const dbVendor = {
      ...vendorWithoutZipAndUser,
      zip_code: zip, // Map zip to zip_code
      wallet_address: wallet_address || null,
      user_id: userId || null // Use user_id or find by wallet_address
    };

    const { data, error } = await supabaseAdminClient
      .from('bullrhun_vendors')
      .insert([dbVendor])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      throw new Error(`Failed to create vendor: ${error.message}`);
    }

    return data;
  }

  static async getAllVendorsAdmin(activeOnly: boolean = true): Promise<Vendor[]> {
    let query = supabaseAdminClient
      .from('bullrhun_vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      throw new Error(`Failed to fetch vendors: ${error.message}`);
    }

    return data || [];
  }
}

export { VendorService };
export const vendorService = new VendorService();