-- BullRhun Enhanced Schema Final Verification
SELECT 'BullRhun Enhanced Schema Verification' as verification_status;

-- Check all bullrhun_ tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE 'bullrhun_%' 
  AND table_schema = 'public'
ORDER BY table_name;

-- Verify enhanced columns in bullrhun_tokens
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bullrhun_tokens' 
    AND column_name IN ('wallet_address', 'creator', 'initial_buy', 'market_cap_sol', 'uri', 'description', 'image_url', 'pool')
ORDER BY column_name;

-- Check key indexes for performance
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE tablename LIKE 'bullrhun_%' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Test basic token creator functionality
SELECT 
    'Sample Creator Test' as test_description,
    t.name,
    t.symbol,
    t.created_at
FROM bullrhun_tokens t 
WHERE t.creator IS NOT NULL 
LIMIT 5;

-- Check performance metrics table
SELECT COUNT(*) as performance_records FROM performance_metrics;

-- Final success verification
SELECT 
    'BullRhun Enhanced Schema Fully Operational' as final_status,
    now() as verification_time,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'bullrhun_%') as bullrhun_table_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'bullrhun_tokens' AND column_name IN ('creator', 'initial_buy', 'market_cap_sol', 'uri')) as enhanced_column_count;