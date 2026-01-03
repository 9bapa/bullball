# Fix RLS Policy for Cron Job Cycles Table

## Problem:
Cron job gets RLS policy violation when trying to create cycles:
```
❌ Cron job error: Error [DatabaseError]: Failed to create in bullrhun_cycles: 
new row violates row-level security policy for table "bullrhun_cycles"
```

## Root Cause:
Current RLS policies only allow `service_role` to insert into `bullrhun_cycles`, but cron jobs run as `authenticated` users.

## Solution: Apply RLS Policy Fix

### Option 1: Quick SQL
```sql
-- Add RLS policy to allow authenticated users to create cycles
CREATE POLICY "Authenticated users full access" ON bullrhun_cycles 
FOR ALL USING (auth.role() = 'authenticated');
```

### Option 2: Run Migration File
Apply the file: `supabase/cycles-rls-fix.sql`

### Option 3: Update Full Schema
Apply the updated: `supabase/schema-simplified.sql`

## Result:
- ✅ Authenticated users (cron jobs) can create/update cycles
- ✅ Public can still read cycles (existing policy)
- ✅ Service role maintains full access (existing policy)
- ✅ Proper security model maintained

## Current Policies After Fix:
1. **Public read access** - Anyone can read cycles
2. **Authenticated users full access** - Authenticated users can create/update/delete cycles
3. **Service role full access** - Service role has full access

## Affected Tables:
- ✅ **bullrhun_products** - Previously fixed
- ✅ **bullrhun_cycles** - Now fixed
- Other tables (trades, tokens, etc.) may need similar fixes if used by cron jobs

## Test:
After applying policy, cron jobs should be able to create cycle records without RLS violations.