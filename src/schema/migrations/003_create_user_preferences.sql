-- Create bullrhun_user_preferences table
-- Stores user preferences for theme, language, notifications, and other settings

CREATE TABLE IF NOT EXISTS bullrhun_user_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_address text NOT NULL,
    preference_key text NOT NULL,
    preference_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address) ON DELETE CASCADE,
    UNIQUE(user_wallet_address, preference_key)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_preferences_user_wallet ON bullrhun_user_preferences(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_preferences_key ON bullrhun_user_preferences(preference_key);

-- Add table comment
COMMENT ON TABLE bullrhun_user_preferences IS 'User preferences including theme, language, notification settings, and other customizable options';

-- Insert default preferences for existing users (optional - can be handled in application code)
-- This will be handled when users first access preferences