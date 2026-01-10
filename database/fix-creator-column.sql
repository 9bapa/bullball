-- Fix missing creator column in bullrhun_tokens
ALTER TABLE bullrhun_tokens ADD COLUMN IF NOT EXISTS creator VARCHAR(255);

-- Verify the fix
SELECT 'Added missing creator column to bullrhun_tokens' as result,
       now() as fix_time;