-- Debug query to check product inventory values
-- Run this in Supabase SQL Editor to see what's in the database

SELECT 
    id,
    name,
    inventory_quantity,
    CASE 
        WHEN inventory_quantity IS NULL THEN 'NULL'
        WHEN inventory_quantity = 0 THEN 'ZERO'
        WHEN inventory_quantity > 0 THEN CONCAT('VALUE: ', inventory_quantity)
        ELSE 'UNKNOWN'
    END as inventory_status
FROM bullrhun_products 
ORDER BY created_at DESC
LIMIT 10;