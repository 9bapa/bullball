-- Test the enhanced schema functionality
SELECT 'Testing BullRhun Enhanced Schema' as test_status;

-- Test creator query function
SELECT * FROM get_tokens_by_creator('8qqCpRYUhm4KB5DgA66WCFLtu46GKgYNeX7sg5rEzjzM', 5) as creator_test;

-- Check all new columns exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'bullrhun_tokens' 
    AND column_name IN ('creator', 'initial_buy', 'market_cap_sol', 'uri', 'description', 'image_url', 'uri_processed')
ORDER BY column_name;

-- Verify pumpportal buffer exists
SELECT COUNT(*) as buffer_records FROM pumpportal_buffer WHERE processed = FALSE;

-- Check token creators table
SELECT COUNT(*) as total_creators FROM bullrhun_token_creators;

SELECT 'Enhanced schema test completed successfully!' as final_status;