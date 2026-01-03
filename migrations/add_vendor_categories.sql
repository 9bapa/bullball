-- Migration: Add categories column to bullrhun_vendors table
-- Run this in Supabase SQL editor

BEGIN;

-- 1. Add categories column with default empty array
ALTER TABLE public.bullrhun_vendors 
ADD COLUMN categories jsonb DEFAULT '[]'::jsonb;

-- 2. Create GIN index for performance (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_bullrhun_vendors_categories_gin 
ON public.bullrhun_vendors USING gin (categories);

-- 3. Add constraint for data integrity (only if it doesn't exist)
ALTER TABLE public.bullrhun_vendors 
ADD CONSTRAINT IF NOT EXISTS bullrhun_vendors_categories_check 
CHECK (jsonb_typeof(categories) = 'array');

COMMIT;

-- Optional: Update existing vendors to have empty categories array
UPDATE public.bullrhun_vendors 
SET categories = '[]'::jsonb 
WHERE categories IS NULL;