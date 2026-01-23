-- Add points and redemptions columns to bullrhun_users table
-- Run this script to update existing database

-- Add points column
ALTER TABLE public.bullrhun_users 
ADD COLUMN points integer DEFAULT 0;

-- Add redemptions column  
ALTER TABLE public.bullrhun_users 
ADD COLUMN redemptions integer DEFAULT 0;

-- Add check constraints to ensure non-negative values
ALTER TABLE public.bullrhun_users 
ADD CONSTRAINT users_points_check CHECK (points >= 0);

ALTER TABLE public.bullrhun_users 
ADD CONSTRAINT users_redemptions_check CHECK (redemptions >= 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bullrhun_users_points ON public.bullrhun_users(points);
CREATE INDEX IF NOT EXISTS idx_bullrhun_users_redemptions ON public.bullrhun_users(redemptions);

-- Optional: Update existing users with some default points (uncomment if needed)
-- UPDATE public.bullrhun_users 
-- SET points = 100, redemptions = 0 
-- WHERE points IS NULL OR redemptions IS NULL;

COMMIT;