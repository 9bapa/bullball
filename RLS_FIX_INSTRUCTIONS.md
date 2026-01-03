# Fix RLS Policy for Product Creation

## Problem:
Users get RLS policy violation when trying to create products:
```
{code: '42501', message: 'new row violates row-level security policy for table "bullrhun_products"'}
```

## Root Cause:
Current RLS policies only allow `service_role` to insert into `bullrhun_products`, but regular authenticated users (including admin) should be able to create products.

## Solution: Apply RLS Policy Fix

### Option 1: Run SQL in Supabase Dashboard
```sql
-- Add RLS policy to allow authenticated users to create products
CREATE POLICY "Authenticated users full access" ON bullrhun_products 
FOR ALL USING (auth.role() = 'authenticated');
```

### Option 2: Run Migration File
Apply the file: `supabase/products-rls-fix.sql`

### Option 3: Update Full Schema
Apply the updated: `supabase/merch-schema.sql`

## Result:
- ✅ Authenticated users can create products
- ✅ Public can still read products (existing policy)
- ✅ Service role maintains full access (existing policy)
- ✅ Proper security model maintained

## Current Policies After Fix:
1. **Public read access** - Anyone can read products
2. **Authenticated users full access** - Authenticated users can create/update/delete products
3. **Service role full access** - Service role has full access

## Test:
After applying policy, admin users should be able to create products without RLS violations.