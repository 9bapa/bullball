import { supabase, supabaseService } from '@/lib/supabase';

const supabaseClient = supabaseService;
import { DatabaseError } from '@/types/bullrhun.types';

// Generic repository pattern for database operations
export abstract class BaseRepository<T> {
  protected tableName: string;
  protected supabase = supabase;
  protected supabaseService = supabaseService;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async handleDatabaseError(error: any, operation: string): Promise<never> {
    console.error(`Database ${operation} error in ${this.tableName}:`, error);
    throw new DatabaseError(
      `Failed to ${operation} in ${this.tableName}: ${error?.message || 'Unknown error'}`,
      error?.code
    );
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      // Use API routes instead of direct database access
      const tableName = this.tableName.replace('bullrhun_', ''); // Remove prefix
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/${this.tableName.replace('bullrhun_', '')}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return this.handleDatabaseError(errorData, 'create');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return this.handleDatabaseError(error, 'create');
    }
  }

  // Service role create method for cron jobs and admin operations
  async createWithServiceRole(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.supabaseService
        .from(this.tableName)
        .insert(data as any)
        .select();

      if (error) {
        return this.handleDatabaseError(error, 'createWithServiceRole');
      }

      // Handle both array and single object responses
      if (Array.isArray(result)) {
        if (result.length === 0) {
          throw new Error('No rows returned from create operation');
        }
        return result[0];
      }

      return result;
    } catch (error) {
      return this.handleDatabaseError(error, 'createWithServiceRole');
    }
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    try {
      const tableName = this.tableName.replace('bullrhun_', '');
      const response = await fetch(`/api/${tableName}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return this.handleDatabaseError(errorData, 'createMany');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return this.handleDatabaseError(error, 'createMany');
    }
  }

  async findById(id: string | number): Promise<T | null> {
    try {
      const { data: result, error } = await supabaseClient
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        return this.handleDatabaseError(error, 'findById');
      }

      return result || null;
    } catch (error) {
      return this.handleDatabaseError(error, 'findById');
    }
  }

  // Service role find method for cron jobs and admin operations
  async findByIdWithServiceRole(id: string | number): Promise<T | null> {
    try {
      const { data: result, error } = await this.supabaseService
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        return this.handleDatabaseError(error, 'findByIdWithServiceRole');
      }

      return result || null;
    } catch (error) {
      return this.handleDatabaseError(error, 'findByIdWithServiceRole');
    }
  }

  async findOne(conditions: Partial<T>): Promise<T | null> {
    try {
      let query = supabaseClient.from(this.tableName).select('*');
      
      for (const [key, value] of Object.entries(conditions)) {
        query = query.eq(key, value);
      }

      const { data: result, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        return this.handleDatabaseError(error, 'findOne');
      }

      return result || null;
    } catch (error) {
      return this.handleDatabaseError(error, 'findOne');
    }
  }

  async findMany(
    conditions: Partial<T> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<T[]> {
    try {
      let query = supabaseClient.from(this.tableName).select('*');
      
      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.offset(options.offset);
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      }

      const { data: result, error } = await query;

      if (error) {
        return this.handleDatabaseError(error, 'findMany');
      }

      return result || [];
    } catch (error) {
      return this.handleDatabaseError(error, 'findMany');
    }
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabaseClient
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return this.handleDatabaseError(error, 'update');
      }

      return result;
    } catch (error) {
      return this.handleDatabaseError(error, 'update');
    }
  }

  // Service role update method for cron jobs and admin operations
  async updateWithServiceRole(id: string | number, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.supabaseService
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select();

      if (error) {
        return this.handleDatabaseError(error, 'updateWithServiceRole');
      }

      // Handle both array and single object responses
      if (Array.isArray(result)) {
        if (result.length === 0) {
          throw new Error('No rows returned from update operation');
        }
        return result[0];
      }

      return result;
    } catch (error) {
      return this.handleDatabaseError(error, 'updateWithServiceRole');
    }
  }

  async updateByConditions(
    conditions: Partial<T>,
    data: Partial<T>
  ): Promise<T[]> {
    try {
      let query = supabaseClient.from(this.tableName).update(data as any);
      
      for (const [key, value] of Object.entries(conditions)) {
        query = query.eq(key, value);
      }

      const { data: result, error } = await query.select();

      if (error) {
        return this.handleDatabaseError(error, 'updateByConditions');
      }

      return result || [];
    } catch (error) {
      return this.handleDatabaseError(error, 'updateByConditions');
    }
  }

  async delete(id: string | number): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        return this.handleDatabaseError(error, 'delete');
      }
    } catch (error) {
      return this.handleDatabaseError(error, 'delete');
    }
  }

  async count(conditions: Partial<T> = {}): Promise<number> {
    try {
      let query = supabaseClient.from(this.tableName).select('*', { count: 'exact', head: true });
      
      for (const [key, value] of Object.entries(conditions)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }

      const { count, error } = await query;

      if (error) {
        return this.handleDatabaseError(error, 'count');
      }

      return count || 0;
    } catch (error) {
      return this.handleDatabaseError(error, 'count');
    }
  }

  async exists(conditions: Partial<T>): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  // Utility method for upsert operations
  async upsert(data: Partial<T>, conflictColumns: string[] = []): Promise<T> {
    try {
      // Use specific API routes for different table types
      let response;
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      switch (this.tableName) {
        case 'bullrhun_cycles':
          response = await fetch(`${baseUrl}/api/cron/cycle/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, conflictColumns })
          });
          break;
        case 'bullrhun_metrics':
          response = await fetch(`${baseUrl}/api/metrics/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, conflictColumns })
          });
          break;
        default:
          response = await fetch(`${baseUrl}/api/${this.tableName.replace('bullrhun_', '')}/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, conflictColumns })
          });
          break;
      }

      if (!response.ok) {
        const errorData = await response.json();
        return this.handleDatabaseError(errorData, 'upsert');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return this.handleDatabaseError(error, 'upsert');
    }
  }

  // Service role upsert method for cron jobs and admin operations
  async upsertWithServiceRole(data: Partial<T>, conflictColumns: string[] = []): Promise<T> {
    try {
      const { data: result, error } = await this.supabaseService
        .from(this.tableName)
        .upsert(data as any, { 
          onConflict: conflictColumns.length > 0 ? conflictColumns.join(',') : undefined 
        })
        .select();

      if (error) {
        return this.handleDatabaseError(error, 'upsertWithServiceRole');
      }

      // Handle both array and single object responses
      if (Array.isArray(result)) {
        if (result.length === 0) {
          throw new Error('No rows returned from upsert operation');
        }
        return result[0];
      }

      return result;
    } catch (error) {
      return this.handleDatabaseError(error, 'upsertWithServiceRole');
    }
  }

  // Utility method for raw queries
  async rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const { data: result, error } = await supabaseClient.rpc(functionName, params);

      if (error) {
        return this.handleDatabaseError(error, `rpc(${functionName})`);
      }

      return result as T;
    } catch (error) {
      return this.handleDatabaseError(error, `rpc(${functionName})`);
    }
  }
}