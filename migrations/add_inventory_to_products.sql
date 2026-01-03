-- Migration: Add inventory_quantity to bullrhun_products table
-- Run this in Supabase SQL Editor

BEGIN;

-- Add inventory_quantity column to bullrhun_products
ALTER TABLE public.bullrhun_products 
ADD COLUMN inventory_quantity integer DEFAULT 0;

-- Add check constraint to ensure inventory is non-negative
ALTER TABLE public.bullrhun_products 
ADD CONSTRAINT bullrhun_products_inventory_quantity_check 
CHECK (inventory_quantity >= 0);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bullrhun_products_inventory_quantity 
ON public.bullrhun_products USING btree (inventory_quantity);

COMMIT;