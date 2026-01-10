-- Remove the redundant plain users table
DROP TABLE IF EXISTS users CASCADE;

-- Verify removal
SELECT 
    'Redundant users table removed' as action,
    COUNT(*) as remaining_user_tables
FROM information_schema.tables 
WHERE table_name LIKE '%users%' 
  AND table_schema = 'public'
  AND table_name != 'bullrhun_users';